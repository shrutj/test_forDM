const mysql = require('mysql2');

// MySQL Connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
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
      // Check if user exists
      pool.execute('SELECT * FROM user_accounts WHERE email = ?', [email], (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
          return res.status(500).json({ message: 'Database error', error: err });
        }

        if (results.length === 0) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = results[0];

        // Check if the password matches (no bcrypt used)
        if (password === user.password) {
          res.status(200).json({ message: 'Login successful', userId: user.id });
        } else {
          res.status(400).json({ message: 'Invalid credentials' });
        }
      });
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ message: 'Error during login', error });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};
