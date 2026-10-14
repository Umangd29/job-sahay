const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const app = require("../src/app");
const connectToDB = require("../src/config/database");

test("Phase 1: Express App boots and responds to /health", async (t) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    assert.strictEqual(res.status, 200);

    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.message, "AI Job Tracker API is operational");
    assert.ok(data.timestamp);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("Phase 1: Database configuration module is valid", (t) => {
  assert.strictEqual(typeof connectToDB, "function");
});
