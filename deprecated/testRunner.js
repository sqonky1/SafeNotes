import express from 'express';
import handler from '../supabase-backend/deleteExpiredMedia.js';

const app = express();

app.get('/', handler);

app.listen(3000, () => {
  console.log('Test server running at http://localhost:3000');
});
