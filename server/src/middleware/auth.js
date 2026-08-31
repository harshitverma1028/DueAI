import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const token = req.cookies?.settleaiToken;

    console.log("========== AUTH DEBUG ==========");
    console.log(
      "Cookie received:",
      token ? "YES" : "NO"
    );

    if (!token) {
      console.log("AUTH FAILED: No cookie");
      console.log("================================");

      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("JWT decoded:", decoded);

    const user = await User.findById(decoded.id)
      .select("-password");

    console.log(
      "User found:",
      user ? "YES" : "NO"
    );

    if (!user) {
      console.log("AUTH FAILED: User not found");
      console.log("================================");

      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = {
    _id: user._id,
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
};

    console.log(
      "AUTH SUCCESS:",
      req.user.email
    );

    console.log("================================");

    next();

  } catch (error) {
    console.error(
      "AUTH ERROR:",
      error.message
    );

    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
}
