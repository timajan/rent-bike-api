const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const router = express.Router();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bike Rental API',
      version: '1.0.0',
      description: 'REST API for bike rental app with JWT auth, Helmet, rate limiting, Redis cache and validation.',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local server' },
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
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password', 'confirmPassword'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'qwerty123' },
            confirmPassword: { type: 'string', example: 'qwerty123' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'qwerty123' },
          },
        },
        BikeInput: {
          type: 'object',
          required: ['title', 'type', 'price_per_hour'],
          properties: {
            title: { type: 'string', example: 'City Bike' },
            type: { type: 'string', example: 'city' },
            price_per_hour: { type: 'number', example: 80 },
            status: { type: 'string', enum: ['available', 'rented', 'maintenance', 'inactive'] },
            station_id: { type: 'integer', example: 1 },
            description: { type: 'string', example: 'Comfortable city bike' },
            photo: { type: 'string', example: 'uploads/bike.png' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(specs, { explorer: true }));

module.exports = router;

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Validation error
 * /auth/login:
 *   post:
 *     summary: Login and receive JWT tokens
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
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 * /bikes:
 *   get:
 *     summary: Get paginated bike list. Response is cached.
 *     tags: [Bikes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
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
 *     summary: Get one bike by id. Response is cached.
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
 * /status:
 *   get:
 *     summary: Server performance status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Runtime metrics
 */
