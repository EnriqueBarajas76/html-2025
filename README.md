# Board Game and Book Manager

This is a full-stack MERN (MongoDB, Express.js, React, Node.js) application designed to manage collections of board games and books, and to track loans of these items. It features user authentication with role-based access control (admin and user roles).

The application is structured into two main parts:
*   **Backend (`server/`)**: A Node.js/Express.js application providing a RESTful API for data management and authentication.
*   **Frontend (`client/`)**: A React Single Page Application (SPA) built with Vite, providing the user interface.

## Key Features

*   User registration and login with JWT-based authentication.
*   Admin and User roles with different access permissions.
*   CRUD operations for managing board games.
*   CRUD operations for managing books.
*   Loan management system to borrow and return items.
*   Backend API tests using Jest and Supertest.
*   MongoDB for data persistence.

## Getting Started

For detailed instructions on setting up and running the frontend and backend services for local development, please refer to their respective README files:

*   **[Frontend (Client) Setup & Details](./boardgame-book-manager/client/README.md)**
*   **[Backend (Server) Setup & Details](./boardgame-book-manager/server/README.md)**

## Deployment

For instructions on deploying this application to various environments (PaaS, Docker, traditional servers), please see the deployment guide:

*   **[Deployment Guide](./DEPLOYMENT_GUIDE.md)**

## Project Structure Overview

```
.
├── DEPLOYMENT_GUIDE.md     # Instructions for deploying the application
├── README.md               # This root README file
└── boardgame-book-manager/
    ├── client/             # React/Vite frontend application
    │   ├── README.md       # Frontend specific setup and details
    │   ├── package.json
    │   └── ... (other frontend files)
    └── server/             # Node.js/Express backend API
        ├── README.md       # Backend specific setup and details
        ├── package.json
        └── ... (other backend files)
```

## Technology Stack

*   **Backend:**
    *   Node.js
    *   Express.js
    *   MongoDB (with Mongoose ODM)
    *   JSON Web Tokens (JWT) for authentication
    *   bcryptjs for password hashing
    *   Jest & Supertest for API testing
*   **Frontend:**
    *   React
    *   Vite (build tool and dev server)
    *   React Context API (for state management, e.g., AuthContext)
    *   CSS (basic styling)
*   **General:**
    *   Git for version control.

---

Thank you for checking out the Board Game and Book Manager project!
