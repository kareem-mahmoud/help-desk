import app from './app.js';
import { connectToDatabase } from './config/database.js';

const port = Number(process.env.PORT ?? 3000);

try {
  await connectToDatabase();

  app.listen(port, () => {
    console.log(`Help Desk server listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error('Failed to connect to MongoDB:', error);
  process.exitCode = 1;
}
