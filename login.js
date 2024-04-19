const express = require("express");
const mysql = require("mysql");
const Joi = require("joi");
const bcrypt = require("bcryptjs"); // Replaced bcrypt with bcryptjs
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
    console.log("MySQL Connected..login");
  }
});
router.post("/login", async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required.",
      "string.email": "Invalid email format.",
    }),
    password: Joi.string().min(4).required().messages({
      "any.required": "Password is required.",
      "string.min": "Password must be at least 4 characters long.",
    }),
  });
  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(400).json({ error: error.details[0].message });
  }
  const { email, password } = req.body;
  const query = "SELECT * FROM customer WHERE email = ?";
  con.query(query, [email], async (err, results) => {
    if (err) {
     
      console.error("MySQL query error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (results.length === 0) {
      return res.status(400).json({ error: "Incorrect Email/Password" });
    }
    const user = results[0];
    const hashedPassword = user.password;

    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Incorrect Email/Password" });
    }
    const userId = user.id;
    const name = user.name;
    return res.status(200).json({
      status: "success",
      message: "Login successful",
      user: {
        success: true,
        id: userId,
        name: name,
        email: email,
        password: hashedPassword, // Ensure you still return the hashed password
      },
    });
  });
});
module.exports = router;
