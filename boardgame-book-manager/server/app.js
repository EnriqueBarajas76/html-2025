// server/app.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const mongoose = require('mongoose');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// --- Mongoose Models ---
const User = require('./models/User');
const BoardGame = require('./models/BoardGame');
const Book = require('./models/Book');
const Loan = require('./models/Loan');

const app = express();
const PORT = process.env.PORT || 3001;

// --- MongoDB Connection ---
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI_TEST || process.env.MONGO_URI || 'mongodb://localhost:27017/boardgame_book_manager_dev';
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(mongoURI);
    console.log(`MongoDB connected successfully to ${mongoURI}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secret-key-for-dev-only';

app.use(cors());
app.use(express.json());

// --- Swagger Configuration ---
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Board Game & Book Manager API',
    version: '1.0.0',
    description: 'API for managing board games, books, user authentication, and loans.',
    contact: {
        name: "API Support",
        // url: "http://www.example.com/support", // Fictional URL
        // email: "support@example.com" // Fictional email
    }
  },
  servers: [
    {
      url: `http://localhost:${PORT}/api`, // Uses the actual PORT
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', format: 'ObjectId', example: '60c72b2f9b1d8c001f8e4d2a' },
          username: { type: 'string', example: 'testuser' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          createdAt: { type: 'string', format: 'date-time', example: '2023-01-01T12:00:00.000Z'},
          updatedAt: { type: 'string', format: 'date-time', example: '2023-01-01T12:00:00.000Z'}
        },
      },
      UserInput: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: {type: 'string', example: 'newuser'},
            password: {type: 'string', example: 'password123', minLength: 6}
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'testuser' },
          password: { type: 'string', example: 'password123' },
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
            token: { type: 'string', example: 'jwt_token_here...'},
            user: { $ref: '#/components/schemas/User'}
        }
      },
      BoardGame: {
        type: 'object',
        properties: {
          _id: { type: 'string', format: 'ObjectId', example: '60c72b2f9b1d8c001f8e4b3c' },
          title: { type: 'string', example: 'Wingspan' },
          designer: { type: 'string', example: 'Elizabeth Hargrave' },
          genre: { type: 'string', example: 'Strategy' },
          createdAt: { type: 'string', format: 'date-time', example: '2023-01-01T12:00:00.000Z'},
          updatedAt: { type: 'string', format: 'date-time', example: '2023-01-01T12:00:00.000Z'}
        },
      },
      NewBoardGame: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', example: 'Terraforming Mars' },
          designer: { type: 'string', example: 'Jacob Fryxelius' },
          genre: { type: 'string', example: 'Sci-Fi' },
        },
      },
      Book: {
        type: 'object',
        properties: {
            _id: { type: 'string', format: 'ObjectId', example: '60c72b2f9b1d8c001f8e4c5d' },
            title: { type: 'string', example: 'Dune' },
            author: { type: 'string', example: 'Frank Herbert' },
            genre: { type: 'string', example: 'Science Fiction' },
            createdAt: { type: 'string', format: 'date-time', example: '2023-01-01T12:00:00.000Z'},
            updatedAt: { type: 'string', format: 'date-time', example: '2023-01-01T12:00:00.000Z'}
        }
      },
      NewBook: {
        type: 'object',
        required: ['title', 'author'],
        properties: {
            title: { type: 'string', example: 'Project Hail Mary'},
            author: { type: 'string', example: 'Andy Weir'},
            genre: { type: 'string', example: 'Science Fiction'}
        }
      },
      Loan: {
        type: 'object',
        properties: {
            _id: { type: 'string', format: 'ObjectId', example: '60f8c2b7a1b2c3d4e5f6g7h8'},
            item: { type: 'string', format: 'ObjectId', description: "ID of the loaned item (BoardGame or Book)"},
            itemTypeEnum: { type: 'string', enum: ['BoardGame', 'Book'], example: 'Book'},
            borrowerName: { type: 'string', example: 'John Doe'},
            loanDate: { type: 'string', format: 'date-time'},
            dueDate: { type: 'string', format: 'date-time'},
            returnDate: { type: 'string', format: 'date-time', nullable: true},
            loanedByUserId: { type: 'string', format: 'ObjectId', description: "ID of the user who processed the loan"},
            returnedByUserId: { type: 'string', format: 'ObjectId', nullable: true, description: "ID of the user who processed the return"},
            createdAt: { type: 'string', format: 'date-time'},
            updatedAt: { type: 'string', format: 'date-time'}
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Error message description.'}
        }
      }
    }
  },
};

