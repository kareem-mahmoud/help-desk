import express from 'express';

const app = express();

app.use(express.json());

app.get('/health', (_request, response) => {
  response.status(200).json(
    {
      status: 'ok',
      statusCode: 200,
      success: true,
      message: 'Help Desk server is running'
    }
  );
});

app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

export default app;
