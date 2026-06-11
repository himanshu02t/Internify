const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    let transporter;

    // Check if custom SMTP credentials are provided in .env
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const isGmail = (process.env.SMTP_HOST || "").includes("gmail.com") || 
                      (!process.env.SMTP_HOST && process.env.SMTP_USER.includes("gmail.com"));

      if (isGmail) {
        // Use Nodemailer's built-in Gmail service wrapper for maximum reliability
        transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        // Use generic SMTP configuration
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports (like 587)
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      }
      
      const info = await transporter.sendMail({
        from: `"Internify Portal" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
      });

      console.log(`✉️ Real Email Sent Successfully to ${to}! Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      // Fallback: Create Ethereal test account for development
      console.log("No SMTP credentials found in .env. Creating a temporary Ethereal test email account...");
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await transporter.sendMail({
        from: '"Internify Portal" <no-reply@internify.com>',
        to,
        subject,
        text,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("\n========================================================================");
      console.log(`✉️ SIMULATED EMAIL SENT TO STUDENT: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log("------------------------------------------------------------------------");
      console.log(text);
      console.log("------------------------------------------------------------------------");
      console.log(`🔗 VIEW SENT EMAIL ONLINE: ${previewUrl}`);
      console.log("========================================================================\n");

      return { success: true, previewUrl };
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
