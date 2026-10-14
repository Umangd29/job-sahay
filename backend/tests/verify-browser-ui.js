const fs = require("node:fs");
const path = require("node:path");
const puppeteer = require("../../../resume genai project/my-project/Backend/node_modules/puppeteer");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../src/models/user.model");
const { JobApplication } = require("../src/models/jobApplication.model");
const connectToDB = require("../src/config/database");

async function runBrowserVerification() {
  console.log("Connecting to DB to seed browser UI verification data...");
  await connectToDB();

  const screenshotsDir = path.join(__dirname, "../../screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 1. Seed demo user
  const email = "sam_lee@eztrackr.io";
  const password = "Password123!";
  const username = "Sam Lee";

  await User.deleteMany({ email });
  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    password: hashedPassword
  });

  // 2. Seed realistic applications matching screenshot
  await JobApplication.deleteMany({ userId: user._id });
  const apps = [
    { companyName: "Microsoft", jobTitle: "Lead Software Engineer", applicationDate: new Date("2026-06-23"), status: "Applied", notes: "California, USA" },
    { companyName: "Oracle", jobTitle: "Senior Cloud Architect", applicationDate: new Date("2026-08-04"), status: "Applied", notes: "Remote, Worldwide" },
    { companyName: "Google", jobTitle: "Product Manager", applicationDate: new Date("2026-09-15"), status: "Applied", notes: "New York, USA" },
    { companyName: "Amazon", jobTitle: "Data Scientist", applicationDate: new Date("2026-10-12"), status: "Applied", notes: "Seattle, USA" },
    { companyName: "Facebook", jobTitle: "UX Designer", applicationDate: new Date("2026-11-01"), status: "Applied", notes: "Menlo Park, USA" },
    { companyName: "Tesla", jobTitle: "Electrical Engineer", applicationDate: new Date("2026-12-05"), status: "Applied", notes: "Austin, USA" },
    { companyName: "Spotify", jobTitle: "Product Designer", applicationDate: new Date("2026-01-15"), status: "Interview", notes: "Stockholm, Sweden" },
    { companyName: "Adobe", jobTitle: "Visual Designer", applicationDate: new Date("2026-03-22"), status: "Interview", notes: "INTERVIEWER WAS NICE" },
    { companyName: "Stripe", jobTitle: "Staff Backend Engineer", applicationDate: new Date("2026-04-10"), status: "Offer", notes: "Dublin Office" },
    { companyName: "Meta", jobTitle: "Mobile Developer", applicationDate: new Date("2026-02-18"), status: "Rejected", notes: "Applied via referral" }
  ];

  for (const item of apps) {
    await JobApplication.create({ ...item, userId: user._id });
  }
  console.log("Seeded demo user and applications.");

  // 3. Launch Puppeteer browser
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  // Desktop Viewport
  await page.setViewport({ width: 1280, height: 800 });
  console.log("Navigating to http://localhost:5173/login...");
  await page.goto("http://localhost:5173/login", { waitUntil: "networkidle2" });

  // Fill in credentials and submit
  await page.type("#email", email);
  await page.type("#password", password);
  await page.click('button[type="submit"]');

  // Wait for board navigation
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  console.log("Logged in successfully. On URL:", page.url());

  // Wait for applications to render
  await page.waitForSelector(".kanban-board", { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1000)); // Allow animations to settle

  // Capture Desktop Screenshot
  const desktopPath = path.join(screenshotsDir, "dashboard-desktop.png");
  await page.screenshot({ path: desktopPath, fullPage: false });
  console.log("Saved desktop screenshot to:", desktopPath);

  // Test opening Add Job Modal
  await page.click(".btn-add-job");
  await page.waitForSelector(".modal-dialog", { timeout: 5000 });
  const modalPath = path.join(screenshotsDir, "dashboard-modal.png");
  await page.screenshot({ path: modalPath, fullPage: false });
  console.log("Saved modal screenshot to:", modalPath);

  // Close modal
  await page.click(".btn-close");
  await new Promise((r) => setTimeout(r, 500));

  // Tablet Viewport
  await page.setViewport({ width: 768, height: 1024 });
  await new Promise((r) => setTimeout(r, 500));
  const tabletPath = path.join(screenshotsDir, "dashboard-tablet.png");
  await page.screenshot({ path: tabletPath, fullPage: false });
  console.log("Saved tablet screenshot to:", tabletPath);

  // Mobile Viewport
  await page.setViewport({ width: 375, height: 667 });
  await new Promise((r) => setTimeout(r, 500));
  const mobilePath = path.join(screenshotsDir, "dashboard-mobile.png");
  await page.screenshot({ path: mobilePath, fullPage: false });
  console.log("Saved mobile screenshot to:", mobilePath);

  await browser.close();
  await mongoose.disconnect();
  console.log("ALL BROWSER UI VERIFICATIONS COMPLETED SUCCESSFULLY!");
}

runBrowserVerification().catch((err) => {
  console.error("Browser verification error:", err);
  process.exit(1);
});
