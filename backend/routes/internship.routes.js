const r = require("express").Router();
const auth = require("../middleware/auth.middleware");
const c = require("../controllers/internship.controller");

r.get("/", auth, c.getAll);
r.get("/recommend", auth, c.recommend);

module.exports = r;
