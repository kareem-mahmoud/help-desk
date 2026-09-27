import express from 'express';
import mongoose from 'mongoose';

const app = express();

app.use(express.json());

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

export default app;
