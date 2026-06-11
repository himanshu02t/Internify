const r = require("express").Router();
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const c = require("../controllers/admin.controller");

r.post("/internship", auth, admin, c.addInternship);
r.get("/applications", auth, admin, c.getApplications);
r.put("/applications/:id/status", auth, admin, c.updateApplicationStatus);
r.delete("/internship/:id", auth, admin, c.deleteInternship);

module.exports = r;
