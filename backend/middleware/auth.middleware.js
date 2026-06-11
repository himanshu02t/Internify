const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ msg: "User not found" });

    req.userId = user._id;
    req.userRole = user.role;
    req.userSkills = user.skills || [];
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

