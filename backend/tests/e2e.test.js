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
      console.log("E2E test server:", baseUrl);
      resolve();
    });
  });

  // Preserve existing database records.
});

test.after(async () => {
  try {
    const testUsers = await User.find(
      { email: { $regex: "^test_e2e_" } },
      { _id: 1 }
    ).lean();

    const testUserIds = testUsers.map((user) => user._id);

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

test("E2E: Complete Auth lifecycle & Cookie verification", async () => {
  // 1. Register User
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "e2e_auth_user",
      email: "test_e2e_auth@example.com",
      password: "SecurePassword123!"
    })
  });
  assert.strictEqual(regRes.status, 201);
  const regCookies = regRes.headers.get("set-cookie");
  assert.ok(regCookies && regCookies.includes("token="));

  const regData = await regRes.json();
  const token = regData.token;

  // 2. Session restoration via /api/auth/get-me with cookie
  const getMeRes = await fetch(`${baseUrl}/api/auth/get-me`, {
    headers: {
      Cookie: `token=${token}`
    }
  });
  assert.strictEqual(getMeRes.status, 200);
  const meData = await getMeRes.json();
  assert.strictEqual(meData.user.username, "e2e_auth_user");
  assert.strictEqual(meData.user.email, "test_e2e_auth@example.com");

  // 3. Logout and verify token is blacklisted
  const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: {
      Cookie: `token=${token}`
    }
  });
  assert.strictEqual(logoutRes.status, 200);

  // 4. Subsequent request with revoked cookie must return 401
  const afterLogoutRes = await fetch(`${baseUrl}/api/auth/get-me`, {
    headers: {
      Cookie: `token=${token}`
    }
  });
  assert.strictEqual(afterLogoutRes.status, 401);
});

