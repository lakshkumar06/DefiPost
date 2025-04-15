import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Database setup
let db;

// Initialize database
async function initializeDatabase() {
  db = await open({
    filename: join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Drop existing tables if they exist
  await db.exec('DROP TABLE IF EXISTS users');
  await db.exec('DROP TABLE IF EXISTS projects');

  // Create users table with wallet support
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      wallet_address TEXT UNIQUE,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create projects table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      target_amount REAL NOT NULL,
      raised_amount REAL DEFAULT 0,
      founder_id INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (founder_id) REFERENCES users(id)
    )
  `);

  // Create investments table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      investor_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (investor_id) REFERENCES users(id)
    )
  `);

  console.log('Database initialized with users, projects, and investments tables');
}

// Initialize database on startup
initializeDatabase().catch(err => {
  console.error('Database initialization error:', err);
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register a new user with wallet
app.post('/api/register/wallet', async (req, res) => {
  try {
    const { walletAddress, name, email, role } = req.body;

    // Validate input
    if (!walletAddress || !name || !email || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate role
    const validRoles = ['founder', 'investor', 'collaborator'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if wallet already exists
    const existingWallet = await db.get('SELECT * FROM users WHERE wallet_address = ?', [walletAddress]);
    if (existingWallet) {
      return res.status(400).json({ message: 'Wallet already registered' });
    }

    // Check if email already exists
    const existingEmail = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Insert new user with wallet
    const result = await db.run(
      'INSERT INTO users (wallet_address, name, email, role) VALUES (?, ?, ?, ?)',
      [walletAddress, name, email, role]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: result.lastID, walletAddress, name, email, role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.lastID, walletAddress, name, email, role }
    });
  } catch (error) {
    console.error('Wallet registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login with wallet
app.post('/api/login/wallet', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    // Validate input
    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // Find user by wallet address
    const user = await db.get('SELECT * FROM users WHERE wallet_address = ?', [walletAddress]);
    if (!user) {
      return res.status(401).json({ message: 'Wallet not registered' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, walletAddress: user.wallet_address, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, walletAddress: user.wallet_address, role: user.role }
    });
  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Register a new user with email/password
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: result.lastID, name, email, role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.lastID, name, email, role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user with email/password
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.get('SELECT id, name, email, wallet_address, role FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// Project routes

// Create a new project
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, description, targetAmount } = req.body;
    const founderId = req.user.id;

    // Validate input
    if (!name || !description || !targetAmount) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user is a founder
    const user = await db.get('SELECT role FROM users WHERE id = ?', [founderId]);
    if (!user || user.role !== 'founder') {
      return res.status(403).json({ message: 'Only founders can create projects' });
    }

    // Insert new project
    const result = await db.run(
      'INSERT INTO projects (name, description, target_amount, founder_id) VALUES (?, ?, ?, ?)',
      [name, description, targetAmount, founderId]
    );

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        id: result.lastID,
        name,
        description,
        targetAmount,
        raisedAmount: 0,
        founderId,
        status: 'active',
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ message: 'Server error during project creation' });
  }
});

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.all(`
      SELECT p.*, u.name as founder_name 
      FROM projects p
      JOIN users u ON p.founder_id = u.id
      ORDER BY p.created_at DESC
    `);
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error while fetching projects' });
  }
});

// Get project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await db.get(`
      SELECT p.*, u.name as founder_name 
      FROM projects p
      JOIN users u ON p.founder_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error while fetching project' });
  }
});

// Get projects by founder
app.get('/api/projects/founder/:founderId', async (req, res) => {
  try {
    const projects = await db.all(`
      SELECT p.*, u.name as founder_name 
      FROM projects p
      JOIN users u ON p.founder_id = u.id
      WHERE p.founder_id = ?
      ORDER BY p.created_at DESC
    `, [req.params.founderId]);
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching founder projects:', error);
    res.status(500).json({ message: 'Server error while fetching founder projects' });
  }
});

// Update project
app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, targetAmount, status } = req.body;
    const projectId = req.params.id;
    const userId = req.user.id;

    // Check if project exists and user is the founder
    const project = await db.get('SELECT founder_id FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.founder_id !== userId) {
      return res.status(403).json({ message: 'Only the founder can update this project' });
    }

    // Update project
    await db.run(
      'UPDATE projects SET name = ?, description = ?, target_amount = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, targetAmount, status, projectId]
    );

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    console.error('Project update error:', error);
    res.status(500).json({ message: 'Server error during project update' });
  }
});

// Delete project
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    // Check if project exists and user is the founder
    const project = await db.get('SELECT founder_id FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (project.founder_id !== userId) {
      return res.status(403).json({ message: 'Only the founder can delete this project' });
    }

    // Delete project
    await db.run('DELETE FROM projects WHERE id = ?', [projectId]);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Project deletion error:', error);
    res.status(500).json({ message: 'Server error during project deletion' });
  }
});

// Invest in a project
app.post('/api/projects/:id/invest', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const projectId = req.params.id;
    const investorId = req.user.id;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid investment amount' });
    }

    // Check if user is an investor
    const user = await db.get('SELECT role FROM users WHERE id = ?', [investorId]);
    if (!user || user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can invest in projects' });
    }

    // Check if project exists and is active
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.status !== 'active') {
      return res.status(400).json({ message: 'Project is not accepting investments' });
    }

    // Start transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Create investment record
      await db.run(
        'INSERT INTO investments (project_id, investor_id, amount) VALUES (?, ?, ?)',
        [projectId, investorId, amount]
      );

      // Update project raised amount
      await db.run(
        'UPDATE projects SET raised_amount = raised_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [amount, projectId]
      );

      // Check if target amount is reached
      const updatedProject = await db.get('SELECT * FROM projects WHERE id = ?', [projectId]);
      if (updatedProject.raised_amount >= updatedProject.target_amount) {
        await db.run(
          'UPDATE projects SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['funded', projectId]
        );
      }

      await db.run('COMMIT');

      res.json({
        message: 'Investment successful',
        project: updatedProject
      });
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Investment error:', error);
    res.status(500).json({ message: 'Server error during investment' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 