const express = require('express');
const router = express.Router();
const { getProductByBarcode, addProduct } = require('../controllers/productController');

router.get('/:barcode', getProductByBarcode); // Scan ke liye
router.post('/add', addProduct); // Data bharne ke liye (Testing)

module.exports = router;