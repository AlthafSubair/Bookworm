import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes.js';
import connectDB from './lib/connectDB.js';
import bookRouter from './routes/bookRoutes.js';
import cors from 'cors';
import job from './lib/cron.js';

dotenv.config();


const app = express();

job.start();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({
    origin: '*', // You can also restrict to your frontend URL for more security
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.use('/api/auth', authRouter);
app.use('/api/books', bookRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB()
})