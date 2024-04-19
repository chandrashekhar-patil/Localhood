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
    console.log("MySQL Connected..registration");
  }
});

router.post("/registration", async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "any.required": "Name is required.",
      "string.empty": "Name cannot be empty.",
    }),
    mobile_no: Joi.string()
      .pattern(/^[7-9]{1}\d{9}$/)
      .required()
      .messages({
        "any.required": "Mobile number is required.",
        "string.pattern.base":
          "Invalid mobile number format. It should start with 7, 8, or 9 followed by 10 digits.",
      }),
    email: Joi.string().email().required().messages({
      "any.required": "Email is required.",
      "string.email": "Invalid email format.",
    }),
    password: Joi.string().min(4).required().messages({
      "any.required": "Password is required.",
      "string.min": "Password must be at least 4 characters long.",
    }),
    confirm_password: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.required": "Confirm password is required.",
        "any.only": "Passwords do not match.",
      }),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { name, mobile_no, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 5); // Replaced bcrypt with bcryptjs

  con.query(
    "INSERT INTO customer (name, mobile_no, email, password) VALUES (?, ?, ?, ?)",
    [name, mobile_no, email, hashedPassword],
    (err, results) => {
      if (err) {
        if (
          err.code === "ER_DUP_ENTRY" &&
          err.sqlMessage.includes("customer.email")
        ) {
          return res
            .status(400)
            .json({
              error:
                "User already registered. Please use a different email address or registration.",
            });
        }
        console.error("MySQL error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      const userId = results.insertId;
      return res.status(200).json({
        status: "success",
        message: "Registration successful",
        user: {
          success: true,
          id: userId,
          name: name,
          email: email,
          password: hashedPassword,
        },
      });
    }
  );
});
module.exports = router;
