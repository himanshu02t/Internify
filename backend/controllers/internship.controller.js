const Internship = require("../models/Internship");

exports.getAll = async (req, res) => {
  try {
    const internships = await Internship.find().sort({ postedAt: -1 });
    const user = req.user;
    const userSkills = user.skills || [];
    const data = internships.map(internship => {
      const matchedSkills = internship.skillsRequired.filter(skill => userSkills.includes(skill));
      const matchPercentage = internship.skillsRequired.length > 0
        ? Math.round((matchedSkills.length / internship.skillsRequired.length) * 100)
        : 0;
      const missingSkills = internship.skillsRequired.filter(skill => !userSkills.includes(skill));
      return {
        ...internship.toObject(),
        matchPercentage,
        missingSkills
      };
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.recommend = async (req, res) => {
  try {
    const internships = await Internship.find();
    const user = req.user;
    const userSkills = user.skills || [];
    const recommended = internships
      .map(internship => {
        const matchedSkills = internship.skillsRequired.filter(skill => userSkills.includes(skill));
        const matchPercentage = internship.skillsRequired.length > 0
          ? Math.round((matchedSkills.length / internship.skillsRequired.length) * 100)
          : 0;
        const missingSkills = internship.skillsRequired.filter(skill => !userSkills.includes(skill));
        return {
          ...internship.toObject(),
          matchPercentage,
          missingSkills
        };
      })
      .filter(item => item.matchPercentage > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
    res.json(recommended);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
