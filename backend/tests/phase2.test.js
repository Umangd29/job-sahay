const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const mongoose = require("mongoose");
require("dotenv").config();

const app = require("../src/app");
const connectToDB = require("../src/config/database");
const User = require("../src/models/user.model");
const { JobApplication } = require("../src/models/jobApplication.model");
const Blacklist = require("../src/models/blacklist.model");

let server;
let baseUrl;


test.before(async () => {
  const testMongoUri = process.env.TEST_MONGODB_URI;

  if (!testMongoUri) {
    throw new Error(
      "TEST_MONGODB_URI is missing. Configure a separate test database in backend/.env."
    );
  }

  // Allow only a database whose name explicitly includes "test".
  const databaseName = new URL(testMongoUri).pathname
    .replace(/^\/+/, "")
    .split("?")[0];

  if (!/(^|[-_])test($|[-_])/i.test(databaseName)) {
    throw new Error(
      `Unsafe test database "${databaseName}". Use a database name such as ai_job_tracker_test.`
    );
  }

  process.env.MONGODB_URI = testMongoUri;

  await connectToDB();

// Start the Express app on an available port.
  server = http.createServer(app);

  await new Promise((resolve, reject) => {
    server.once("error", reject);

    server.listen(0, "127.0.0.1", () => {
      server.removeListener("error", reject);
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      console.log("Phase 2 test server:", baseUrl);
      resolve();
    });
  });

  // Do not delete existing users, applications, or blacklist records here.
});

test.after(async () => {
  try {
    // Find only users created by this test suite.
    const testUsers = await User.find(
      { email: { $regex: "^test_phase2_" } },
      { _id: 1 }
    ).lean();

    const testUserIds = testUsers.map((user) => user._id);

    // Delete only applications belonging to these test users.
    if (testUserIds.length > 0) {
      await JobApplication.deleteMany({
        userId: { $in: testUserIds },
      });

      await User.deleteMany({
        _id: { $in: testUserIds },
      });
    }
  } finally {
    await mongoose.disconnect();

    if (server?.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  }
});

test("Phase 2: Auth - Register, duplicate prevention, and validation", async () => {
  // Test invalid input (missing fields)
  const invalidRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "", email: "", password: "" })
  });
  assert.strictEqual(invalidRes.status, 400);

  // Test successful registration User A
  const validUserA = {
    username: "user_a_tester",
    email: "test_phase2_usera@example.com",
    password: "Password123!"
  };
  const regResA = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validUserA)
  });
  assert.strictEqual(regResA.status, 201);
  const dataA = await regResA.json();
  assert.strictEqual(dataA.success, true);
  assert.strictEqual(dataA.user.username, validUserA.username);
  assert.ok(dataA.token);

  // Test duplicate registration rejected
  const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validUserA)
  });
  assert.strictEqual(dupRes.status, 400);
});

test("Phase 2: Auth - Login, invalid password, session check, and logout with blacklist", async () => {
  const credentials = {
    email: "test_phase2_usera@example.com",
    password: "Password123!"
  };

  // Invalid password
  const failLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: credentials.email, password: "WrongPassword" })
  });
  assert.strictEqual(failLogin.status, 401);

  // Successful login
  const successLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });
  assert.strictEqual(successLogin.status, 200);
  const loginData = await successLogin.json();
  const token = loginData.token;
  assert.ok(token);

  // Session check with token
  const getMeRes = await fetch(`${baseUrl}/api/auth/get-me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(getMeRes.status, 200);
  const meData = await getMeRes.json();
  assert.strictEqual(meData.user.email, credentials.email);

  // Logout and blacklist token
  const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(logoutRes.status, 200);

  // Request with revoked/blacklisted token should now fail with 401
  const revokedRes = await fetch(`${baseUrl}/api/auth/get-me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(revokedRes.status, 401);
});

test("Phase 2: Applications - Unauthenticated requests rejected", async () => {
  const res = await fetch(`${baseUrl}/api/applications`);
  assert.strictEqual(res.status, 401);

  const statsRes = await fetch(`${baseUrl}/api/applications/stats`);
  assert.strictEqual(statsRes.status, 401);
});

