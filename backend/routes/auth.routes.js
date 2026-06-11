const r = require("express").Router();
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const c = require("../controllers/auth.controller");

r.post("/signup", c.signup);
r.post("/login", c.login);
r.post("/forgot-password", c.forgotPassword);
r.post("/reset-password", c.resetPassword);
r.post("/resume", auth, upload.single("resume"), c.uploadResume);
r.put("/profile", auth, c.updateProfile);
r.put("/toggle-role", auth, c.toggleRole);

module.exports = r;
