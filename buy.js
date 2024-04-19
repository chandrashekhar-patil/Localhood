const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
// MySQL Connection
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
    console.log("MySQL Connected..buy");
  }
});

// Buy Product Endpoint
router.post("/buy-product", (req, res) => {
  const { customerID, productID, quantity, storeID, transactionID, address } =
    req.body;
  // Validate input data
  if (
    !customerID ||
    !productID ||
    !quantity ||
    !storeID ||
    !transactionID ||
    !address
  ) {
    return res.status(400).json({ error: "Missing required data" });
  }
  // Check if the customer exists
  con.query(
    "SELECT * FROM customer WHERE id = ?",
    [customerID],
    (customerErr, customerRows) => {
      if (customerErr) {
        console.error("Error checking customer:", customerErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      // If customer does not exist
      if (customerRows.length === 0) {
        return res.status(404).json({ error: "Customer not found" });
      }
      // Check if the product exists and has sufficient stock
      con.query(
        "SELECT * FROM products WHERE id = ? AND stock >= ?",
        [productID, quantity],
        (productErr, productRows) => {
          if (productErr) {
            console.error("Error checking product:", productErr);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          // If product does not exist or has insufficient stock
          if (productRows.length === 0) {
            return res
              .status(404)
              .json({ error: "Product not found or insufficient stock" });
          }
          // Calculate total price
          const totalPrice = productRows[0].price * quantity;
          // Deduct the purchased quantity from stock
          const newStock = productRows[0].stock - quantity;
          con.query(
            "UPDATE products SET stock = ? WHERE id = ?",
            [newStock, productID],
            (updateErr, updateResult) => {
              if (updateErr) {
                console.error("Error updating stock:", updateErr);
                return res.status(500).json({ error: "Internal Server Error" });
              }
              // Insert the purchase into the purchases table
              con.query(
                "INSERT INTO purchases (customerID, productID, quantity, total_price, storeID, transactionID, address) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                  customerID,
                  productID,
                  quantity,
                  totalPrice,
                  storeID,
                  transactionID,
                  address,
                ],
                (purchaseErr) => {
                  if (purchaseErr) {
                    console.error("Error making purchase:", purchaseErr);
                    return res
                      .status(500)
                      .json({ error: "Internal Server Error" });
                  }
                  console.log("Product purchased successfully");
                  // Send success response
                  return res.json({
                    message: "Product Purchased Successfully",
                    purchaseDetails: {
                      customerID: customerID,
                      productID: productID,
                      quantity: quantity,
                      totalPrice: totalPrice,
                      storeID: storeID,
                      transactionID: transactionID,
                      address: address,
                    },
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});
// Change Address Endpoint
router.put("/add/:customerID", (req, res) => {
  const customerID = req.params.customerID;
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: "Missing address" });
  }

  con.query(
    "UPDATE customer SET delivery_address = ? WHERE id = ?",
    [address, customerID],
    (updateErr) => {
      if (updateErr) {
        console.error("Error adding address:", updateErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      console.log("Address added successfully");
      return res.json({ message: "Address added successfully" });
    }
  );
});
// Change Address Endpoint
router.put("/change/:customerID", (req, res) => {
  const customerID = req.params.customerID;
  const { newAddress } = req.body;

  if (!newAddress) {
    return res.status(400).json({ error: "Missing new address" });
  }

  con.query(
    "UPDATE customer SET delivery_address = ? WHERE id = ?",
    [newAddress, customerID],
    (updateErr) => {
      if (updateErr) {
        console.error("Error updating address:", updateErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      console.log("Address updated successfully");
      return res.json({ message: "Address updated successfully" });
    }
  );
});

router.delete("/delete/:customerID", (req, res) => {
  const customerID = req.params.customerID; // Corrected to use req.params.customerID

  con.query(
    "UPDATE customer SET delivery_address = NULL WHERE id = ?",
    [customerID],
    (updateErr) => {
      if (updateErr) {
        console.error("Error deleting address:", updateErr);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      console.log("Address deleted successfully");
      return res.json({ message: "Address deleted successfully" });
    }
  );
});

module.exports = router;
