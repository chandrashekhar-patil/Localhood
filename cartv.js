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
  console.log("MySQL connected..view");
});
// app.use(express.json());
app.use("/img", express.static("img"));

router.post("/cart-view", (req, res) => {
  const customerID = req.body.customerID;

  if (!customerID) {
    return res.status(400).json({
      success: false,
      msg: "customerID parameter is required",
    });
  }

  const sql = `
    SELECT 
      c.customerID,
      c.productsID,
      c.quantity,
      c.created_at AS added_at,
      p.title AS product_title,
      p.rating AS product_rating,
      p.price AS product_price,
      p.thumbnail AS product_thumbnail
    FROM 
      cart c
    JOIN 
      products p ON c.productsID = p.id
    WHERE 
      c.customerID = ?;
  `;

  db.query(sql, [customerID], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length > 0) {
      const cartItems = result.map((item) => {
        const {
          productsID,
          quantity,
          added_at,
          product_title,
          product_rating,
          product_price,
          product_thumbnail,
        } = item;
        const imageURL =
          req.protocol + "://" + req.get("host") + "/img/" + product_thumbnail;
        return {
          productID: productsID,
          quantity,
          added_at,
          title: product_title,
          rating: product_rating,
          price: product_price,
          thumbnail: imageURL,
        };
      });
      res.status(200).send({
        success: true,
        msg: "Cart Details",
        data: cartItems,
      });
    } else {
      res.status(404).json({
        success: false,
        msg: "No items found in the cart for the given customerID",
      });
    }
  });
});

module.exports = router;
