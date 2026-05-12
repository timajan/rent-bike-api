const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const router = express.Router();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rent Bike API',
      version: '1.0.0',
      description: 'Final laboratory project: REST API for bike rental with MySQL, Sequelize, JWT authentication, file upload, cache and Swagger/OpenAPI documentation.',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local server' },
      { url: '/', description: 'Current deployed server' },
    ],
    tags: [
      { name: 'System', description: 'Health, root and runtime endpoints' },
      { name: 'Auth', description: 'Registration, login and user profile endpoints' },
      { name: 'Bikes', description: 'Bike CRUD endpoints' },
      { name: 'Stations', description: 'Rental station CRUD endpoints' },
      { name: 'Bookings', description: 'Booking CRUD and status endpoints' },
      { name: 'Upload', description: 'File upload endpoints' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Validation error' },
            statusCode: { type: 'integer', example: 400 },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password', 'confirmPassword'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'qwerty123' },
            confirmPassword: { type: 'string', example: 'qwerty123' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', example: 'qwerty123' },
          },
        },
        RefreshTokenInput: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        ChangePasswordInput: {
          type: 'object',
          required: ['oldPassword', 'newPassword', 'confirmPassword'],
          properties: {
            oldPassword: { type: 'string', example: 'qwerty123' },
            newPassword: { type: 'string', example: 'newpass123' },
            confirmPassword: { type: 'string', example: 'newpass123' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['client', 'admin'], example: 'client' },
            avatar: { type: 'string', nullable: true, example: 'uploads/avatars/user-1.png' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        BikeInput: {
          type: 'object',
          required: ['title', 'type', 'price_per_hour', 'station_id'],
          properties: {
            title: { type: 'string', example: 'City Bike' },
            type: { type: 'string', example: 'city' },
            price_per_hour: { type: 'number', example: 80 },
            status: { type: 'string', enum: ['available', 'rented', 'maintenance', 'inactive'], example: 'available' },
            station_id: { type: 'integer', example: 1 },
            description: { type: 'string', example: 'Comfortable city bike' },
            photo: { type: 'string', example: 'uploads/bike.png' },
          },
        },
        Bike: {
          allOf: [
            { $ref: '#/components/schemas/BikeInput' },
            {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                created_at: { type: 'string', format: 'date-time' },
              },
            },
          ],
        },
        StationInput: {
          type: 'object',
          required: ['name', 'address'],
          properties: {
            name: { type: 'string', example: 'Central Station' },
            address: { type: 'string', example: 'Khreshchatyk St, Kyiv' },
            latitude: { type: 'number', nullable: true, example: 50.4501 },
            longitude: { type: 'number', nullable: true, example: 30.5234 },
          },
        },
        Station: {
          allOf: [
            { $ref: '#/components/schemas/StationInput' },
            {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                created_at: { type: 'string', format: 'date-time' },
              },
            },
          ],
        },
        BookingInput: {
          type: 'object',
          required: ['bike_id', 'start_time', 'end_time'],
          properties: {
            bike_id: { type: 'integer', example: 1 },
            start_time: { type: 'string', format: 'date-time', example: '2026-05-11T10:00:00.000Z' },
            end_time: { type: 'string', format: 'date-time', example: '2026-05-11T12:00:00.000Z' },
            payment_method: { type: 'string', enum: ['card', 'cash', 'apple_pay', 'google_pay'], example: 'card' },
          },
        },
        BookingStatusInput: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'], example: 'completed' },
          },
        },
      },
    },
  },
  apis: ['./app.js', './routes/*.js'],
};

const specs = swaggerJsdoc(options);

router.get('/json', (req, res) => res.json(specs));
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(specs, { explorer: true }));

module.exports = router;

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get API metadata
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API status and useful links
 * /status:
 *   get:
 *     summary: Get server runtime status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Runtime metrics
 * /health:
 *   get:
 *     summary: Health check endpoint for deployment platforms
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 * /auth/register:
 *   post:
 *     summary: Register a new client user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 * /auth/login:
 *   post:
 *     summary: Login and receive access and refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 * /auth/refresh:
 *   post:
 *     summary: Generate a new access token by refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenInput'
 *     responses:
 *       200:
 *         description: Access token generated
 * /auth/logout:
 *   post:
 *     summary: Remove refresh token from token store
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenInput'
 *     responses:
 *       200:
 *         description: Logout successful
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *   put:
 *     summary: Update current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Updated
 *               email:
 *                 type: string
 *                 example: updated@example.com
 *     responses:
 *       200:
 *         description: Profile updated successfully
 * /auth/change-password:
 *   patch:
 *     summary: Change current user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *     responses:
 *       200:
 *         description: Password changed successfully
 * /auth/profile/avatar:
 *   patch:
 *     summary: Upload or replace current user avatar
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 * /auth/users/{id}:
 *   delete:
 *     summary: Delete user by id. Admin only.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 * /auth/admin:
 *   get:
 *     summary: Test admin-only endpoint
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 * /bikes:
 *   get:
 *     summary: Get paginated bike list
 *     tags: [Bikes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, rented, maintenance, inactive]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bike list
 *   post:
 *     summary: Create a bike. Admin only.
 *     tags: [Bikes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BikeInput'
 *     responses:
 *       201:
 *         description: Bike created
 * /bikes/{id}:
 *   get:
 *     summary: Get one bike by id
 *     tags: [Bikes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bike item
 *       404:
 *         description: Bike not found
 *   put:
 *     summary: Update a bike. Admin only.
 *     tags: [Bikes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BikeInput'
 *     responses:
 *       200:
 *         description: Bike updated
 *   delete:
 *     summary: Delete a bike. Admin only.
 *     tags: [Bikes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bike deleted
 * /stations:
 *   get:
 *     summary: Get station list
 *     tags: [Stations]
 *     parameters:
 *       - in: query
 *         name: withBikes
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Station list
 *   post:
 *     summary: Create a station. Admin only.
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StationInput'
 *     responses:
 *       201:
 *         description: Station created
 * /stations/{id}:
 *   get:
 *     summary: Get one station by id
 *     tags: [Stations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Station item
 *   put:
 *     summary: Update a station. Admin only.
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StationInput'
 *     responses:
 *       200:
 *         description: Station updated
 *   delete:
 *     summary: Delete a station. Admin only.
 *     tags: [Stations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Station deleted
 * /bookings:
 *   get:
 *     summary: Get current user's bookings. Admin receives all bookings.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, active, completed, cancelled]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking list
 *   post:
 *     summary: Create a booking for an available bike
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingInput'
 *     responses:
 *       201:
 *         description: Booking and payment created
 * /bookings/{id}:
 *   get:
 *     summary: Get one booking by id
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking item
 *   delete:
 *     summary: Delete/cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking deleted
 * /bookings/{id}/status:
 *   put:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingStatusInput'
 *     responses:
 *       200:
 *         description: Booking status updated
 * /upload:
 *   post:
 *     summary: Upload one image or PDF file
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded
 * /upload-multiple:
 *   post:
 *     summary: Upload up to five image or PDF files
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded
 */
