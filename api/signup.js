const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// MySQL Connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,      // MySQL server host (use environment variables)
  user: process.env.DB_USER,      // MySQL user (use environment variables)
  password: process.env.DB_PASS,  // MySQL password (use environment variables)
  database: process.env.DB_NAME,  // MySQL database name (use environment variables)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    // Check for missing data
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      // Check if email already exists
      pool.execute('SELECT * FROM user_accounts WHERE email = ?', [email], (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length > 0) {
          return res.status(400).json({ message: 'Email already in use' });
        }

        // Hash the password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            return res.status(500).json({ message: 'Error hashing password', error: err });
          }

          // Insert new user into the database
          pool.execute('INSERT INTO user_accounts (email, password) VALUES (?, ?)', [email, hashedPassword], (err, result) => {
            if (err) {
              return res.status(500).json({ message: 'Error creating user', error: err });
            }

            res.status(200).json({ message: 'Account created successfully' });
          });
        });
      });
    } catch (error) {
      console.error('Error during signup:', error);
      return res.status(500).json({ message: 'Error during signup', error });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};
