const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/TicketController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create a new pending ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket created
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/', authMiddleware, TicketController.create);

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: List all tickets belonging to current user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, TicketController.list);

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get a specific ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ticket not found
 */
router.get('/:id', authMiddleware, TicketController.get);

/**
 * @swagger
 * /tickets/{id}/cancel:
 *   patch:
 *     summary: Cancel a confirmed ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket cancelled
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 *       404:
 *         description: Ticket not found
 */
router.patch('/:id/cancel', authMiddleware, TicketController.cancel);

module.exports = router;
