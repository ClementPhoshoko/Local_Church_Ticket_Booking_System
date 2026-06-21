const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /payments/initiate:
 *   post:
 *     summary: Initiate a payment for a ticket
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticket_id:
 *                 type: string
 *               gateway:
 *                 type: string
 *                 default: mock
 *     responses:
 *       200:
 *         description: Payment initiated
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 *       404:
 *         description: Ticket not found
 */
router.post('/initiate', authMiddleware, PaymentController.initiate);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Webhook endpoint for payment gateways
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: txId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [success, failed]
 *     responses:
 *       200:
 *         description: Webhook processed
 *       404:
 *         description: Transaction not found
 */
router.post('/webhook', PaymentController.webhook);

/**
 * @swagger
 * /payments/{ticketId}:
 *   get:
 *     summary: Get all transactions for a ticket
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of transactions
 *       401:
 *         description: Unauthorized
 */
router.get('/:ticketId', authMiddleware, PaymentController.get);

module.exports = router;
