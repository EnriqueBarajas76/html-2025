# Backend (Node.js/Express.js)

This backend service manages board games, books, user authentication, and loan records for the Board Game and Book Manager application. It provides a RESTful API for the frontend client.

## Prerequisites

*   **Node.js:** Version 18.x or higher recommended. Download from [nodejs.org](https://nodejs.org/).
*   **npm:** Typically comes with Node.js.
*   **MongoDB:** A running MongoDB instance is required.
    *   You can use a local MongoDB installation (Community Server).
    *   Or, a cloud-hosted MongoDB service like MongoDB Atlas.

## Setup & Installation

1.  **Navigate to the Server Directory:**
    If you've cloned the entire repository, navigate to the `server` directory:
    ```bash
    cd path/to/repository/boardgame-book-manager/server
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    The backend requires certain environment variables to function correctly. These are typically stored in a `.env` file in the `server` directory for local development.

    *   Create a file named `.env` in the `server/` directory.
    *   **Important:** The `.env` file is included in `server/.gitignore` and should **not** be committed to version control.

    **Example `.env` content:**
    ```env
    # MongoDB Connection URI
    # For local MongoDB:
    MONGO_URI=mongodb://localhost:27017/boardgame_book_manager_dev
    # For MongoDB Atlas (replace with your actual connection string):
    # MONGO_URI=mongodb+srv://<username>:<password>@yourcluster.mongodb.net/boardgame_book_manager?retryWrites=true&w=majority

    # JSON Web Token Secret
    # Use a long, random, and strong string for JWT_SECRET in production
    JWT_SECRET=your-super-secret-jwt-key-for-development-only

    # Port for the server to listen on (optional, defaults to 3001)
    PORT=3001

    # NODE_ENV (optional for local dev, defaults to development behavior if not set)
    # For production, set this to 'production'
    # NODE_ENV=development 
    ```

    *   **`MONGO_URI`**: Your MongoDB connection string.
    *   **`JWT_SECRET`**: A secret key used for signing JSON Web Tokens. Keep this secure.
    *   **`PORT`**: The port the backend server will listen on. Defaults to `3001` if not specified.

## Running the Application (Development)

To start the backend server in development mode (with automatic restarts on file changes using `nodemon`):

```bash
npm start
```

The server will typically start on `http://localhost:3001` (or the port specified in your `PORT` environment variable). You should see a console message indicating "MongoDB connected successfully" and "Server is running on port XXXX".

## Running Tests

To run the API tests using Jest and Supertest:

```bash
npm test
```

This will execute test files located in the `__tests__` directory. Tests run against an in-memory MongoDB server, so your local/development database won't be affected.

## Project Structure

A brief overview of key directories and files:

*   `app.js`: The main Express application file. Contains server setup, middleware, route definitions, and MongoDB connection logic.
*   `models/`: Contains Mongoose schemas and models for `User`, `BoardGame`, `Book`, and `Loan`.
*   `routes/`: (Currently, routes are defined directly in `app.js`. If refactored, they would reside here).
*   `__tests__/`: Contains API integration tests written with Jest and Supertest.
*   `jest.config.js`: Jest configuration file.
*   `jest.setup.js`: Jest setup file for initializing the in-memory MongoDB server for tests.
*   `.env` (if created): Stores environment variables for local development (gitignored).
*   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
*   `package.json`: Lists project dependencies, scripts, and metadata.

## API Endpoints Overview

The backend provides several groups of API endpoints:

*   **Authentication (`/api/auth`):**
    *   `POST /api/auth/register`: User registration.
    *   `POST /api/auth/login`: User login.
*   **Board Games (`/api/boardgames`):**
    *   `GET /`: Get all board games.
    *   `POST /`: Create a new board game (requires authentication).
    *   `GET /:id`: Get a specific board game by ID.
    *   `PUT /:id`: Update a board game (admin only).
    *   `DELETE /:id`: Delete a board game (admin only).
*   **Books (`/api/books`):**
    *   `GET /`: Get all books.
    *   `POST /`: Create a new book (requires authentication).
    *   `GET /:id`: Get a specific book by ID.
    *   `PUT /:id`: Update a book (admin only).
    *   `DELETE /:id`: Delete a book (admin only).
*   **Loans (`/api/loans`):**
    *   `POST /borrow`: Borrow an item (requires authentication).
    *   `POST /return`: Return a loaned item (requires authentication).
    *   `GET /`: Get all loan records (can be filtered).
    *   `GET /active`: Get currently active loans.
    *   `GET /item/:itemType/:itemId`: Get loan history for a specific item.
*   **Admin (`/api/admin`):**
    *   `GET /test`: A test route accessible only by admin users.

(For detailed API specifications, refer to an OpenAPI/Swagger documentation if it's generated in the future.)
