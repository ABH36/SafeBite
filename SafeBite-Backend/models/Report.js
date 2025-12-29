const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    barcode: { type: String, required: true },
    productName: { type: String },
    issueType: { 
        type: String, 
        enum: ['Wrong Ingredients', 'Incorrect Risk Score', 'Barcode Error', 'Other'],
        required: true 
    },
    description: { type: String },
    status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);