test("Phase 2: Applications - Complete CRUD, Status updates, and Stats calculation", async () => {
  // Register a dedicated active user
  const user = {
    username: "app_tester_user",
    email: "test_phase2_apptester@example.com",
    password: "Password123!"
  };
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  });
  const { token } = await regRes.json();
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  // Initial stats should all be 0
  const initStatsRes = await fetch(`${baseUrl}/api/applications/stats`, { headers: authHeaders });
  const initStats = await initStatsRes.json();
  assert.strictEqual(initStats.stats.totalApplications, 0);
  assert.strictEqual(initStats.stats.interviews, 0);
  assert.strictEqual(initStats.stats.offers, 0);
  assert.strictEqual(initStats.stats.rejections, 0);

  // Create 1: Applied
  const app1Res = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      companyName: "Google",
      jobTitle: "Senior Software Engineer",
      applicationDate: "2026-08-15",
      status: "Applied",
      notes: "Referral from teammate"
    })
  });
  assert.strictEqual(app1Res.status, 201);
  const app1Data = await app1Res.json();
  const app1Id = app1Data.application._id;

  // Create 2: Interview
  const app2Res = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      companyName: "Spotify",
      jobTitle: "Product Designer",
      applicationDate: "2026-09-01",
      status: "Interview",
      notes: "Round 1 scheduled"
    })
  });
  assert.strictEqual(app2Res.status, 201);

  // Create 3: Offer
  const app3Res = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      companyName: "Adobe",
      jobTitle: "UX Engineer",
      applicationDate: "2026-07-20",
      status: "Offer",
      notes: "Offer received"
    })
  });
  assert.strictEqual(app3Res.status, 201);

  // Create 4: Rejected
  const app4Res = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      companyName: "Meta",
      jobTitle: "Frontend Architect",
      applicationDate: "2026-06-10",
      status: "Rejected",
      notes: "Position closed"
    })
  });
  assert.strictEqual(app4Res.status, 201);

  // Verify Stats: Total=4, Interviews=1, Offers=1, Rejections=1
  const statsRes = await fetch(`${baseUrl}/api/applications/stats`, { headers: authHeaders });
  const { stats } = await statsRes.json();
  assert.strictEqual(stats.totalApplications, 4);
  assert.strictEqual(stats.interviews, 1);
  assert.strictEqual(stats.offers, 1);
  assert.strictEqual(stats.rejections, 1);

  // Direct status update of App1: Change from Applied to Interview
  const statusUpdateRes = await fetch(`${baseUrl}/api/applications/${app1Id}/status`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ status: "Interview" })
  });
  assert.strictEqual(statusUpdateRes.status, 200);
  const updatedStatusData = await statusUpdateRes.json();
  assert.strictEqual(updatedStatusData.application.status, "Interview");

  // Verify updated stats: Interviews should now be 2
  const updatedStatsRes = await fetch(`${baseUrl}/api/applications/stats`, { headers: authHeaders });
  const updatedStats = (await updatedStatsRes.json()).stats;
  assert.strictEqual(updatedStats.totalApplications, 4);
  assert.strictEqual(updatedStats.interviews, 2);

  // Test full application edit
  const editRes = await fetch(`${baseUrl}/api/applications/${app1Id}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({
      companyName: "Alphabet Google",
      jobTitle: "Staff Software Engineer",
      notes: "Updated role title after interview"
    })
  });
  assert.strictEqual(editRes.status, 200);
  const editData = await editRes.json();
  assert.strictEqual(editData.application.companyName, "Alphabet Google");
  assert.strictEqual(editData.application.jobTitle, "Staff Software Engineer");
  assert.strictEqual(editData.application.status, "Interview"); // Unchanged status preserved

  // Test Delete application
  const deleteRes = await fetch(`${baseUrl}/api/applications/${app1Id}`, {
    method: "DELETE",
    headers: authHeaders
  });
  assert.strictEqual(deleteRes.status, 200);

  // Fetch deleted application should return 404
  const getDeletedRes = await fetch(`${baseUrl}/api/applications/${app1Id}`, { headers: authHeaders });
  assert.strictEqual(getDeletedRes.status, 404);

  // Verify stats after deletion: Total=3, Interviews=1
  const afterDelStatsRes = await fetch(`${baseUrl}/api/applications/stats`, { headers: authHeaders });
  const afterDelStats = (await afterDelStatsRes.json()).stats;
  assert.strictEqual(afterDelStats.totalApplications, 3);
  assert.strictEqual(afterDelStats.interviews, 1);
});

test("Phase 2: Applications - Search, Filtering, and Sorting", async () => {
  // Register dedicated user for search/filter/sort test
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "search_tester_user",
      email: "test_phase2_searchuser@example.com",
      password: "Password123!"
    })
  });
  const { token } = await regRes.json();
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  // Seed dedicated test records for search/filter/sort
  await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      companyName: "Spotify",
      jobTitle: "Product Designer",
      applicationDate: "2026-09-01",
      status: "Interview"
    })
  });
  await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      companyName: "Adobe",
      jobTitle: "UX Engineer",
      applicationDate: "2026-07-20",
      status: "Offer"
    })
  });
  await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      companyName: "Meta",
      jobTitle: "Frontend Architect",
      applicationDate: "2026-06-10",
      status: "Rejected"
    })
  });

  // Search by company: "Spotify"
  const searchRes = await fetch(`${baseUrl}/api/applications?search=spotify`, { headers: authHeaders });
  const searchData = await searchRes.json();
  assert.strictEqual(searchData.count, 1);
  assert.strictEqual(searchData.applications[0].companyName, "Spotify");

  // Search by job title: "UX"
  const searchTitleRes = await fetch(`${baseUrl}/api/applications?search=ux`, { headers: authHeaders });
  const searchTitleData = await searchTitleRes.json();
  assert.strictEqual(searchTitleData.count, 1);
  assert.strictEqual(searchTitleData.applications[0].jobTitle, "UX Engineer");

  // Filter by status: "Offer"
  const filterRes = await fetch(`${baseUrl}/api/applications?status=Offer`, { headers: authHeaders });
  const filterData = await filterRes.json();
  assert.strictEqual(filterData.count, 1);
  assert.strictEqual(filterData.applications[0].status, "Offer");

  // Sorting by applicationDate asc (oldest first: Meta was 2026-06-10)
  const sortRes = await fetch(`${baseUrl}/api/applications?sortBy=applicationDate&sortOrder=asc`, {
    headers: authHeaders
  });
  const sortData = await sortRes.json();
  assert.strictEqual(sortData.applications[0].companyName, "Meta");
});

test("Phase 2: Security - Strict Multi-User Ownership Isolation", async () => {
  // 1. Create Application under User 1
  const user1 = {
    username: "user_owner_1",
    email: "test_phase2_owner1@example.com",
    password: "Password123!"
  };
  const reg1 = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user1)
  });
  const token1 = (await reg1.json()).token;

  const appRes = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token1}`
    },
    body: JSON.stringify({
      companyName: "Private Confidential Corp",
      jobTitle: "Secret Lead",
      applicationDate: "2026-10-01",
      status: "Interview"
    })
  });
  const user1AppId = (await appRes.json()).application._id;

  // 2. Register User 2 (Attacker/Separate user)
  const user2 = {
    username: "user_attacker_2",
    email: "test_phase2_attacker2@example.com",
    password: "Password123!"
  };
  const reg2 = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user2)
  });
  const token2 = (await reg2.json()).token;
  const user2Headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token2}`
  };

  // User 2 tries to GET User 1's application by ID -> MUST return 404
  const getForbidden = await fetch(`${baseUrl}/api/applications/${user1AppId}`, {
    headers: user2Headers
  });
  assert.strictEqual(getForbidden.status, 404);

  // User 2 tries to PATCH User 1's application -> MUST return 404
  const patchForbidden = await fetch(`${baseUrl}/api/applications/${user1AppId}`, {
    method: "PATCH",
    headers: user2Headers,
    body: JSON.stringify({ companyName: "Hacked Company" })
  });
  assert.strictEqual(patchForbidden.status, 404);

  // User 2 tries to PATCH status of User 1's application -> MUST return 404
  const statusForbidden = await fetch(`${baseUrl}/api/applications/${user1AppId}/status`, {
    method: "PATCH",
    headers: user2Headers,
    body: JSON.stringify({ status: "Rejected" })
  });
  assert.strictEqual(statusForbidden.status, 404);

  // User 2 tries to DELETE User 1's application -> MUST return 404
  const deleteForbidden = await fetch(`${baseUrl}/api/applications/${user1AppId}`, {
    method: "DELETE",
    headers: user2Headers
  });
  assert.strictEqual(deleteForbidden.status, 404);

  // User 2 listing applications shows 0 records
  const listUser2 = await fetch(`${baseUrl}/api/applications`, { headers: user2Headers });
  const list2Data = await listUser2.json();
  assert.strictEqual(list2Data.count, 0);

  // User 2 stats show all 0
  const statsUser2 = await fetch(`${baseUrl}/api/applications/stats`, { headers: user2Headers });
  const stats2Data = (await statsUser2.json()).stats;
  assert.strictEqual(stats2Data.totalApplications, 0);
  assert.strictEqual(stats2Data.interviews, 0);

  // Confirm User 1's application remains unaltered
  const verifyUser1 = await fetch(`${baseUrl}/api/applications/${user1AppId}`, {
    headers: { Authorization: `Bearer ${token1}` }
  });
  assert.strictEqual(verifyUser1.status, 200);
  const verifyData = await verifyUser1.json();
  assert.strictEqual(verifyData.application.companyName, "Private Confidential Corp");
  assert.strictEqual(verifyData.application.status, "Interview");
});
