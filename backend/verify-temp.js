const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

function request(url, method, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    };
    const req = http.request(url, options, (res) => {
      let body = "";
      res.on("data", (chunk) => body += chunk);
      res.on("end", () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });
    req.on("error", (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log("Starting verification...");

  // 1. Create a user if they don't exist by registering them
  const email = "test-forgot-" + Math.floor(Math.random() * 10000) + "@example.com";
  console.log(`Using test email: ${email}`);

  try {
    const signupRes = await request("http://localhost:5000/api/auth/signup", "POST", {
      name: "Verification Test User",
      email: email,
      password: "initialpassword123",
      role: "user"
    });
    console.log("Signup Response:", signupRes.statusCode, signupRes.data);

    if (signupRes.statusCode !== 200) {
      throw new Error("Signup failed");
    }

    // 2. Request forgot password
    const forgotRes = await request("http://localhost:5000/api/auth/forgot-password", "POST", { email });
    console.log("Forgot Password Response:", forgotRes.statusCode, forgotRes.data);

    if (forgotRes.statusCode !== 200) {
      throw new Error("Forgot Password failed");
    }

    console.log("Connecting directly to MongoDB database to retrieve the reset token...");
    dotenv.config({ path: path.resolve(__dirname, "../.env") });
    
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/internify";
    await mongoose.connect(uri);
    
    const User = require("./models/User");
    const dbUser = await User.findOne({ email });
    console.log("User retrieved from DB. Token exists:", !!dbUser.resetPasswordToken);
    
    const token = dbUser.resetPasswordToken;
    console.log("Token is:", token);
    
    // 3. Reset password
    const resetRes = await request("http://localhost:5000/api/auth/reset-password", "POST", {
      email,
      token,
      newPassword: "newsecurepassword456"
    });
    console.log("Reset Password Response:", resetRes.statusCode, resetRes.data);
    if (resetRes.statusCode !== 200) {
      throw new Error("Reset Password failed");
    }

    // 4. Try logging in with the old password (should fail)
    const loginOldRes = await request("http://localhost:5000/api/auth/login", "POST", {
      email,
      password: "initialpassword123"
    });
    console.log("Login with OLD Password (expected to fail):", loginOldRes.statusCode, loginOldRes.data);

    // 5. Try logging in with the new password (should succeed)
    const loginNewRes = await request("http://localhost:5000/api/auth/login", "POST", {
      email,
      password: "newsecurepassword456"
    });
    console.log("Login with NEW Password (expected to succeed):", loginNewRes.statusCode, !!loginNewRes.data.token);

    // Cleanup database
    await User.deleteOne({ email });
    console.log("Cleaned up test user from DB.");
    await mongoose.disconnect();

    if (loginNewRes.statusCode === 200 && loginNewRes.data.token) {
      console.log("\n✅ VERIFICATION SUCCESSFUL!");
    } else {
      console.log("\n❌ VERIFICATION FAILED!");
    }
  } catch (err) {
    console.error("Error during verification script execution:", err);
  }
}

run();
