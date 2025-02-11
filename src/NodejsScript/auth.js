require('dotenv').config();
const mysql = require('mysql2');
const express = require('express');
const cors = require('cors'); // Import CORS package
const app = express();
const port = 5000;

app.use(express.json()); // To parse JSON request bodies
app.use(cors({
    origin: 'http://localhost:3000'  // Restrict to React frontend
}));

// Set up MySQL connection
const pool = mysql.createPool({
  host: 'sql12.freesqldatabase.com',      // MySQL server host (e.g., localhost)
  user: 'sql12762185',        // Database username
  password: 'uXGGjJMlLY', // Database password
  database: 'sql12762185',    // Database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test MySQL connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to MySQL database');
    connection.release();
  }
});

// Function to authenticate user (for login endpoint)
const authenticateUser = async (email, password, callback) => {
  try {
    console.log('Starting authentication for email:', email);

    // Query to check if the user exists with the provided email
    pool.execute('SELECT * FROM user_accounts WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Error executing SELECT query:', err);
        callback(err, null);
        return;
      }

      console.log('Query results:', results);

      if (results.length === 0) {
        console.log('User not found for email:', email);
        callback(null, { message: 'User not found' });
        return;
      }

      const user = results[0];
      console.log('User found:', user);

      // Compare the password (without hashing) directly
      if (password === user.password) {
        console.log('Password match successful');
        callback(null, { message: 'Authentication successful', userId: user.id });
      } else {
        console.log('Invalid password for email:', email);
        callback(null, { message: 'Invalid password' });
      }
    });
  } catch (err) {
    console.error('Error during authentication:', err);
    callback(err, null);
  }
};

// POST route for signup
app.post('/signup', (req, res) => {
  const { email, password } = req.body;
  console.log('Signup request received:', req.body);

  // Check if both email and password are provided
  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  try {
    // Check if the email already exists in the users table
    pool.execute('SELECT * FROM user_accounts WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Error executing SELECT query:', err.message);
        return res.status(500).send({ message: 'Database error', error: err });
      }

      if (results.length > 0) {
        console.log('Email already in use');
        return res.status(400).send({ message: 'Email already in use' });
      }

      // Insert the new user into the database without hashing the password
      pool.execute('INSERT INTO user_accounts (email, password) VALUES (?, ?)', [email, password], (err, result) => {
        if (err) {
          console.error('Error inserting user into database:', err.message);
          return res.status(500).send({ message: 'Error creating user', error: err });
        }

        // Return a success message if the user is created
        res.status(200).send({ message: 'Account created successfully' });
      });
    });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).send({ message: 'Error during signup', error: err });
  }
});

// POST route for login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if both email and password are provided
  if (!email || !password) {
    return res.status(400).send({ message: 'Please provide both email and password' });
  }

  // Authenticate the user
  authenticateUser(email, password, (err, response) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).send({ message: 'Database error', error: err });
    }

    if (response.message === 'Authentication successful') {
      return res.status(200).send(response);
    } else {
      return res.status(401).send(response);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
