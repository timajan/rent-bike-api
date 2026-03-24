const express = require('express');
const { Booking, Bike, User, Payment } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [User, Bike, Payment]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, bike_id, start_time, end_time, payment_method } = req.body;

    const bike = await Bike.findByPk(bike_id);
    if (!bike) {
      return res.status(404).json({ error: 'Bike not found' });
    }

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
      status: 'pending'
    });

    const payment = await Payment.create({
      booking_id: booking.id,
      amount: total_price,
      payment_method: payment_method || 'card',
      payment_status: 'pending'
    });

    await bike.update({ status: 'rented' });

    const createdBooking = await Booking.findByPk(booking.id, {
      include: [User, Bike, Payment]
    });

    res.status(201).json({
      booking: createdBooking,
      payment
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, { include: Bike });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const { status } = req.body;

    await booking.update({ status });

    if (status === 'completed' || status === 'cancelled') {
      await booking.Bike.update({ status: 'available' });
    }

    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;