const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const c = require("../controllers/ats.controller");

router.post("/parse", auth, upload.single("resume"), c.parse);
router.post("/analyze", auth, c.analyze);
router.get("/history", auth, c.getHistory);
router.delete("/history/:id", auth, c.deleteAnalysis);

module.exports = router;
