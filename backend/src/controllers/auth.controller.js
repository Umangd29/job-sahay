
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const Blacklist = require("../models/blacklist.model");

// JWT configuration
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing from environment variables");
  }

  return secret;
};

// Cookie configuration
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  };
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId.toString() },
    getJwtSecret(),
    { expiresIn: "1d" }
  );
};

// Public user information
const formatUser = (user) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
});

// POST /api/auth/register
async function registerUserController(req, res) {
  try {
    const { username, email, password } = req.body || {};

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and password are required",
      });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedUsername || !trimmedEmail || !password.trim()) {
      return res.status(400).json({
        success: false,
        message: "Fields cannot be empty",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check for an existing user
    const existingUser = await User.findOne({
      $or: [
        { username: trimmedUsername },
        { email: trimmedEmail },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === trimmedEmail
            ? "An account with this email already exists"
            : "An account with this username already exists",
      });
    }

    // Check configuration before creating the account
    getJwtSecret();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    res.cookie("token", token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists",
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
}

// POST /api/auth/login
async function loginUserController(req, res) {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: trimmedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
}

// POST /api/auth/logout
async function logoutUserController(req, res) {
  try {
    let token = req.cookies?.token;

    if (!token) {
      const authorization = req.headers.authorization;

      const match =
        typeof authorization === "string"
          ? authorization.match(/^Bearer\s+(\S+)$/i)
          : null;

      if (match) {
        token = match[1];
      }
    }

    if (token) {
      // Validate before storing in blacklist
      let decoded = null;

      try {
        decoded = jwt.verify(token, getJwtSecret());
      } catch (error) {
        // Expired or invalid tokens need not be blacklisted.
      }

      if (decoded) {
        await Blacklist.findOneAndUpdate(
          { token },
          { $setOnInsert: { token } },
          {
            upsert: true,
            returnDocument: "after",
          }
        );
      }
    }

    const cookieOptions = getCookieOptions();

    delete cookieOptions.maxAge;

    res.clearCookie("token", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
}

// GET /api/auth/get-me
async function getMeController(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(
      req.user.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("GetMe error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
};
