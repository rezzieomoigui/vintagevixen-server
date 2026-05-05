const Joi = require("joi");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// =====================
// MONGODB CONNECTION
// =====================
mongoose
  .connect("mongodb+srv://omoiguia:tkbU2IkbofHq3rlZ@cluster0.3rfsajs.mongodb.net/productsDB")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// =====================
// SCHEMA & MODEL
// =====================
const productSchemaDB = new mongoose.Schema({
  title: String,
  price: String,
  image: String,
  description: String,
  category: String,
});

const Product = mongoose.model("Product", productSchemaDB);

// =====================
// SERVE STATIC FILES
// =====================
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(express.static(path.join(__dirname, "public")));

// =====================
// MULTER SETUP
// =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// =====================
// JOI VALIDATION
// =====================
const productSchema = Joi.object({
  title: Joi.string().min(3).required(),
  price: Joi.string().pattern(/^\$\d+/).required(),
  image: Joi.string().required(),
  description: Joi.string().min(5).required(),
  category: Joi.string().required(),
});

// =====================
// ROUTES (MONGODB)
// =====================

// GET all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// POST new product
app.post("/api/products", async (req, res) => {
  const { error } = productSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const newProduct = new Product(req.body);
  await newProduct.save();

  res.json({
    success: true,
    product: newProduct,
  });
});

// PUT (edit product)
app.put("/api/products/:id", async (req, res) => {
  const { error } = productSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(updated);
});

// DELETE product
app.delete("/api/products/:id", async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);

  if (!deleted) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(deleted);
});

// =====================
// IMAGE UPLOAD
// =====================
app.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    message: "Image uploaded successfully",
    file: `/images/${req.file.filename}`,
  });
});

// =====================
// HOME ROUTE
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));