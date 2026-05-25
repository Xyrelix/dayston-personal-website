const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/hello', (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
