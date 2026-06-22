const express = require('express');
const router = express.Router();
const PlanController = require('../controllers/PlanController');
const authMiddleware = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

/**
 * @swagger
 * /plans:
 *   get:
 *     summary: List all active ticket plans
 *     tags: [Ticket Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active plans
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, PlanController.list);

/**
 * @swagger
 * /plans/{id}:
 *   get:
 *     summary: Get a single ticket plan
 *     tags: [Ticket Plans]
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
 *         description: Plan data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Plan not found
 */
router.get('/:id', authMiddleware, PlanController.get);

/**
 * @swagger
 * /plans:
 *   post:
 *     summary: Create a new ticket plan (admin only)
 *     tags: [Ticket Plans]
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
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: ZAR
 *               is_active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Plan created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin required
 *       400:
 *         description: Bad request
 */
router.post('/', authMiddleware, requireAdmin, PlanController.create);

/**
 * @swagger
 * /plans/{id}:
 *   patch:
 *     summary: Update a ticket plan (admin only)
 *     tags: [Ticket Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Plan updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin required
 *       400:
 *         description: Bad request
 */
router.patch('/:id', authMiddleware, requireAdmin, PlanController.update);

/**
 * @swagger
 * /plans/{id}:
 *   delete:
 *     summary: Deactivate a ticket plan (admin only)
 *     tags: [Ticket Plans]
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
 *         description: Plan deactivated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin required
 *       404:
 *         description: Plan not found
 */
router.delete('/:id', authMiddleware, requireAdmin, PlanController.delete);

module.exports = router;
