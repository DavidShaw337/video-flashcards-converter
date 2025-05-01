import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 5000;

// Serve static files from Vite build output
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Example API route
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from Express backend' });
});

// Serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
