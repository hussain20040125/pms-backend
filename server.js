const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public: auth
app.use('/api/auth', require('./routes/auth'));

// Everything else requires a valid JWT
const authMiddleware = require('./middleware/auth');
app.use('/api', authMiddleware);

app.use('/api/projects', require('./routes/projects'));
app.use('/api/floors', require('./routes/floors'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/trades', require('./routes/trades'));
app.use('/api/checkpoints', require('./routes/checkpoints'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api/uploads', require('./routes/uploads'));

// Admin routes (auth + admin-role check enforced inside)
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
