const mongoose = require("mongoose");

const atsAnalysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  companyName: { type: String, default: "" },
  jobRole: { type: String, default: "" },
  requiredSkills: [String],
  resumeName: { type: String, required: true },
  resumeText: { type: String, required: true },
  atsScore: { type: Number, required: true },
  matchedSkills: [String],
  missingSkills: [String],
  mistakes: [String],
  suggestions: [String],
  overallFeedback: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AtsAnalysis", atsAnalysisSchema);
