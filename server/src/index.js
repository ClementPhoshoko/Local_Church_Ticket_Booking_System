require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const specs = require('./config/swagger');
const authRoutes = require('./routes/auth.routes');
const plansRoutes = require('./routes/plans.routes');
const ticketsRoutes = require('./routes/tickets.routes');
const paymentsRoutes = require('./routes/payments.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const profileRoutes = require('./routes/profile.routes');
const adminRoutes = require('./routes/admin.routes');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/auth', authRoutes);
app.use('/plans', plansRoutes);
app.use('/tickets', ticketsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/profile', profileRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Local Church Ticket Booking System API is running! Visit /api-docs for documentation.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});
