const express = require('express');
const { body, param, query } = require('express-validator');
const { Op } = require('sequelize');
const { Bike, Station } = require('../models');
const { cacheMiddleware, delByPrefix } = require('../utils/cache');
const validateRequest = require('../middleware/validateRequest');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

const bikeValidation = [
  body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Title must be 2-100 characters'),
  body('type').trim().isLength({ min: 2, max: 50 }).withMessage('Type must be 2-50 characters'),
  body('price_per_hour').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('status').optional().isIn(['available', 'rented', 'maintenance', 'inactive']).withMessage('Invalid status'),
  body('station_id').optional().isInt({ min: 1 }).withMessage('Station id must be positive integer'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description is too long'),
  body('photo').optional().trim().isLength({ max: 255 }).withMessage('Photo path is too long'),
];

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['available', 'rented', 'maintenance', 'inactive']),
    query('type').optional().trim().isLength({ min: 1, max: 50 }),
    query('search').optional().trim().isLength({ min: 1, max: 100 }),
  ],
  validateRequest,
  cacheMiddleware(120),
  async (req, res) => {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      const offset = (page - 1) * limit;

      const where = {};
      if (req.query.status) where.status = req.query.status;
      if (req.query.type) where.type = req.query.type;
      if (req.query.search) {
        where.title = { [Op.like]: `%${req.query.search}%` };
      }

      const { rows, count } = await Bike.findAndCountAll({
        where,
        include: [{ model: Station, attributes: ['id', 'name', 'address'] }],
        attributes: ['id', 'title', 'type', 'price_per_hour', 'status', 'description', 'photo', 'created_at'],
        order: [['id', 'DESC']],
        limit,
        offset,
      });

      res.json({
        source: 'database',
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
        data: rows,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get('/:id', [param('id').isInt({ min: 1 }).toInt()], validateRequest, cacheMiddleware(120), async (req, res) => {
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

router.post('/', authMiddleware, roleMiddleware('admin'), bikeValidation, validateRequest, async (req, res) => {
  try {
    const bike = await Bike.create(req.body);
    await delByPrefix('cache:GET:/bikes');
    res.status(201).json(bike);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, roleMiddleware('admin'), [param('id').isInt({ min: 1 }).toInt(), ...bikeValidation], validateRequest, async (req, res) => {
  try {
    const [updated] = await Bike.update(req.body, {
      where: { id: req.params.id },
    });

    if (!updated) {
      return res.status(404).json({ error: 'Bike not found' });
    }

    await delByPrefix('cache:GET:/bikes');
    const bike = await Bike.findByPk(req.params.id);
    res.json(bike);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('admin'), [param('id').isInt({ min: 1 }).toInt()], validateRequest, async (req, res) => {
  try {
    const deleted = await Bike.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Bike not found' });
    }

    await delByPrefix('cache:GET:/bikes');
    res.json({ message: 'Bike deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
