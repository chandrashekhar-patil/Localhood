const express = require("express");
const mysql = require("mysql");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const app = express();
const router = express.Router();
app.use(express.json());
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "localhood",
  password: "issc@123",
});
con.connect((err) => {
  if (err) {
    console.error("MySQL is Not Connect.\n\n", err);
    return;
  }
  console.log("MySQL is Connected...pdf");
});
router.post("/pdf", (req, res) => {
  // Fetch data from the database
  const sqlQuery = `
        SELECT 
            p.purchaseID AS Order_ID,
            DATE_FORMAT(p.purchase_date, '%Y-%m-%d') AS Purchase_date,
            c.name AS Customer_name,
            pr.title AS Product_name,
            p.quantity AS Quantity,
            p.total_price AS Total_price
        FROM 
            purchases p
        JOIN 
            customer c ON p.customerID = c.id
        JOIN 
            products pr ON p.productID = pr.id
    `; 
  con.query(sqlQuery, (err, rows) => {
    if (err) {
      console.error("Error fetching data from the database:", err);
      res.status(500).send("Error fetching data from the database");
      return;
    }
    // Create a new PDF document
    const doc = new PDFDocument();
    const stream = fs.createWriteStream("Reports.pdf");
    doc.pipe(stream);
    // Define table headers
    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Product",
      "Quantity",
      "Price",
    ];
    console.table(rows);
    // Start positioning of the table
    let x = 30;
    let y = 30;
    // Draw table headers with larger font size
    // Draw table headers with larger font size
    doc.fontSize(10);
    headers.forEach((header) => {
      doc
        .font("Helvetica-Bold")
        .text(header, x, y, { width: 120, align: "center" });
      x += 83; // Adjusting x position for the next header
    });
    // Increment Y position for the next row
    y += 30;
    // Draw table rows with smaller font size
    doc.fontSize(10);
    rows.forEach((row) => {
      let x = 50; // Reset x position for each row
      const rowData = [
        row.Order_ID,
        row.Purchase_date,
        row.Customer_name,
        row.Product_name,
        row.Quantity,
        row.Total_price,
      ];
      rowData.forEach((data) => {
        doc
          .font("Helvetica")
          .text(data.toString(), x, y, { width: 100, align: "center" });
        x += 80; // Adjusting x position for the next cell
      });
      // Increment Y position for the next row
      y += 30;
    });
    // Finalize the PDF and close the stream
    doc.end();
    stream.on("finish", () => {
      res.send("PDF generated successfully");
    });
  });
});
module.exports = router;
