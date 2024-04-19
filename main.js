const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const registrationRouter = require("./register");
const loginRouter = require("./login");
const searchRouter = require("./search");
const routerRouter = require("./router");
const product_detailsRouter = require("./product_details");
const productRouter = require("./pd");
const buyRouter = require("./buy");
const pdfRouter = require("./pdf");
const addressRouter = require("./address");
const cartvRouter = require("./cartv");
const bcrypt = require("bcryptjs"); // Replaced bcrypt with bcryptjs

const router = express.Router();
const app = express();
app.use(
  session({
    secret: "1234567890abcdefghijklmnopqrstuvwxyz",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("/img"));
app.set("view engine", "ejs");
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "localhood",
  password: "issc@123",
});

con.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL:", error);
  } else {
    console.log("MySQL Connected..cart");
  }
});
app.post("/v1/add-to-cart", (req, res) => {
  const { customerID, productID, quantity } = req.body;
  // Validate input data
  if (!customerID || !productID || !quantity) {
    return res.status(400).json({ error: "Missing required data" });
  }
  // Check if the product exists and has sufficient stock
  con.query(
    "SELECT * FROM products WHERE id = ?",
    [productID],
    (productQueryErr, productQueryRows) => {
      if (productQueryErr) {
        console.error("Error fetching product details:", productQueryErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (productQueryRows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      // Insert the product into the cart table
      con.query(
        "INSERT INTO cart (customerID, productsID, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?",
        [customerID, productID, quantity, quantity],
        (cartInsertErr) => {
          if (cartInsertErr) {
            console.error("Error adding product to cart:", cartInsertErr);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          const response = {
            message: "Product Added To Cart Successfully",
            cart: {
              customerID: customerID,
              productID: productID,
              quantity: quantity,
              product: {
                product_name: productQueryRows[0].title,
                description: productQueryRows[0].description,
                price: productQueryRows[0].price,
                // Add other product details as needed
              },
            },
          }; // Send success response
          return res.json(response);
        }
      );
    }
  );
});
app.post("/v1/remove-to-cart", (req, res) => {
  const { customerID, productID } = req.body;
  // Validate input data
  if (!customerID || !productID) {
    return res.status(400).json({ error: "Missing required data" });
  }
  // Check if the item exists in the cart
  con.query(
    "SELECT * FROM Cart WHERE customerID = ? AND productsID = ?",
    [customerID, productID],
    (cartErr, cartRows) => {
      if (cartErr) {
        console.error("Error checking cart:", cartErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      // If item does not exist in the cart
      if (cartRows.length === 0) {
        return res.status(404).json({ error: "Item not found in the cart" });
      }
      // Remove the item from the cart
      con.query(
        "DELETE FROM Cart WHERE customerID = ? AND productsID = ?",
        [customerID, productID],
        (deleteErr) => {
          if (deleteErr) {
            console.error("Error removing product from cart:", deleteErr);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          console.log("Product removed from cart successfully");
          return res.json({
            message: "Product Removed From Cart Successfully",
            removedItem: {
              customerID: customerID,
              productID: productID,
            },
          });
        }
      );
    }
  );
});
app.use((err, req, res, next) => {
  console.error("Middleware error:", err);
  if (err.status === 403) {
    return res.status(403).json({ error: "Forbidden" });
  } else if (err.status === 404) {
    return res.status(404).json({ error: "Not Found" });
  }
  return res.status(500).json({ error: "Internal Server Error" });
});

app.use(cors());
app.options("*", cors());

// Define routes
app.use("/v1", registrationRouter);
app.use("/v1", loginRouter);
app.use("/v1", router); // Corrected usage
app.use("/v1", searchRouter);
app.use("/v1", product_detailsRouter);
app.use("/v1", routerRouter);
app.use("/v1", productRouter);
app.use("/v1", buyRouter);
app.use("/v1", pdfRouter);
app.use("/v1", addressRouter);
app.use("/v1", cartvRouter);

// staring the port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
