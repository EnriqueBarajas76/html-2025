# Deployment Guide: Board Game and Book Manager

This guide outlines the general steps and considerations for deploying the Node.js backend and React frontend of the Board Game and Book Manager application.

## I. General Considerations

Before deploying, it's crucial to address the following:

*   **Environment Variables:**
    *   The backend relies on environment variables for sensitive information and configuration. These **must** be set in your deployment environment. Do not hardcode them.
    *   Key backend variables:
        *   `MONGO_URI`: Connection string for your production MongoDB database.
        *   `JWT_SECRET`: A strong, unique secret for signing JSON Web Tokens.
        *   `PORT`: The port your backend server will listen on (often provided by the deployment platform).
        *   `NODE_ENV`: Set to `production` to enable optimizations and disable debug features.
*   **Database:**
    *   A production-ready MongoDB instance is required. Options include:
        *   Cloud-hosted: MongoDB Atlas (recommended for ease of use and scalability).
        *   Self-hosted: Running MongoDB on your own server/VPS.
    *   Ensure the backend's `MONGO_URI` environment variable is configured to point to this production database.
*   **CORS (Cross-Origin Resource Sharing):**
    *   The backend's CORS configuration in `server/app.js` (using the `cors` package) allows requests from any origin by default (`app.use(cors());`).
    *   For production, you should restrict this to only allow requests from your deployed frontend's domain.
        ```javascript
        // Example in server/app.js
        const corsOptions = {
          origin: 'https://your-frontend-domain.com', // Replace with your frontend's actual URL
        };
        app.use(cors(corsOptions));
        ```

## II. Backend Deployment (Node.js/Express.js)

### Preparation

1.  **Production Dependencies:**
    *   Verify that `server/package.json` lists all necessary packages under `dependencies`.
    *   `devDependencies` (like `nodemon`, `jest`) should not be included or run in a production environment. `npm install --omit=dev` will ensure this.
