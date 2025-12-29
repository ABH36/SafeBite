const Product = require('../models/Product');
const { calculateRisk } = require('../utils/riskEngine');
const axios = require('axios');

/* ----------------- SMART ALTERNATIVES ENGINE ----------------- */
const findBetterAlternatives = async (category, currentStatus, currentBrand) => {
    if (currentStatus === 'GREEN') return [];

    let alts = await Product.find({
        category: { $regex: category, $options: 'i' },
        'analysis.status': 'GREEN',
        brand: { $ne: currentBrand }
    }).limit(3).select('name brand image analysis.totalRiskScore category');

    // Fallback if category match fails
    if (alts.length === 0) {
        alts = await Product.find({ 'analysis.status': 'GREEN' })
            .limit(3)
            .select('name brand image analysis.totalRiskScore category');
    }

    return alts;
};

/* ----------------- MAIN SCAN ENGINE ----------------- */
const getProductByBarcode = async (req, res) => {
    const { barcode } = req.params;

    try {
        if (!/^[0-9]{8,14}$/.test(barcode))
            return res.status(400).json({ message: "Invalid barcode format." });

        let product = await Product.findOne({ barcode });
        let alternatives = [];

        /* ---------- LOCAL CACHE ---------- */
        if (product) {
            alternatives = await findBetterAlternatives(product.category, product.analysis.status, product.brand);
            return res.json({ success: true, source: "SafeBite_Local_DB", data: product, alternatives });
        }

        /* ---------- OPENFOODFACTS FETCH ---------- */
        const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}`;
        const { data } = await axios.get(url);

        if (!data.product) return res.status(404).json({ success: false, message: "Product not found globally." });

        const p = data.product;

        /* 🔥 HARDENED INDIAN INGREDIENT EXTRACTOR */
        let ingredientsText =
            p.ingredients_text_en ||
            p.ingredients_text ||
            p.ingredients_text_hi ||
            p.ingredients_text_ml ||
            p.ingredients_text_ta ||
            p.ingredients_text || "";

        if (!ingredientsText || ingredientsText.length < 3)
            return res.status(404).json({ success: false, message: "Ingredients missing." });

        const ingredientsArray = ingredientsText
            .replace(/[()]/g, '')
            .split(/,|;|\./)
            .map(i => i.trim())
            .filter(Boolean);

        /* CATEGORY NORMALIZER */
        let mainCategory = "Snacks";
        if (p.categories_tags && p.categories_tags.length) {
            mainCategory = p.categories_tags[0].replace('en:', '').replace(/-/g, ' ');
        }

        const analysisResult = await calculateRisk(ingredientsArray);
        analysisResult.cachedAt = new Date();

        const newProduct = await Product.create({
            barcode,
            name: p.product_name || "Unknown Product",
            brand: p.brands || "Unknown Brand",
            image: p.image_url,
            category: mainCategory,
            ingredients: ingredientsArray,
            analysis: analysisResult
        });

        alternatives = await findBetterAlternatives(mainCategory, analysisResult.status, newProduct.brand);

        return res.json({
            success: true,
            source: "OpenFoodFacts_API",
            data: newProduct,
            alternatives
        });

    } catch (err) {
        console.error("Scan Error:", err.message);
        return res.status(500).json({ message: "Scan failed." });
    }
};

/* ----------------- MANUAL ADD ----------------- */
const addProduct = async (req, res) => {
    try {
        const analysis = await calculateRisk(req.body.ingredients);
        analysis.cachedAt = new Date();
        const product = await Product.create({ ...req.body, analysis });
        res.status(201).json({ success: true, data: product });
    } catch (e) { res.status(400).json({ message: e.message }); }
};

module.exports = { getProductByBarcode, addProduct };
