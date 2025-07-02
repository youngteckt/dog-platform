import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import dogRoutes from './routes/dog.js';
import petShopRoutes from './routes/petShop.js';
import registrationRoutes from './routes/registrations.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/dogs', dogRoutes);
app.use('/api/pet-shops', petShopRoutes);
app.use('/api/registrations', registrationRoutes);

app.get('/', (req, res) => {
  res.send('Dog Platform API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));