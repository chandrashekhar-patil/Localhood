const express = require("express"); 
const path = require("path"); 
const mysql = require("mysql");
const router = express.Router();
const app = express();
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "issc@123",
  database: "localhood",
});
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("MySQL connected..id");
});
app.use("/img", express.static("img"));
router.get("/product", (req, res) => {
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ success: false, msg: "ID parameter is required" });
  }
  const sql = "SELECT * FROM Products WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
    if (result.length > 0) {
      res.status(200).json({ success: true, msg: "Product Details", data: result[0] });
    } else {
      res.status(404).json({ success: false, msg: "No product found with the given ID" });
    }
  });
});
module.exports = router;