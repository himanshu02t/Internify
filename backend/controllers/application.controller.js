const Application = require("../models/Application");

exports.apply = async (req, res) => {
  try {
    if (req.userRole === "admin") {
      return res.status(403).json({ msg: "Employers/Admins cannot apply for internships" });
    }
    const existing = await Application.findOne({
      user: req.userId,
      internship: req.body.internshipId
    });
    if (existing) {
      return res.status(400).json({ msg: "You have already applied for this internship" });
    }
    const app = await Application.create({
      user: req.userId,
      internship: req.body.internshipId
    });
    res.json(app);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserApplications = async (req, res) => {
  try {
    const apps = await Application.find({ user: req.userId })
      .populate("internship")
      .sort({ appliedAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
