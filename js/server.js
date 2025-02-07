// server.js (Backend)
const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Route for handling user registration
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  // Here you would handle registration logic (e.g., saving to a database)
  console.log('New registration:', { name, email, password });

  // Send a success response
  res.status(201).json({ message: 'Registration successful!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
