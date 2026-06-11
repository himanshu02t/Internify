const Internship = require("../models/Internship");
const Application = require("../models/Application");
const sendEmail = require("../utils/mailer");

exports.addInternship = async (req, res) => {
  try {
    let skillsRequired = req.body.skillsRequired;
    if (typeof skillsRequired === "string") {
      skillsRequired = skillsRequired.split(",").map(s => s.trim()).filter(Boolean);
    } else if (!Array.isArray(skillsRequired)) {
      skillsRequired = [];
    }

    // Auto-set company name if admin belongs to a company
    const companyName = req.user.company || req.body.company;

    const internship = await Internship.create({
      ...req.body,
      company: companyName,
      skillsRequired,
      postedBy: req.userId
    });
    res.json(internship);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const adminUser = req.user;
    let query = {};

    // Filter by recruiter's company if defined
    if (adminUser.role === "recruiter" && adminUser.company) {
      const companyInternships = await Internship.find({
        company: { $regex: new RegExp("^" + adminUser.company + "$", "i") }
      });
      const internshipIds = companyInternships.map(it => it._id);
      query = { internship: { $in: internshipIds } };
    }

    const data = await Application.find(query)
      .populate("user")
      .populate({
        path: "internship",
        populate: { path: "postedBy", select: "_id name role" }
      })
      .sort({ appliedAt: -1 });

    const mappedData = data
      .filter(app => app.user && app.internship)
      .map(app => {
        const user = app.user;
        const internship = app.internship;
        const userSkills = user.skills || [];

        const matchedSkills = internship.skillsRequired.filter(skill => userSkills.includes(skill));
        const matchPercentage = internship.skillsRequired.length > 0
          ? Math.round((matchedSkills.length / internship.skillsRequired.length) * 100)
          : 0;
        const missingSkills = internship.skillsRequired.filter(skill => !userSkills.includes(skill));

        return {
          ...app.toObject(),
          matchPercentage,
          missingSkills
        };
      });

    res.json(mappedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status value" });
    }

    const existingApp = await Application.findById(req.params.id).populate("internship");
    if (!existingApp) {
      return res.status(404).json({ msg: "Application not found" });
    }

    if (!existingApp.internship) {
      return res.status(404).json({ msg: "Associated internship not found" });
    }

    const postedByUserId = existingApp.internship.postedBy;
    const isOwner = postedByUserId && postedByUserId.toString() === req.userId.toString();

    if (!isOwner) {
      return res.status(403).json({ msg: "Only the recruiter/admin who posted the internship can update candidate status" });
    }

    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user").populate("internship");

    if (!app) {
      return res.status(404).json({ msg: "Application not found" });
    }

    const user = app.user;
    const internship = app.internship;
    let matchPercentage = 0;
    let missingSkills = [];

    if (user && internship) {
      const userSkills = user.skills || [];
      const matchedSkills = internship.skillsRequired.filter(skill => userSkills.includes(skill));
      matchPercentage = internship.skillsRequired.length > 0
        ? Math.round((matchedSkills.length / internship.skillsRequired.length) * 100)
        : 0;
      missingSkills = internship.skillsRequired.filter(skill => !userSkills.includes(skill));
    }

    if (status === "Accepted" && req.body.emailSubject && req.body.emailBody && user) {
      sendEmail(user.email, req.body.emailSubject, req.body.emailBody);
    }

    res.json({
      ...app.toObject(),
      matchPercentage,
      missingSkills
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteInternship = async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ msg: "Only Developer Admin can delete internships" });
    }
    const internship = await Internship.findByIdAndDelete(req.params.id);
    if (!internship) {
      return res.status(404).json({ msg: "Internship not found" });
    }
    // Also delete any applications associated with this internship
    await Application.deleteMany({ internship: req.params.id });
    res.json({ msg: "Internship deleted successfully", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
