const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./db');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
connectDB();

const app = express();

// ─── Security and parsing middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 10mb to allow touch path arrays

// ─── Game 1: Tracing game routes ─────────────────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/children',  require('./routes/childRoutes'));
app.use('/api/trials',    require('./routes/trialRoutes'));
app.use('/api/sessions',  require('./routes/sessionRoutes'));
app.use('/api/cognitive', require('./routes/cognitiveRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/profile', require('./routes/profile'));

// ─── Game 2: Behaviour picture-choice game routes ─────────────────────────────
app.use('/api/behaviour/scenarios',  require('./routes/behaviourScenarioRoutes'));
app.use('/api/behaviour/trials',     require('./routes/behaviourTrialRoutes'));
app.use('/api/behaviour/dashboard',  require('./routes/behaviourDashboardRoutes'));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ASD Tracing API is running' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong', details: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});