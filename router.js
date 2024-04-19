const express = require("express");
const mysql = require("mysql");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs"); // Replaced bcrypt with bcryptjs
const crypto = require("crypto");
const Joi = require("joi");
const router = express.Router();

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "issc@123",
  database: "localhood",
});
con.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    throw err;
  } else {
    console.log("MySQL Connected..forget");
  }
});
router.post("/forget", async (req, res) => {
  const { email } = req.body;
  console.log("email : " + email);
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const token = crypto.randomBytes(20).toString("hex");
    console.log("token : " + token);

    await storeResetToken(email, token);

    const resetLink = `http://10.42.0.241:3000/Reset?tok=${token}`;
    sendResetEmail(email, resetLink);

    return res
      .status(200)
      .json({ message: "Password reset link sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/reset", async (req, res) => {
  const { token, new_password } = req.body;

  console.log(token + " " + new_password + "\n");
  try {
    const email = await getEmailByResetToken(token);
    if (!email) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await updateUserPassword(email, hashedPassword);

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM customer WHERE email = ?";
    con.query(query, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    });
  });
}
function storeResetToken(email, token) {
  return new Promise((resolve, reject) => {
    const query = "UPDATE customer SET reset_token = ? WHERE email = ?";
    con.query(query, [token, email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
function sendResetEmail(email, resetLink) {
  var transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "5a8ea02782a5cf",
      pass: "cb39e0ca36142b",
    },
  });
  const mailOptions = {
    from: "patilchandrashekhar1023@gmail.com",
    to: email,
    subject: "Password Reset Link",
    html: `<p>Please click the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}
function getEmailByResetToken(token) {
  return new Promise((resolve, reject) => {
    const query = "SELECT email FROM customer WHERE reset_token = ?";
    con.query(query, [token], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length === 0) {
          resolve(null);
        } else {
          resolve(results[0].email);
        }
      }
    });
  });
}
function updateUserPassword(email, new_password) {
  return new Promise((resolve, reject) => {
    const query =
      "UPDATE customer SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?";
    con.query(query, [new_password, email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
module.exports = router;
