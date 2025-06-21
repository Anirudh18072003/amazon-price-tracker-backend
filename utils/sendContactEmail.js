const nodemailer = require("nodemailer");

const sendContactEmail = async ({ name, email, subject, message, rating }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.EMAIL_USER, // send to your own inbox
    subject: `📩 New Contact Message: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 10px;">
        <h2>📬 New Contact/Feedback</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Rating:</strong> ${rating || "N/A"}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendContactEmail;
