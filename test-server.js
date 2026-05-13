import express from 'express';
const app = express();
const PORT = 3001;

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});