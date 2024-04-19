const express = require("express");
const mysql = require("mysql");
const router = express.Router();
const app = express();
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
    console.log("MySQL Connected..address");
  }
});
// Add Address Endpoint
router.post("/add-address/:customerID", (req, res) => {
    const customerID = req.params.customerID;
    const { newAddress, pincode } = req.body;

    if (!newAddress || !pincode) {
        return res.status(400).json({ error: "Missing new address or pincode" });
    }

    con.query(
        "UPDATE customer SET delivery_address = ?, pincode = ? WHERE id = ?",
        [newAddress, pincode, customerID],
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
// Delete Address Endpoint
router.delete("/delete-address/:customerID", (req, res) => {
    const customerID = req.params.customerID;

    con.query(
        "UPDATE customer SET delivery_address = NULL, pincode = NULL WHERE id = ?",
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
// Update Address Endpoint
router.put("/update-address/:customerID", (req, res) => {
    const customerID = req.params.customerID;
    const { updatedAddress, pincode } = req.body;

    if (!updatedAddress || !pincode) {
        return res.status(400).json({ error: "Missing updated address or pincode" });
    }
    con.query(
        "UPDATE customer SET delivery_address = ?, pincode = ? WHERE id = ?",
        [updatedAddress, pincode, customerID],
        (updateErr, updateResult) => {
            if (updateErr) {
                console.error("Error updating address:", updateErr);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            console.log("Address updated successfully");
            return res.json({ message: "Address updated successfully" });
        }
    );
});
module.exports = router;
