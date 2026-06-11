const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Load env from root directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("./database/db");
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/backend/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/internships", require("./routes/internship.routes"));
app.use("/api/apply", require("./routes/application.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/ats", require("./routes/ats.routes"));

app.get("/", (req,res)=>{
  res.send("Internify Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);
});

