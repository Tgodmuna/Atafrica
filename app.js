const express = require('express');
const { google } = require('googleapis');
const { auth } = require('google-auth-library');
const Portfolio = require('./model/portfolioModel');
const cors = require('cors'); // Import the cors middleware
const bodyParser = require('body-parser'); // Add body-parser for parsing JSON requests
const app = express();
const PORT = process.env.PORT || 4000;
const mongoose = require('mongoose');
require('dotenv').config();

// Middleware to enable CORS
app.use(cors());
app.use(bodyParser.json()); // Add this middleware to parse JSON requests

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('connected to mongodb');
});

app.get('/', async (req, res) => {
  try {
    const auth = await google.auth.getClient({
      keyFile: './Google/credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1Xk1kEiESzHbAXhuwRxl13YmTwhy7l0ocxxysVUfJAVE';

    // Get metadata about the spreadsheet
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    // read rows from spreadsheets
    const getRows = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,

      //to get all the sheets

      range: "sheet1",
      // range: "sheet1!A:K",
    });

    const values = getRows.data.values || [];

    const dataToInsert = values.map(([
      riskScore,
      nigeriaStocks,
      techStocks,
      foreignStocks,
      emergingStocks,
      nigeriaBonds,
      foreignBonds,
      commodities,
      realEstate,
      tBills,
      alternative
    ]) => ({
      riskScore: parseInt(riskScore) || 0, // Set a default value if riskScore is not present
    }));


    //to fetch the googlesheet data or cells
    // res.send(metadata)

    //to fetch a particular data in the googlesheet
    // res.send(metadata.data)

    // to get the rows
    // res.send(getRows)
    
    // Now add the catch block
    try {
      await Portfolio.insertMany(dataToInsert);
      res.json({ success: true, message: 'Data uploaded to MongoDB' });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: error.message });
    }
  } catch (error) {
    // Handle any error from the outer try block
    console.error('Outer Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});


// API Endpoints

// Create a new portfolio item
app.post('/api/portfolio', async (req, res) => {
  try {
    const newPortfolioItem = await Portfolio.create(req.body);
    res.status(201).json(newPortfolioItem);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all portfolio items
app.get('/api/portfolio', async (req, res) => {
  try {
    const portfolioItems = await Portfolio.find();
    res.json(portfolioItems);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific portfolio item by ID
app.get('/api/portfolio/:id', async (req, res) => {
  try {
    const portfolioItem = await Portfolio.findById(req.params.id);
    if (!portfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    res.json(portfolioItem);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update a portfolio item by ID
app.put('/api/portfolio/:id', async (req, res) => {
  try {
    const updatedPortfolioItem = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPortfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    res.json(updatedPortfolioItem);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/portfolio/:id', async (req, res) => {
  try {
    const deletedPortfolioItem = await Portfolio.findByIdAndDelete(req.params.id);
    if (!deletedPortfolioItem) {
      return res.status(404).json({ message: 'Portfolio item not found' });
    }
    res.json({ message: 'Portfolio item deleted successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`server listening at port ${PORT}`);
});