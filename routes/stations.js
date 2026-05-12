const express = require('express');
const { body, param, query } = require('express-validator');
const { Station, Bike } = require('../models');
const { cacheMiddleware, delByPrefix } = require('../utils/cache');
const validateRequest = require('../middleware/validateRequest');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

const stationValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('address').trim().isLength({ min: 3, max: 255 }).withMessage('Address must be 3-255 characters'),
  body('latitude').optional({ nullable: true }).isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional({ nullable: true }).isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
];

router.get(
  '/',
  [query('withBikes').optional().isBoolean().toBoolean()],
  validateRequest,
  cacheMiddleware(120),
  async (req, res) => {
    try {
      const include = req.query.withBikes ? [{ model: Bike, attributes: ['id', 'title', 'status'] }] : [];
      const stations = await Station.findAll({ include, order: [['id', 'DESC']] });
      res.json({ source: 'database', data: stations });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get('/:id', [param('id').isInt({ min: 1 }).toInt()], validateRequest, cacheMiddleware(120), async (req, res) => {
  try {
    const station = await Station.findByPk(req.params.id, {
      include: [{ model: Bike, attributes: ['id', 'title', 'type', 'status', 'price_per_hour'] }],
    });

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json(station);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, roleMiddleware('admin'), stationValidation, validateRequest, async (req, res) => {
  try {
    const station = await Station.create(req.body);
    await delByPrefix('cache:GET:/stations');
    res.status(201).json(station);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('admin'), [param('id').isInt({ min: 1 }).toInt(), ...stationValidation], validateRequest, async (req, res) => {
  try {
    const station = await Station.findByPk(req.params.id);

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    await station.update(req.body);
    await delByPrefix('cache:GET:/stations');
    await delByPrefix('cache:GET:/bikes');

    res.json(station);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('admin'), [param('id').isInt({ min: 1 }).toInt()], validateRequest, async (req, res) => {
  try {
    const deleted = await Station.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Station not found' });

    await delByPrefix('cache:GET:/stations');
    await delByPrefix('cache:GET:/bikes');
    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
