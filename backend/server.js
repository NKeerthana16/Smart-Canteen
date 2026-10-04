const express = require('express');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const autoSeed = require('./autoSeed');

const app = express();

// CORS Middleware (Native, zero dependencies)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware
app.use(express.json());

// Base Test API Route
app.get('/api', (req, res) => {
  res.json({ message: 'Smart Canteen API is running' });
});

// Register API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/foods', require('./routes/foodRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect DB and start server
connectDB().then(async () => {
  await autoSeed();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize server:', err.message);
});
