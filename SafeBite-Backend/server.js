const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
// 👇 Route import karo
const ingredientRoutes = require('./routes/ingredientRoutes');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// 👇 API Route connect karo
app.use('/api', ingredientRoutes);
app.use('/api/product', productRoutes);
app.use('/api/report', reportRoutes);

app.get('/', (req, res) => {
    res.send('SafeBite API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});