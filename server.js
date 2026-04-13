const Joi = require("joi");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// =====================
// SERVE STATIC FILES
// =====================

// Serve images
app.use("/images", express.static(path.join(__dirname, "public/images")));
// Serve index.html and any other public files
app.use(express.static(path.join(__dirname, "public")));

// =====================
// MULTER SETUP (UPLOAD)
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
// PRODUCTS DATA
// =====================
const products = [
  {
    id: 1,
    title: "Baby Tee",
    price: "$25",
    image: "/images/babytee.jpg",
    description: "Fitted cropped baby tee with soft cotton fabric.",
    category: "tops",
  },
  {
    id: 2,
    title: "Low Rise Jeans",
    price: "$55",
    image: "/images/lowrise.png",
    description: "Classic low-rise denim with a baggy Y2K silhouette.",
    category: "jeans",
  },
  {
    id: 3,
    title: "Rhinestone Zipper Top",
    price: "$40",
    image: "/images/zipperteeprice.png",
    description: "Zip-up top with sparkly rhinestone details.",
    category: "tops",
  },
  {
    id: 4,
    title: "Mini Skirt",
    price: "$35",
    image: "/images/skirt.jpg",
    description: "Vintage mini skirt with a flattering Y2K fit.",
    category: "bottoms",
  },
  {
    id: 5,
    title: "Fur Coat",
    price: "$95",
    image: "/images/furcoat.jpg",
    description: "Iconic Y2K coat with soft faux fur trim.",
    category: "outerwear",
  },
  {
    id: 6,
    title: "Y2K Sunglasses",
    price: "$20",
    image: "/images/sunglasses.jpg",
    description: "Tinted sunglasses for that early 2000s vibe.",
    category: "accessories",
  },
  {
    id: 7,
    title: "Shoulder Bag",
    price: "$120",
    image: "/images/shoulderbag.jpg",
    description: "Vintage-inspired mini shoulder bag.",
    category: "accessories",
  },
  {
    id: 8,
    title: "Heels",
    price: "$75",
    image: "/images/heels.png",
    description: "Chic heels to elevate your Y2K outfit.",
    category: "shoes",
  },
  {
    id: 9,
    title: "Bedazzled Tee",
    price: "$30",
    image: "/images/bedazzledtees.jpg",
    description: "Sparkly tee with rhinestone details.",
    category: "tops",
  },
];

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
// ROUTES
// =====================

// GET all products
app.get("/api/products", (req, res) => {
  res.json(products);
});

// POST new product ⭐ REQUIRED FOR ASSIGNMENT
app.post("/api/products", (req, res) => {
  const { error } = productSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const newProduct = {
    id: products.length + 1,
    ...req.body,
  };

  products.push(newProduct);

  res.json({
    success: true,
    product: newProduct,
  });
});

// Upload route (for future use)
app.post("/upload", upload.single("image"), (req, res) => {
  res.json({
    message: "Image uploaded successfully",
    file: `/images/${req.file.filename}`,
  });
});

// Home route – serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));

