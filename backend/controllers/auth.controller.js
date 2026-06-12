const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/mailer");

exports.signup = async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    let skills = req.body.skills;
    if (typeof skills === "string") {
      skills = skills.split(",").map(s => s.trim()).filter(Boolean);
    }
    const user = await User.create({ ...req.body, password: hashed, skills });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }
    const resumePath = `backend/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { resumeUrl: resumePath },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    let skills = req.body.skills;
    if (typeof skills === "string") {
      skills = skills.split(",").map(s => s.trim()).filter(Boolean);
    } else if (!Array.isArray(skills)) {
      skills = [];
    }
    const updateFields = {};
    if (req.body.name !== undefined) updateFields.name = req.body.name;
    if (req.body.bio !== undefined) updateFields.bio = req.body.bio;
    if (req.body.company !== undefined) updateFields.company = req.body.company;
    if (req.body.skills !== undefined || req.body.skills === undefined) {
      // Always update skills if provided, or default to parsed value
      updateFields.skills = skills;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleRole = async (req, res) => {
  return res.status(400).json({ msg: "Role changes are not allowed after registration." });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ msg: "Please provide an email address." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User does not exist with this email." });
    }

    // Generate a 6-digit numeric token
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // Set token expiration (15 minutes from now)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Send reset email
    const subject = "Password Reset Token - Internify";
    const text = `Hello ${user.name},

You requested a password reset for your Internify account.

Your password reset token is: ${token}

This token is valid for 15 minutes. If you did not request this, please ignore this email.`;

    const emailRes = await sendEmail(user.email, subject, text);
    
    if (emailRes.success) {
      if (emailRes.previewUrl) {
        return res.json({ 
          msg: "Password reset token sent (Simulated).", 
          simulated: true, 
          previewUrl: emailRes.previewUrl 
        });
      }
      return res.json({ msg: "Password reset token sent to your email." });
    } else {
      return res.status(500).json({ msg: "Failed to send reset email. " + emailRes.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ msg: "Please provide all required fields." });
    }

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired reset token." });
    }

    // Hash the new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    
    // Clear token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: "Password reset successful! You can now log in." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
