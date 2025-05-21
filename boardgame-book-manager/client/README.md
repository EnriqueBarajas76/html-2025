# Frontend (React/Vite)

This is the frontend Single Page Application (SPA) for the Board Game and Book Manager. It provides the user interface for interacting with the backend API to manage items, users, and loans. Built with React and Vite.

## Prerequisites

*   **Node.js:** Version 18.x or higher recommended. Download from [nodejs.org](https://nodejs.org/).
*   **npm:** Typically comes with Node.js.

## Setup & Installation

1.  **Navigate to the Client Directory:**
    If you've cloned the entire repository, navigate to the `client` directory:
    ```bash
    cd path/to/repository/boardgame-book-manager/client
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables (Development):**
    The frontend needs to know the base URL of the backend API. For local development, this is typically `http://localhost:3001` (or whatever port your backend is running on).

    *   Vite uses `.env` files for environment variables. For local development, create a file named `.env.development.local` or `.env.local` in the `client/` directory.
    *   **Important:** These local `.env` files are included in `client/.gitignore` and should **not** be committed to version control.

    **Example `.env.development.local` content:**
    ```env
    # Base URL for the backend API during development
    VITE_API_BASE_URL=http://localhost:3001
    ```

    *   `VITE_API_BASE_URL`: The full base URL of your backend server. The `apiFetch` helper in `src/App.jsx` uses this to make requests.

## Running the Application (Development)

To start the frontend development server (powered by Vite):

```bash
npm run dev
```

This will typically start the frontend application on `http://localhost:5173` (Vite's default port). The application will automatically reload if you make changes to the code. Ensure your backend server is running and accessible at the URL specified in `VITE_API_BASE_URL`.

## Building for Production

To create a production-ready build of the frontend:

```bash
npm run build
```

This command will generate a `dist/` folder in the `client/` directory. This folder contains optimized static assets (HTML, CSS, JavaScript) that can be deployed to any static hosting service.
During the build, Vite will use the environment variables defined (e.g., in `.env.production` if you create one for production-specific API URLs).

## Project Structure

A brief overview of key directories and files:

*   `public/`: Contains static assets that are copied directly to the `dist` root (e.g., `vite.svg`).
*   `src/`: Contains the main React application code.
    *   `main.jsx`: The main entry point of the application. Renders the root `App` component and sets up providers (like `AuthProvider`).
    *   `App.jsx`: The root component of the application. Handles global state integration, conditional rendering based on auth, and integration of major feature components.
    *   `index.css`: Global CSS styles.
    *   `App.css`: Styles specific to the `App` component.
    *   `components/`: Reusable UI components used throughout the application (e.g., `BoardGameList.jsx`, `LoginForm.jsx`).
    *   `contexts/`: React Context providers for managing global state (e.g., `AuthContext.jsx`).
    *   `assets/`: Static assets like images or SVGs that are imported into components.
*   `.env.development.local` (if created): Stores environment variables for local development (gitignored).
*   `.gitignore`: Specifies intentionally untracked files that Git should ignore (e.g., `node_modules/`, `dist/`, `*.local`).
*   `package.json`: Lists project dependencies, scripts (like `dev`, `build`), and metadata.
*   `vite.config.js`: Vite configuration file.
*   `eslint.config.js`: ESLint configuration file.

## Connecting to the Backend

The frontend makes API calls to the backend service. The base URL for these calls is configured via the `VITE_API_BASE_URL` environment variable.
The `apiFetch` helper function in `src/App.jsx` is responsible for attaching the JWT authentication token to requests when a user is logged in.

Make sure your backend server is running and accessible at the URL specified in `VITE_API_BASE_URL` for the frontend to function correctly.
