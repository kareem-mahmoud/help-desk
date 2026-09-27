import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler } from './middleware/error-handler.js';
import validationTestRouter from './routes/validation-test.js';
import authRouter from './routes/auth.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:4200'
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(validationTestRouter);
app.use('/api/auth', authRouter);

app.get('/health', (_request, response) => {
  const databaseStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const databaseStatus = databaseStates[mongoose.connection.readyState] ?? 'unknown';
  const isHealthy = databaseStatus === 'connected';
  const statusCode = isHealthy ? 200 : 503;

  response.status(statusCode).json({
    status: isHealthy ? 'ok' : 'degraded',
    statusCode,
    success: isHealthy,
    message: 'Help Desk server health status',
    database: { status: databaseStatus }
  });
});

app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

export default app;
