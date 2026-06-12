const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const AtsAnalysis = require("../models/AtsAnalysis");

// Helper to extract text from PDF or DOCX
const extractTextFromFile = async (filePath, mimetype) => {
  const fileExt = path.extname(filePath).toLowerCase();
  
  if (mimetype === "application/pdf" || fileExt === ".pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfInstance = new PDFParse(new Uint8Array(dataBuffer));
    const pdfData = await pdfInstance.getText();
    return pdfData.text;
  } else if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
    mimetype === "application/msword" ||
    fileExt === ".docx" ||
    fileExt === ".doc"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } else {
    throw new Error("Unsupported file format. Please upload PDF or DOCX.");
  }
};

// Fallback analysis in case Gemini API is not configured or fails
const fallbackAnalysis = (resumeText, requiredSkills, companyName = "", jobRole = "") => {
  const text = resumeText.toLowerCase();
  
  // 1. Skills match (40%)
  const matchedSkills = [];
  const missingSkills = [];
  
  requiredSkills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    // Simple match check
    if (text.includes(skillLower)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });
  
  const skillsScore = requiredSkills.length > 0 
    ? (matchedSkills.length / requiredSkills.length) * 40 
    : 40; // Full score if no required skills specified
    
  // 2. Keywords match (20%)
  let keywordsScore = 0;
  const keywordsToCheck = [
    jobRole && typeof jobRole === "string" ? jobRole.toLowerCase() : "",
    companyName && typeof companyName === "string" ? companyName.toLowerCase() : "",
    "developer", "engineer", "designer", "analyst", "manager", "intern",
    "software", "web", "frontend", "backend", "fullstack", "data", "cloud"
  ].filter(Boolean);
  
  let keywordMatches = 0;
  keywordsToCheck.forEach(kw => {
    if (text.includes(kw)) keywordMatches++;
  });
  
  keywordsScore = keywordsToCheck.length > 0
    ? Math.min((keywordMatches / keywordsToCheck.length) * 20, 20)
    : 15;

  // 3. Projects Section (15%)
  const hasProjects = text.includes("project") || text.includes("portfolio") || text.includes("personal work");
  const projectsScore = hasProjects ? 15 : 0;

  // 4. Experience Section (10%)
  const hasExperience = text.includes("experience") || text.includes("employment") || text.includes("work history") || text.includes("internship");
  const experienceScore = hasExperience ? 10 : 0;

  // 5. Education Section (10%)
  const hasEducation = text.includes("education") || text.includes("university") || text.includes("college") || text.includes("degree") || text.includes("btech") || text.includes("b.tech") || text.includes("mca") || text.includes("bca");
  const educationScore = hasEducation ? 10 : 0;

  // 6. Resume Formatting (5%)
  // Simple check for contact details to assume basic formatting/completeness
  const hasEmail = text.includes("@") && (text.includes(".com") || text.includes(".org") || text.includes(".edu") || text.includes(".in"));
  const hasPhone = /\+?\d{10,12}/.test(text.replace(/[-\s()]/g, ""));
  const formattingScore = (hasEmail && hasPhone) ? 5 : 2;

  const totalScore = Math.round(skillsScore + keywordsScore + projectsScore + experienceScore + educationScore + formattingScore);

  // Mistakes detection
  const mistakes = [];
  if (!text.includes("linkedin.com")) mistakes.push("Missing LinkedIn profile link");
  if (!text.includes("github.com")) mistakes.push("Missing GitHub profile link");
  if (!hasProjects) mistakes.push("No projects section detected");
  if (!hasExperience) mistakes.push("No work experience or internship section detected");
  if (!text.includes("certification") && !text.includes("certificate")) mistakes.push("No certifications section detected");
  if (!hasEmail) mistakes.push("Missing contact email address");
  if (!hasPhone) mistakes.push("Missing contact phone number");
  if (text.length < 500) mistakes.push("Resume content is extremely short (under 500 characters)");

  // Suggestions
  const suggestions = [];
  if (missingSkills.length > 0) {
    suggestions.push(`Add missing technical skills relevant to the role: ${missingSkills.slice(0, 3).join(", ")}`);
  }
  if (!text.includes("linkedin.com")) {
    suggestions.push("Create a professional LinkedIn profile and place the URL in your contact header.");
  }
  if (!text.includes("github.com") && (jobRole.toLowerCase().includes("developer") || jobRole.toLowerCase().includes("engineer") || text.includes("code"))) {
    suggestions.push("Include a link to your GitHub profile to showcase your coding projects.");
  }
  if (!hasProjects) {
    suggestions.push("Add a 'Projects' section highlighting 2-3 technical projects with detailed descriptions.");
  } else {
    suggestions.push("Enhance project descriptions using action verbs (e.g., 'Developed', 'Optimized') and quantify results.");
  }
  if (!hasExperience) {
    suggestions.push("If you lack professional experience, list academic projects, freelance work, or open-source contributions.");
  }
  if (!text.includes("certification")) {
    suggestions.push("Earn and list certifications relevant to your desired job profile (e.g. AWS, React, Google Analytics).");
  }

  const overallFeedback = `Based on a local keyword analysis, your resume scores ${totalScore}/100. ${
    totalScore >= 75 
      ? "You have a strong match! Focus on adding measurable outcomes to your projects to further stand out." 
      : totalScore >= 60 
        ? "Your resume has a decent base, but it needs optimization. Add missing keywords and ensure links (LinkedIn/GitHub) are clickable." 
        : "Your resume requires significant improvement. Please update your skills stack and add detailed project/experience sections."
  }`;

  return {
    atsScore: totalScore,
    matchedSkills,
    missingSkills,
    mistakes,
    suggestions,
    overallFeedback
  };
};

