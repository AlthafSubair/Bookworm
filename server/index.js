import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/authRoutes.js';
import connectDB from './lib/connectDB.js';
import bookRouter from './routes/bookRoutes.js';
import cors from 'cors';

dotenv.config();


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

app.use('/api/auth', authRouter);
app.use('/api/books', bookRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    connectDB()
})