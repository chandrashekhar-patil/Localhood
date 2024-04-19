const express = require("express");
const mysql = require("mysql");
const router = express.Router();
const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "issc@123",
  database: "localhood",
});
// Handle database connection errors
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1); // Exit the process if unable to connect to the database
  }
  console.log("MySQL connected..search");
});
// Serve static images
app.use("/img", express.static("img"));
router.post("/search", (req, res) => {
  const search = req.body.search;
  let sql = "SELECT * FROM Products";
  const values = [];
  if (search) {
    sql += `
      WHERE brand LIKE ? 
      OR title LIKE ?
      OR price LIKE ?
      OR category LIKE ?
    `;
    // Sanitize user input
    const searchPattern = `%${search}%`;
    values.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      res.status(500).json({ success: false, msg: "Internal Server Error" });
      return;
    }
    if (result.length > 0) {
      res.status(200).send({ success: true, msg: "Products Details", data: result });
    } else {
      res.status(404).json({ success: false, msg: "No products found" });
    }
  });
});

module.exports = router;