2.  **Production Start Script:**
    *   Add or ensure you have a start script in `server/package.json` specifically for production.
        ```json
        // server/package.json
        "scripts": {
          "start": "node app.js", // For development, often uses nodemon
          "start:prod": "node app.js", // For production
          "test": "jest --detectOpenHandles"
        },
        ```
    *   The `start:prod` script (or just `start` if it's `node app.js`) will be used by the deployment platform.

### Option 1: Platform as a Service (PaaS) - Example: Heroku

PaaS platforms abstract away much of the server management.

1.  **Procfile:**
    *   Create a file named `Procfile` (no extension) in the `server/` directory root:
        ```
        web: npm run start:prod
        ```
        (If your production start script is just `npm start` pointing to `node app.js`, you can use `web: npm start`).
2.  **Environment Variables:**
    *   Set `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, and any other necessary environment variables in the Heroku dashboard (under your app's "Settings" > "Config Vars") or via the Heroku CLI (`heroku config:set VAR_NAME=value`).
3.  **Deployment:**
    *   Initialize a Git repository in your `server/` directory (or ensure the project root is a Git repo and Heroku is configured to find the server app, possibly using a subdirectory buildpack or by deploying the server part from its own branch/repo).
    *   Connect your Heroku app to your Git repository.
    *   Push your code to Heroku:
        ```bash
        git push heroku main # Or your deployment branch
        ```

### Option 2: Containerization - Example: Docker

Docker allows you to package your application and its dependencies into a portable container.

1.  **Dockerfile:**
    *   Create a `Dockerfile` in the `server/` directory root:
        ```dockerfile
        # Dockerfile for server/
        FROM node:18-alpine AS base

        WORKDIR /app

        # Install dependencies first to leverage Docker cache
        COPY package.json package-lock.json* ./
        # Use --omit=dev for production to avoid installing devDependencies
        RUN npm install --omit=dev

        # Copy application code
        COPY . .

        # Expose the port the app runs on
        # Ensure this matches the PORT environment variable your app uses, or the default (3001)
        EXPOSE 3001

        # Set NODE_ENV to production
        ENV NODE_ENV=production

        # Command to run the application
        # Use the production start script if available
        CMD ["npm", "run", "start:prod"]
        # Or directly: CMD ["node", "app.js"]
        ```
2.  **Building the Docker Image:**
    *   Navigate to the `server/` directory.
    *   Run:
        ```bash
        docker build -t yourusername/boardgame-book-manager-server .
        ```
        (Replace `yourusername` with your Docker Hub username or your preferred image name).
3.  **Running the Container:**
    *   Locally for testing:
        ```bash
        docker run -p 3001:3001 \
          -e MONGO_URI="your_production_mongo_uri" \
          -e JWT_SECRET="your_strong_jwt_secret" \
          -e PORT=3001 \
          -e NODE_ENV=production \
          yourusername/boardgame-book-manager-server
        ```
    *   **Deployment to Registries/Platforms:**
        *   Push your image to a container registry (e.g., Docker Hub, AWS ECR, Google Container Registry).
        *   Deploy the image to a container orchestration platform (e.g., Kubernetes, AWS ECS, Google Kubernetes Engine) or a container service (e.g., AWS App Runner, Google Cloud Run). These platforms will manage running and scaling your container and provide ways to inject environment variables securely.

### Option 3: Traditional Server/VPS

Deploying to a Virtual Private Server (VPS) or a dedicated server gives you full control but requires more manual setup.

1.  **Server Setup:**
    *   Install Node.js runtime on the server.
    *   Install MongoDB or ensure network access to your MongoDB instance.
2.  **Code Deployment:**
    *   Copy your `server/` application code to the server (e.g., using `git clone`, `scp`, or `rsync`).
3.  **Install Dependencies:**
    *   Navigate to your application directory on the server.
    *   Run: `npm install --omit=dev`
4.  **Set Environment Variables:**
    *   Set `MONGO_URI`, `JWT_SECRET`, `PORT`, `NODE_ENV=production` as environment variables on the server. This can be done via shell profiles (e.g., `.bashrc`, `.profile`), systemd unit files, or `.env` files loaded by a tool like `dotenv` (though for production, direct environment variables are often preferred for security).
5.  **Process Manager:**
    *   Use a process manager like PM2 to keep your application running, manage logs, and handle automatic restarts.
        ```bash
        sudo npm install -g pm2
        pm2 start app.js --name boardgame-manager-api -i max --env production
        pm2 startup # To ensure PM2 restarts on server reboot
        pm2 save
        ```
6.  **Reverse Proxy (Nginx/Apache):**
    *   Set up a web server like Nginx or Apache as a reverse proxy. This server will:
        *   Listen on HTTP (port 80) and HTTPS (port 443).
        *   Handle SSL termination (HTTPS).
        *   Forward requests to your Node.js application (which might be running on localhost:3001).
        *   Can also serve static content, handle caching, and provide load balancing.

## III. Frontend Deployment (React/Vite)

The React frontend is a Single Page Application (SPA) that needs to be built into static files for deployment.

### Build Step

1.  Navigate to the `client/` directory:
    ```bash
    cd client
    ```
2.  Run the build command:
    ```bash
    npm run build
    ```
    This command will create a `dist/` folder inside the `client/` directory. This `dist/` folder contains all the static assets (HTML, CSS, JavaScript bundles) ready for deployment.

### API Base URL Configuration

The frontend needs to know the URL of your deployed backend API.

1.  **Environment Variable for Vite:**
    *   Create an environment file named `.env.production` in the `client/` directory (if it doesn't exist).
    *   Add your backend's public URL to this file:
        ```env
        # client/.env.production
        VITE_API_BASE_URL=https://your-backend-api-domain.com
        ```
    *   **Important:** You must re-run `npm run build` after creating or changing this file for the value to be included in the build.
2.  **Using the Environment Variable in Code:**
    *   The `apiFetch` helper in `client/src/App.jsx` (or any dedicated API service file) should be configured to use this variable. Vite automatically makes `VITE_` prefixed variables available via `import.meta.env`.
        ```javascript
        // Example in client/src/App.jsx or an api.js service file
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

        // Example usage:
        // const response = await fetch(`${API_BASE_URL}/api/boardgames`, options);
        ```
    *   The existing `apiFetch` in `App.jsx` is already set up this way if `VITE_API_BASE_URL` is available during the build process.

### Option 1: Static Hosting - Example: Netlify / Vercel

These platforms are excellent for deploying static sites and SPAs.

1.  **Connect Git Repository:**
    *   Sign up for Netlify or Vercel.
    *   Connect your Git repository (e.g., GitHub, GitLab, Bitbucket) that contains your project.
2.  **Configure Build Settings:**
    *   **Project Root:** If your `client` directory is not the root of your repository, you might need to specify a "Base directory" or "Root directory" (e.g., `client`).
    *   **Build Command:** `npm run build` (or `cd client && npm run build` if the repo root is connected and build needs to be client-specific).
    *   **Publish Directory:** `client/dist` (or just `dist` if the base directory is set to `client`).
3.  **Set Environment Variables:**
    *   In the Netlify/Vercel project dashboard (Build & Deploy > Environment), set the `VITE_API_BASE_URL` environment variable to your deployed backend's URL. This variable will be available during the build process on the platform.
4.  **Deploy:**
    *   The platform will typically auto-deploy on pushes to your main branch.

### Option 2: AWS S3 + CloudFront

1.  **Build:** Run `npm run build` in the `client` directory.
2.  **S3 Bucket:**
    *   Create an AWS S3 bucket.
    *   Enable static website hosting for the bucket.
    *   Upload the contents of the `client/dist/` folder to the S3 bucket.
    *   Configure bucket policies for public access (if necessary, or use CloudFront Origin Access Identity).
3.  **CloudFront (Recommended):**
    *   Create an AWS CloudFront distribution.
    *   Set the S3 bucket as the origin.
    *   Configure cache behaviors, SSL certificate (via AWS Certificate Manager), and custom domain names.
    *   CloudFront provides CDN capabilities for better performance and can manage HTTPS.

### Option 3: Serving from the Backend (Not recommended for SPAs)

While Express (your Node.js backend) can serve static files, it's generally not recommended for SPAs in production. Dedicated static hosting services (like Netlify, Vercel, S3) are more optimized for this task.

If you must, you could configure Express to serve the `client/dist` folder:
```javascript
// In server/app.js (simplified example)
// const path = require('path');
// app.use(express.static(path.join(__dirname, '../client/dist')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/dist/index.html'));
// });
```
This approach couples your frontend and backend deployment, potentially complicating scaling and updates.

## IV. Post-Deployment Checklist

After deploying both frontend and backend:

*   **Thorough Testing:** Test all application features, including user registration, login, CRUD operations for board games and books, and loan management.
*   **Browser Console:** Check the browser's developer console for any frontend errors (e.g., failed API requests, JavaScript errors).
*   **Backend Logs:** Monitor your backend application logs for any server-side errors or unexpected behavior. Platforms like Heroku, Docker hosts, and PM2 provide log aggregation.
*   **Environment Variables:** Double-check that all environment variables are correctly set in both frontend (build time) and backend environments.
*   **HTTPS:** Ensure your application is served over HTTPS.
*   **CORS:** Verify that CORS is correctly configured on the backend to allow requests only from your frontend domain.

This guide provides a general overview. Specific steps might vary based on your chosen hosting platforms and tools. Always refer to the official documentation of the services you use.
