const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    riskScore: {
        type: Number,
        required: true
    },
    nigeriaStocks: String,
    foreignStocks: String,
    techStocks: String,
    emergingStocks: String,
    nigeriaBonds: String,
    foreignBonds: String,
    commodities: String,
    realEstate: String,
    tBills: String,
    alternative: String
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
module.exports = Portfolio;
