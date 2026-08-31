export async function protect(req, res, next) {
  try {
    const token = req.cookies?.settleaiToken;

    console.log(
      "[AUTH] Cookie received:",
      token ? "YES" : "NO"
    );

    if (!token) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id)
      .select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    next();
  } catch (error) {
    console.error("[AUTH] Error:", error.message);

    return res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
}