const options = {
  swaggerDefinition,
  apis: ['./app.js'], // Process JSDoc comments in this file
};
const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    if (err) return res.sendStatus(403);
    req.user = decodedToken;
    next();
  });
};

// --- Authorization Middleware (Role-based) ---
const authorizeRole = (rolesArray) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !rolesArray.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
};

// --- Auth Routes ---
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and registration
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registers a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input (e.g., username taken, password too short)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already taken' });
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';
    const user = new User({ username, passwordHash, role });
    await user.save();
    const { passwordHash: _, ...userToReturn } = user.toObject();
    res.status(201).json({user: userToReturn});
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Logs in an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid input (missing fields)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const payload = { userId: user._id.toString(), username: user.username, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const { passwordHash: _, ...userToReturn } = user.toObject();
    res.json({ token, user: userToReturn });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

// --- General Test Routes ---
/**
 * @swagger
 * tags:
 *   name: General
 *   description: General utility and test endpoints
 */

/**
 * @swagger
 * /test:
 *   get:
 *     summary: Simple test route to check if the backend is running
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Backend is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: 'string', example: 'Backend is running!' }
 */
app.get('/api/test', (req, res) => res.json({ message: 'Backend is running!' }));

/**
 * @swagger
 * /admin/test:
 *   get:
 *     summary: Protected admin test route
 *     tags: [General, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin access confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: 'string', example: 'Welcome Admin testuser! This is a protected admin route.' }
 *       401:
 *         description: Unauthorized (token missing or invalid)
 *       403:
 *         description: Forbidden (user is not an admin)
 */
app.get('/api/admin/test', authenticateToken, authorizeRole(['admin']), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.username}! This is a protected admin route.` });
});

// --- Board Game Routes ---
/**
 * @swagger
 * tags:
 *   name: BoardGames
 *   description: Board game management
 */

/**
 * @swagger
 * /boardgames:
 *   get:
 *     summary: Retrieves a list of all board games
 *     tags: [BoardGames]
 *     responses:
 *       200:
 *         description: A list of board games
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BoardGame'
 *       500:
 *         description: Internal server error
 */
app.get('/api/boardgames', async (req, res) => {
  try {
    const games = await BoardGame.find();
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /boardgames:
 *   post:
 *     summary: Creates a new board game
 *     tags: [BoardGames]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewBoardGame'
 *     responses:
 *       201:
 *         description: Board game created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardGame'
 *       400:
 *         description: Invalid input (e.g., missing title)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient role, though 'user' can create)
 *       500:
 *         description: Internal server error
 */
app.post('/api/boardgames', authenticateToken, authorizeRole(['admin', 'user']), async (req, res) => {
  try {
    const { title, designer, genre } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required for board game' });
    const newGame = new BoardGame({ title, designer, genre });
    await newGame.save();
    res.status(201).json(newGame);
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /boardgames/{id}:
 *   get:
 *     summary: Retrieves a specific board game by ID
 *     tags: [BoardGames]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the board game to retrieve.
 *     responses:
 *       200:
 *         description: Details of the board game
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardGame'
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Board game not found
 *       500:
 *         description: Internal server error
 */
app.get('/api/boardgames/:id', async (req, res) => {
  try {
    const game = await BoardGame.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Board game not found' });
    res.json(game);
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format' });
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /boardgames/{id}:
 *   put:
 *     summary: Updates an existing board game (Admin only)
 *     tags: [BoardGames]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the board game to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewBoardGame' # Can reuse or create specific UpdateBoardGame schema
 *     responses:
 *       200:
 *         description: Board game updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardGame'
 *       400:
 *         description: Invalid input or ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not an admin)
 *       404:
 *         description: Board game not found
 *       500:
 *         description: Internal server error
 */
app.put('/api/boardgames/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const updatedGame = await BoardGame.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedGame) return res.status(404).json({ message: 'Board game not found' });
    res.json(updatedGame);
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format' });
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /boardgames/{id}:
 *   delete:
 *     summary: Deletes a board game (Admin only)
 *     tags: [BoardGames]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: The ID of the board game to delete.
 *     responses:
 *       204:
 *         description: Board game deleted successfully
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not an admin)
 *       404:
 *         description: Board game not found
 *       500:
 *         description: Internal server error
 */
app.delete('/api/boardgames/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const deletedGame = await BoardGame.findByIdAndDelete(req.params.id);
    if (!deletedGame) return res.status(404).json({ message: 'Board game not found' });
    res.status(204).send();
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format' });
    res.status(500).json({ message: error.message });
  }
});

// --- Book Routes ---
/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Retrieves a list of all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Internal server error
 */
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Creates a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewBook'
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid input (e.g., missing title or author)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
app.post('/api/books', authenticateToken, authorizeRole(['admin', 'user']), async (req, res) => {
  try {
    const { title, author, genre } = req.body;
    if (!title || !author) return res.status(400).json({ message: 'Title and Author are required for book' });
    const newBook = new Book({ title, author, genre });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
});

// Minimal JSDoc for other book routes for brevity, can be expanded
/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Retrieves a specific book by ID
 *     tags: [Books]
 *     parameters: [{ $ref: '#/components/parameters/itemIdParam' }]
 *     responses:
 *       200: { $ref: '#/components/responses/BookResponse' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format' });
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Updates an existing book (Admin only)
 *     tags: [Books]
 *     security: [{bearerAuth: []}]
 *     parameters: [{ $ref: '#/components/parameters/itemIdParam' }]
 *     requestBody: { $ref: '#/components/requestBodies/NewBook' }
 *     responses:
 *       200: { $ref: '#/components/responses/BookResponse' }
 *       400: { $ref: '#/components/responses/InvalidInput' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
app.put('/api/books/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
    res.json(updatedBook);
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format' });
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Deletes a book (Admin only)
 *     tags: [Books]
 *     security: [{bearerAuth: []}]
 *     parameters: [{ $ref: '#/components/parameters/itemIdParam' }]
 *     responses:
 *       204: { $ref: '#/components/responses/NoContent' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
app.delete('/api/books/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: 'Book not found' });
    res.status(204).send();
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format' });
    res.status(500).json({ message: error.message });
  }
});


// --- Loan Routes (Minimal JSDoc for brevity) ---
/**
 * @swagger
 * tags:
 *   name: Loans
 *   description: Loan management
 */

/**
 * @swagger
 * /loans/borrow:
 *   post:
 *     summary: Borrows an item
 *     tags: [Loans]
 *     security: [{bearerAuth: []}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itemId, itemType, borrowerName, dueDate]
 *             properties:
 *               itemId: { type: 'string', format: 'ObjectId', description: "ID of the BoardGame or Book" }
 *               itemType: { type: 'string', enum: ['BoardGame', 'Book'], description: "Type of item being borrowed" }
 *               borrowerName: { type: 'string', example: 'Jane Doe' }
 *               dueDate: { type: 'string', format: 'date', example: '2024-12-31' }
 *     responses:
 *       201: { description: "Item loaned successfully", content: { "application/json": { schema: { $ref: '#/components/schemas/Loan' }}}}
 *       400: { description: "Invalid input or item already loaned" }
 *       401: { description: "Unauthorized" }
 *       404: { description: "Item not found" }
 */
app.post('/api/loans/borrow', authenticateToken, async (req, res) => {
  try {
    const { itemId, itemType, borrowerName, dueDate } = req.body;
    const { userId } = req.user;
    if (!itemId || !itemType || !borrowerName || !dueDate) return res.status(400).json({ message: 'Missing required fields' });
    if (itemType !== 'BoardGame' && itemType !== 'Book') return res.status(400).json({ message: 'Invalid itemType. Must be "BoardGame" or "Book".' });
    let itemExists;
    if (itemType === 'BoardGame') itemExists = await BoardGame.findById(itemId);
    else itemExists = await Book.findById(itemId);
    if (!itemExists) return res.status(404).json({ message: `${itemType} with ID ${itemId} not found.` });
    const existingLoan = await Loan.findOne({ item: itemId, itemTypeEnum: itemType, returnDate: null });
    if (existingLoan) return res.status(400).json({ message: `${itemType} with ID ${itemId} is already on loan.` });
    const newLoan = new Loan({ item: itemId, itemTypeEnum: itemType, borrowerName, loanedByUserId: userId, dueDate });
    await newLoan.save();
    res.status(201).json(newLoan);
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid item ID format' });
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
});

/**
 * @swagger
 * /loans/return:
 *   post:
 *     summary: Returns a loaned item
 *     tags: [Loans]
 *     security: [{bearerAuth: []}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [loanId]
 *             properties:
 *               loanId: { type: 'string', format: 'ObjectId', description: "ID of the loan record" }
 *     responses:
 *       200: { description: "Item returned successfully", content: { "application/json": { schema: { $ref: '#/components/schemas/Loan' }}}}
 *       400: { description: "Invalid input or item already returned" }
 *       401: { description: "Unauthorized" }
 *       404: { description: "Loan not found" }
 */
app.post('/api/loans/return', authenticateToken, async (req, res) => {
  try {
    const { loanId } = req.body;
    const { userId } = req.user;
    if (!loanId) return res.status(400).json({ message: 'Missing loanId' });
    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: `Loan with ID ${loanId} not found.` });
    if (loan.returnDate !== null) return res.status(400).json({ message: `Loan with ID ${loanId} has already been returned.` });
    loan.returnDate = new Date();
    loan.returnedByUserId = userId;
    await loan.save();
    res.json(loan);
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid loan ID format' });
    res.status(500).json({ message: `Internal server error: ${error.message}` });
  }
});

/**
 * @swagger
 * /loans:
 *   get:
 *     summary: Retrieves a list of all loans (optionally filtered)
 *     tags: [Loans]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [loaned, returned]
 *         description: Filter loans by status
 *       - in: query
 *         name: borrowerName
 *         schema:
 *           type: string
 *         description: Filter loans by borrower's name (case-insensitive partial match)
 *     responses:
 *       200:
 *         description: A list of loans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Loan' # Note: populated item/user details would be richer
 *       500:
 *         description: Internal server error
 */
app.get('/api/loans', async (req, res) => {
  try {
    const { status, borrowerName } = req.query;
    let query = {};
    if (status) {
      if (status === 'loaned') query.returnDate = null;
      else if (status === 'returned') query.returnDate = { $ne: null };
    }
    if (borrowerName) query.borrowerName = { $regex: new RegExp(borrowerName, 'i') };
    const loans = await Loan.find(query).populate('item').populate('loanedByUserId', 'username').populate('returnedByUserId', 'username');
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Adding some reusable components for cleaner JSDoc in other routes
// This is just for the JSDoc, not actual code.
/**
 * @swagger
 * components:
 *   parameters:
 *     itemIdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: ObjectId
 *       description: The ID of the item.
 *   requestBodies:
 *     NewBook:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewBook'
 *   responses:
 *     BookResponse:
 *       description: Details of the book
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     NotFound:
 *       description: Item not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     InvalidInput:
 *       description: Invalid input provided
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     Unauthorized:
 *       description: Unauthorized (token missing or invalid)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     Forbidden:
 *       description: Forbidden (user does not have permission)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     NoContent:
 *       description: Operation successful, no content to return (e.g., for DELETE)
 */

// --- Server Start ---
let server;
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app; // For testing and potential other uses
// If you were exporting server for graceful shutdown, it would be:
// module.exports = { app, server };
