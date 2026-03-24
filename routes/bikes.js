const express = require('express');
const { Bike, Station } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const bikes = await Bike.findAll({ include: Station });
    res.json(bikes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const bike = await Bike.findByPk(req.params.id, { include: Station });

    if (!bike) {
      return res.status(404).json({ error: 'Bike not found' });
    }

    res.json(bike);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const bike = await Bike.create(req.body);
    res.status(201).json(bike);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Bike.update(req.body, {
      where: { id: req.params.id }
    });

    if (!updated) {
      return res.status(404).json({ error: 'Bike not found' });
    }

    const bike = await Bike.findByPk(req.params.id);
    res.json(bike);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Bike.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Bike not found' });
    }

    res.json({ message: 'Bike deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;