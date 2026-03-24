const express = require('express');
const { Station, Bike } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const stations = await Station.findAll({ include: Bike });
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json(station);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;