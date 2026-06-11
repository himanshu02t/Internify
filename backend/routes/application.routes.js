const r = require("express").Router();
const auth = require("../middleware/auth.middleware");
const c = require("../controllers/application.controller");

r.post("/", auth, c.apply);
r.get("/", auth, c.getUserApplications);

module.exports = r;