test("E2E: Application workflows, Status transitions, and Real-time Statistics", async () => {
  // Register dedicated user for workflow testing
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "e2e_workflow_user",
      email: "test_e2e_workflow@example.com",
      password: "SecurePassword123!"
    })
  });
  assert.strictEqual(regRes.status, 201);
  const { token } = await regRes.json();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  // 1. Initial statistics: all 0
  const statsRes0 = await fetch(`${baseUrl}/api/applications/stats`, { headers });
  assert.strictEqual(statsRes0.status, 200);
  const stats0 = (await statsRes0.json()).stats;
  assert.strictEqual(stats0.totalApplications, 0);

  // 2. Create 5 sample applications across all 4 statuses
  // 2x Applied, 1x Interview, 1x Offer, 1x Rejected
  const appsToCreate = [
    { companyName: "Microsoft", jobTitle: "Lead Software Engineer", applicationDate: "2026-06-23", status: "Applied", notes: "Redmond HQ" },
    { companyName: "Oracle", jobTitle: "Senior Cloud Architect", applicationDate: "2026-08-04", status: "Applied", notes: "Cloud infra team" },
    { companyName: "Spotify", jobTitle: "Product Designer", applicationDate: "2026-01-15", status: "Interview", notes: "Round 2 portfolio" },
    { companyName: "Amazon", jobTitle: "Data Scientist", applicationDate: "2026-10-12", status: "Offer", notes: "AWS AI team" },
    { companyName: "Tesla", jobTitle: "Electrical Engineer", applicationDate: "2026-12-05", status: "Rejected", notes: "Battery systems" }
  ];

  const createdIds = [];
  for (const item of appsToCreate) {
    const res = await fetch(`${baseUrl}/api/applications`, {
      method: "POST",
      headers,
      body: JSON.stringify(item)
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    createdIds.push(data.application._id);
  }

  // 3. Verify statistics: Total=5, Interview=1, Offer=1, Rejected=1
  const statsRes1 = await fetch(`${baseUrl}/api/applications/stats`, { headers });
  assert.strictEqual(statsRes1.status, 200);
  const stats1 = (await statsRes1.json()).stats;
  assert.strictEqual(stats1.totalApplications, 5);
  assert.strictEqual(stats1.interviews, 1);
  assert.strictEqual(stats1.offers, 1);
  assert.strictEqual(stats1.rejections, 1);

  // 4. Direct status transition: Move Oracle from "Applied" to "Interview"
  const oracleId = createdIds[1];
  const updateStatusRes = await fetch(`${baseUrl}/api/applications/${oracleId}/status`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status: "Interview" })
  });
  assert.strictEqual(updateStatusRes.status, 200);

  // 5. Verify stats updated: Interviews must now be 2
  const statsRes2 = await fetch(`${baseUrl}/api/applications/stats`, { headers });
  const stats2 = (await statsRes2.json()).stats;
  assert.strictEqual(stats2.totalApplications, 5);
  assert.strictEqual(stats2.interviews, 2);
  assert.strictEqual(stats2.offers, 1);
  assert.strictEqual(stats2.rejections, 1);

  // 6. Edit application fields
  const editRes = await fetch(`${baseUrl}/api/applications/${oracleId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      jobTitle: "Principal Cloud Architect",
      notes: "Promoted scope discussed in interview"
    })
  });
  assert.strictEqual(editRes.status, 200);
  const edited = (await editRes.json()).application;
  assert.strictEqual(edited.jobTitle, "Principal Cloud Architect");
  assert.strictEqual(edited.status, "Interview"); // Preserved status

  // 7. Delete an application (Tesla - Rejected)
  const teslaId = createdIds[4];
  const delRes = await fetch(`${baseUrl}/api/applications/${teslaId}`, {
    method: "DELETE",
    headers
  });
  assert.strictEqual(delRes.status, 200);

  // 8. Verify stats after deletion: Total=4, Rejections=0
  const statsRes3 = await fetch(`${baseUrl}/api/applications/stats`, { headers });
  const stats3 = (await statsRes3.json()).stats;
  assert.strictEqual(stats3.totalApplications, 4);
  assert.strictEqual(stats3.rejections, 0);
  assert.strictEqual(stats3.interviews, 2);
});

test("E2E: Combined Search, Filtering, and Sorting verification", async () => {
  // Register dedicated user for search/filter/sort
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "e2e_search_user",
      email: "test_e2e_search@example.com",
      password: "SecurePassword123!"
    })
  });
  assert.strictEqual(regRes.status, 201);
  const { token } = await regRes.json();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  // Seed applications
  await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      companyName: "Spotify",
      jobTitle: "Product Designer",
      applicationDate: "2026-09-01",
      status: "Interview"
    })
  });
  await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      companyName: "Oracle",
      jobTitle: "Cloud Architect",
      applicationDate: "2026-08-04",
      status: "Interview"
    })
  });
  await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      companyName: "Adobe",
      jobTitle: "Visual Designer",
      applicationDate: "2026-07-20",
      status: "Offer"
    })
  });

  // 1. Search by keyword "Architect" -> Oracle
  const searchRes = await fetch(`${baseUrl}/api/applications?search=Architect`, { headers });
  assert.strictEqual(searchRes.status, 200);
  const searchData = await searchRes.json();
  assert.strictEqual(searchData.count, 1);
  assert.strictEqual(searchData.applications[0].companyName, "Oracle");

  // 2. Filter by status "Interview" -> Oracle & Spotify
  const filterRes = await fetch(`${baseUrl}/api/applications?status=Interview`, { headers });
  assert.strictEqual(filterRes.status, 200);
  const filterData = await filterRes.json();
  assert.strictEqual(filterData.count, 2);

  // 3. Combined search "Spotify" + status "Interview"
  const comboRes = await fetch(`${baseUrl}/api/applications?search=spotify&status=Interview`, { headers });
  assert.strictEqual(comboRes.status, 200);
  const comboData = await comboRes.json();
  assert.strictEqual(comboData.count, 1);
  assert.strictEqual(comboData.applications[0].companyName, "Spotify");

  // 4. Combined search with no match -> empty results array
  const emptyRes = await fetch(`${baseUrl}/api/applications?search=NonExistentCompany`, { headers });
  assert.strictEqual(emptyRes.status, 200);
  const emptyData = await emptyRes.json();
  assert.strictEqual(emptyData.count, 0);
  assert.deepStrictEqual(emptyData.applications, []);

  // 5. Sorting by company A-Z
  const sortRes = await fetch(`${baseUrl}/api/applications?sortBy=companyName&sortOrder=asc`, { headers });
  assert.strictEqual(sortRes.status, 200);
  const sortData = await sortRes.json();
  const companyNames = sortData.applications.map((a) => a.companyName);
  const expectedNames = [...companyNames].sort((a, b) => a.localeCompare(b));
  assert.deepStrictEqual(companyNames, expectedNames);
});

test("E2E: Failure Handling & Input Validation", async () => {
  // Register dedicated user for failure testing
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "e2e_fail_user",
      email: "test_e2e_fail@example.com",
      password: "SecurePassword123!"
    })
  });
  assert.strictEqual(regRes.status, 201);
  const { token } = await regRes.json();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  // Missing company name
  const badApp1 = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers,
    body: JSON.stringify({ companyName: "", jobTitle: "Engineer", applicationDate: "2026-01-01" })
  });
  assert.strictEqual(badApp1.status, 400);

  // Missing job title
  const badApp2 = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers,
    body: JSON.stringify({ companyName: "Acme", jobTitle: "   ", applicationDate: "2026-01-01" })
  });
  assert.strictEqual(badApp2.status, 400);

  // Invalid date
  const badApp3 = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers,
    body: JSON.stringify({ companyName: "Acme", jobTitle: "Engineer", applicationDate: "invalid-date" })
  });
  assert.strictEqual(badApp3.status, 400);

  // Invalid status
  const badApp4 = await fetch(`${baseUrl}/api/applications`, {
    method: "POST",
    headers,
    body: JSON.stringify({ companyName: "Acme", jobTitle: "Engineer", applicationDate: "2026-01-01", status: "NotAStatus" })
  });
  assert.strictEqual(badApp4.status, 400);

  // Invalid ObjectId format in params
  const badIdRes = await fetch(`${baseUrl}/api/applications/12345notanid`, { headers });
  assert.strictEqual(badIdRes.status, 400);

  // Non-existent valid ObjectId
  const nonExistentId = new mongoose.Types.ObjectId();
  const notFoundRes = await fetch(`${baseUrl}/api/applications/${nonExistentId}`, { headers });
  assert.strictEqual(notFoundRes.status, 404);
});
