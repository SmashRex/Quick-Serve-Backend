import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import addressesRoutes from './modules/addresses/addresses.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import adminAuthRoutes from './modules/adminAuth/adminAuth.routes.js';
import ridersRoutes from './modules/riders/riders.routes.js';
import riderAuthRoutes from './modules/riderAuth/riderAuth.routes.js';
import partnerAuthRoutes from './modules/partnerAuth/partnerAuth.routes.js';
import adminPartnersRoutes from './modules/adminPartners/adminPartners.routes.js';
import adminOrdersRoutes from './modules/adminOrders/adminOrders.routes.js';
import riderTasksRoutes from './modules/riderTasks/riderTasks.routes.js';


const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use('/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());


import db from './config/db.js';

app.get('/db-test', async (req, res, next) => {
  try {
    const result = await db.raw('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

app.use('/auth', authRoutes);
app.use('/addresses', addressesRoutes);
app.use('/orders', ordersRoutes);
app.use('/payments', paymentsRoutes);
app.use(adminAuthRoutes);
app.use(ridersRoutes);
app.use(riderAuthRoutes);
app.use(partnerAuthRoutes);
app.use(adminPartnersRoutes);
app.use(adminOrdersRoutes);
app.use(riderTasksRoutes);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'QuickServe API is running' });
});

// module routes mounted here later, e.g.:
// import authRoutes from './modules/auth/auth.routes.js';
// app.use('/auth', authRoutes);

app.use(errorHandler);

export default app;
