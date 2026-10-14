import test from "node:test";
import assert from "node:assert";

test("Phase 4: Client-side sorting and status partition logic", () => {
  const sampleApps = [
    { _id: "1", companyName: "Spotify", jobTitle: "Product Designer", applicationDate: "2026-09-01", status: "Interview" },
    { _id: "2", companyName: "Google", jobTitle: "Lead Software Engineer", applicationDate: "2026-08-15", status: "Applied" },
    { _id: "3", companyName: "Adobe", jobTitle: "UX Designer", applicationDate: "2026-07-20", status: "Offer" },
    { _id: "4", companyName: "Meta", jobTitle: "Frontend Architect", applicationDate: "2026-06-10", status: "Rejected" },
    { _id: "5", companyName: "Amazon", jobTitle: "Data Scientist", applicationDate: "2026-08-25", status: "Applied" }
  ];

  // 1. Status partitioning
  const buckets = { Applied: [], Interview: [], Offer: [], Rejected: [] };
  sampleApps.forEach((app) => buckets[app.status]?.push(app));

  assert.strictEqual(buckets.Applied.length, 2);
  assert.strictEqual(buckets.Interview.length, 1);
  assert.strictEqual(buckets.Offer.length, 1);
  assert.strictEqual(buckets.Rejected.length, 1);

  // 2. Sorting by date desc (newest first)
  const sortedDateDesc = [...sampleApps].sort(
    (a, b) => new Date(b.applicationDate) - new Date(a.applicationDate)
  );
  assert.strictEqual(sortedDateDesc[0].companyName, "Spotify"); // 2026-09-01
  assert.strictEqual(sortedDateDesc[4].companyName, "Meta"); // 2026-06-10

  // 3. Sorting by company A-Z
  const sortedCompany = [...sampleApps].sort((a, b) =>
    a.companyName.localeCompare(b.companyName)
  );
  assert.strictEqual(sortedCompany[0].companyName, "Adobe");
  assert.strictEqual(sortedCompany[4].companyName, "Spotify");

  // 4. Combined search and status filter
  const search = "designer";
  const filter = "Interview";
  const filtered = sampleApps.filter(
    (app) =>
      app.status === filter &&
      (app.companyName.toLowerCase().includes(search) ||
        app.jobTitle.toLowerCase().includes(search))
  );
  assert.strictEqual(filtered.length, 1);
  assert.strictEqual(filtered[0].companyName, "Spotify");
});
