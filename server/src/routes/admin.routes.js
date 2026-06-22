const express = require('express');
const router = express.Router();
const AdminBookingController = require('../controllers/AdminBookingController');
const AdminUserController = require('../controllers/AdminUserController');
const AdminTicketController = require('../controllers/AdminTicketController');
const AuditController = require('../controllers/AuditController');
const PlanController = require('../controllers/PlanController');
const authMiddleware = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

/**
 * @swagger
 * /admin/bookings:
 *   get:
 *     summary: List all bookings (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *           default: 20
 *     responses:
 *       200:
 *         description: List of all bookings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/bookings', authMiddleware, requireAdmin, AdminBookingController.list);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *           default: 20
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/users', authMiddleware, requireAdmin, AdminUserController.list);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get a single user with all their tickets (admin only)
 *     tags: [Admin]
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
 *         description: User and their tickets
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.get('/users/:id', authMiddleware, requireAdmin, AdminUserController.get);

/**
 * @swagger
 * /admin/tickets/{id}/status:
 *   patch:
 *     summary: Override a ticket's status (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, refunded]
 *     responses:
 *       200:
 *         description: Ticket status updated
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Ticket not found
 */
router.patch('/tickets/:id/status', authMiddleware, requireAdmin, AdminTicketController.setStatus);

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: List all audit logs (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *           default: 20
 *     responses:
 *       200:
 *         description: List of audit logs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/audit-logs', authMiddleware, requireAdmin, AuditController.list);

/**
 * @swagger
 * /admin/audit-logs/table/{table}:
 *   get:
 *     summary: Filter audit logs by table (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: table
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of audit logs for table
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/audit-logs/table/:table', authMiddleware, requireAdmin, AuditController.byTable);

/**
 * @swagger
 * /admin/audit-logs/user/{userId}:
 *   get:
 *     summary: Filter audit logs by user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of audit logs by user
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/audit-logs/user/:userId', authMiddleware, requireAdmin, AuditController.byUser);

/**
 * @swagger
 * /admin/plans:
 *   get:
 *     summary: List all ticket plans (admin only, including inactive)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all plans
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin required
 */
router.get('/plans', authMiddleware, requireAdmin, PlanController.listAll);

module.exports = router;
