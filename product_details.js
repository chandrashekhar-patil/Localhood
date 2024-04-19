const express = require("express");
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
    throw err;
  }
  console.log("MySQL connected..details");
});

//app.use(express.json());
app.use("/img", express.static("img"));

router.post("/product_details", (req, res) => {
  const id = req.body.id;
  if (!id) {
    return res.status(400).json({
      success: false,
      msg: "ID parameter is required",
    });
  }
  
  const sql = "SELECT * FROM Products WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length > 0) {
      const product = result[0];
      const { title, description, price, thumbnail } = product;
      // Construct the complete image URL using the relative path
      const imageURL = req.protocol + '://' + req.get('host') + '/img/' + thumbnail;
      res.status(200).send({
        success: true,
        msg: "Product Details",
        data: {    
          id: id,
          title: title,
          description: description,
          price: price,
          thumbnail: imageURL, // Send the complete image URL
        },
      });
    } else {
      res.status(404).json({
        success: false,
        msg: "No product found with the given ID",
      });
    }
  });
});

module.exports = router;