// Route 1: Upload and parse PDF/DOCX to plain text
exports.parse = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const filePath = req.file.path;
    const mimetype = req.file.mimetype;
    
    const text = await extractTextFromFile(filePath, mimetype);

    // Clean up file from server to avoid storage leak
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    res.json({
      text: text.trim(),
      filename: req.file.originalname
    });
  } catch (err) {
    // Delete file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
  }
};

// Route 2: Analyze resume text and save results
exports.analyze = async (req, res) => {
  try {
    const { companyName, jobRole, requiredSkills, resumeText } = req.body;
    
    if (!resumeText) {
      return res.status(400).json({ msg: "Resume text content is required" });
    }

    const skillsArray = Array.isArray(requiredSkills) 
      ? requiredSkills 
      : typeof requiredSkills === "string"
        ? requiredSkills.split(",").map(s => s.trim()).filter(Boolean)
        : [];

    let result;

    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use gemini-1.5-flash as default fast and reliable model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are an advanced Applicant Tracking System (ATS) Resume Analyzer.
Your task is to analyze the provided resume text against the job requirements and return a detailed, professional evaluation in JSON format.

Job context details:
- Target Company: ${companyName || "Not specified"}
- Target Job Role: ${jobRole || "Not specified"}
- Required Skills: ${JSON.stringify(skillsArray)}

Resume Text to analyze:
${resumeText}

SCORING CRITERIA:
Compute an ATS score out of 100 based on:
1. Skills Match (40%): The presence of required technical skills.
2. Keywords Match (20%): Matching job-specific and industry terms.
3. Projects Section (15%): The presence and description of detailed projects.
4. Experience Section (10%): The presence of work or internships.
5. Education Section (10%): Academic degree alignment.
6. Resume Formatting (5%): Basic contact layout, presence of LinkedIn/GitHub links, and overall structure.

RESPONSE FORMAT:
You MUST return ONLY a JSON object with the exact fields specified below. Do not wrap in markdown \`\`\`json blocks.
Schema:
{
  "atsScore": number (0 to 100),
  "matchedSkills": [string] (only required skills that are found in the resume),
  "missingSkills": [string] (required skills that are NOT found in the resume),
  "mistakes": [string] (specific mistakes: missing contact info, missing linkedin/github link, no projects, weak verbs, no achievements, etc.),
  "suggestions": [string] (specific, actionable tips like "Add Git skill", "Quantify project outcomes using metrics", etc.),
  "overallFeedback": string (professional review and score explanation)
}
        `;

        const response = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        });

        let textResult = response.response.text().trim();
        // Strip out markdown code fences if they are returned by Gemini
        if (textResult.startsWith("```")) {
          textResult = textResult.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
        }
        result = JSON.parse(textResult);

        // Normalize if model returned nested structures
        if (result.atsScore === undefined) {
          throw new Error("Invalid format from Gemini");
        }
      } catch (geminiErr) {
        console.error("Gemini API error, using local fallback analyzer:", geminiErr);
        result = fallbackAnalysis(resumeText, skillsArray, companyName, jobRole);
      }
    } else {
      console.log("No GEMINI_API_KEY found. Running local fallback analyzer.");
      result = fallbackAnalysis(resumeText, skillsArray, companyName, jobRole);
    }

    // Save to Database
    const analysis = await AtsAnalysis.create({
      user: req.userId,
      companyName: companyName || "",
      jobRole: jobRole || "",
      requiredSkills: skillsArray,
      resumeName: req.body.resumeName || "Uploaded Resume",
      resumeText,
      atsScore: result.atsScore,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      mistakes: result.mistakes,
      suggestions: result.suggestions,
      overallFeedback: result.overallFeedback
    });

    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Route 3: Fetch history of analyses for the logged-in user
exports.getHistory = async (req, res) => {
  try {
    const history = await AtsAnalysis.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Route 4: Delete a specific analysis record
exports.deleteAnalysis = async (req, res) => {
  try {
    const analysis = await AtsAnalysis.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!analysis) {
      return res.status(404).json({ msg: "Analysis record not found" });
    }
    res.json({ msg: "Analysis record deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
