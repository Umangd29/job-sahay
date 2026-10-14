
const jwt = require("jsonwebtoken");
const Blacklist = require("../models/blacklist.model");
const User = require("../models/user.model");

/**
 * Authentication middleware
 * 1. Reads JWT from an HTTP-only cookie or Bearer header.
 * 2. Verifies the JWT secret and token.
 * 3. Checks whether the token has been revoked.
 * 4. Verifies that the user still exists.
 * 5. Attaches safe user details to req.user.
 */
async function authUser(req, res, next) {
  try {
    // 1. Get token from cookie first.
    let token = req.cookies?.token;

    // Fallback: Authorization: Bearer <token>
    if (!token) {
      const authorization = req.headers.authorization;

      if (authorization) {
        const match = authorization.match(/^Bearer\s+(\S+)$/i);

        if (match) {
          token = match[1];
        }
      }
    }

    // 2. Require a token.
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    // 3. Never use a hardcoded JWT secret.
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET is missing from the environment.");

      return res.status(500).json({
        success: false,
        message: "Authentication service is not configured.",
      });
    }

    // 4. Verify token validity and signature.
    let decoded;

    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please log in again.",
        });
      }

      if (error.name === "JsonWebTokenError" ||
          error.name === "NotBeforeError") {
        return res.status(401).json({
          success: false,
          message: "Invalid authentication token.",
        });
      }

      throw error;
    }

    // Ensure the decoded payload contains a user ID.
    if (!decoded || typeof decoded === "string" || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // 5. Check whether the token has been revoked.
    const isTokenBlacklisted = await Blacklist.findOne({ token });

    if (isTokenBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please log in again.",
      });
    }

    // 6. Verify that the user still exists.
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists.",
      });
    }

    // 7. Attach only the user details needed by protected routes.
    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    return next();
  } catch (error) {
    // Let Express handle database and unexpected server errors.
    return next(error);
  }
}

module.exports = { authUser };
