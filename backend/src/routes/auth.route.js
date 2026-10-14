
const express = require("express");
const router = express.Router();

const {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
} = require("../controllers/auth.controller");

const { authUser } = require("../middlewares/auth.middleware");

// Public routes
router.post("/register", registerUserController);
router.post("/login", loginUserController);

// Protected route: only authenticated users can log out.
router.post("/logout", authUser, logoutUserController);

// Protected route: retrieve the current user's details.
router.get("/get-me", authUser, getMeController);

module.exports = router;
