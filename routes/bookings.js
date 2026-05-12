const express = require('express');
const { body, param, query } = require('express-validator');
const { Booking, Bike, User, Payment } = require('../models');
const { cacheMiddleware, delByPrefix } = require('../utils/cache');
const validateRequest = require('../middleware/validateRequest');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const bookingInclude = [
  { model: User, attributes: ['id', 'name', 'email'] },
  { model: Bike, attributes: ['id', 'title', 'type', 'status'] },
  Payment,
];

router.get(
  '/',
  authMiddleware,
  [
    query('status').optional().isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled']),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validateRequest,
  cacheMiddleware(60),
  async (req, res) => {
    try {
      const where = {};
      if (req.user.role !== 'admin') where.user_id = req.user.id;
      if (req.query.status) where.status = req.query.status;

      const bookings = await Booking.findAll({
        where,
        include: bookingInclude,
        limit: Number(req.query.limit || 50),
        order: [['id', 'DESC']],
      });

      res.json({ source: 'database', data: bookings });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get('/:id', authMiddleware, [param('id').isInt({ min: 1 }).toInt()], validateRequest, cacheMiddleware(60), async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, { include: bookingInclude });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  '/',
  authMiddleware,
  [
    body('bike_id').isInt({ min: 1 }).toInt().withMessage('Bike id is required'),
    body('start_time').isISO8601().toDate().withMessage('Start time must be a valid date'),
    body('end_time').isISO8601().toDate().withMessage('End time must be a valid date'),
    body('payment_method').optional().isIn(['card', 'cash', 'apple_pay', 'google_pay']),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { bike_id, start_time, end_time, payment_method } = req.body;
      const user_id = req.user.role === 'admin' && req.body.user_id ? req.body.user_id : req.user.id;

      const bike = await Bike.findByPk(bike_id);
      if (!bike) return res.status(404).json({ error: 'Bike not found' });
      if (bike.status !== 'available') return res.status(400).json({ error: 'Bike is not available for booking' });

      const start = new Date(start_time);
      const end = new Date(end_time);
      const hours = Math.ceil((end - start) / (1000 * 60 * 60));

      if (hours <= 0) {
        return res.status(400).json({ error: 'End time must be later than start time' });
      }

      const total_price = hours * Number(bike.price_per_hour);

      const booking = await Booking.create({
        user_id,
        bike_id,
        start_time,
        end_time,
        hours,
        total_price,
        status: 'pending',
      });

      const payment = await Payment.create({
        booking_id: booking.id,
        amount: total_price,
        payment_method: payment_method || 'card',
        payment_status: 'pending',
      });

      await bike.update({ status: 'rented' });
      await delByPrefix('cache:GET:/bookings');
      await delByPrefix('cache:GET:/bikes');

      const createdBooking = await Booking.findByPk(booking.id, { include: bookingInclude });
      res.status(201).json({ booking: createdBooking, payment });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.put('/:id/status', authMiddleware, [param('id').isInt({ min: 1 }).toInt(), body('status').isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled'])], validateRequest, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, { include: Bike });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const { status } = req.body;
    await booking.update({ status });

    if (status === 'completed' || status === 'cancelled') {
      await booking.Bike.update({ status: 'available' });
    }

    await delByPrefix('cache:GET:/bookings');
    await delByPrefix('cache:GET:/bikes');

    const updatedBooking = await Booking.findByPk(req.params.id, { include: bookingInclude });
    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, [param('id').isInt({ min: 1 }).toInt()], validateRequest, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, { include: Bike });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    if (booking.Bike && booking.status !== 'completed') {
      await booking.Bike.update({ status: 'available' });
    }

    await booking.destroy();
    await delByPrefix('cache:GET:/bookings');
    await delByPrefix('cache:GET:/bikes');

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
