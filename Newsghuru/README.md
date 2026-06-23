# NewsGhuru Monorepo

Welcome! This is the news application project containing the following components:
1. **backend**: Express server running on port `5000` (API baseURL: `http://127.0.0.1:5000`)
2. **users**: React client for the reader portal running on port `3001` (`http://127.0.0.1:3001`)
3. **admin**: React client for the super admin portal running on port `3002` (`http://127.0.0.1:3002`)

## Getting Started

### Prerequisites

Make sure you have Node.js (v18+) and npm installed.

### Setup and Running

You can install all dependencies and run all three services concurrently using standard npm scripts:

1. **Install dependencies for all components:**
   ```bash
   npm run install:all
   ```

2. **Install root-level concurrently devDependency:**
   ```bash
   npm install
   ```

3. **Run all three services concurrently:**
   ```bash
   npm start
   ```

Alternatively, you can run each service individually in its own terminal tab:

- **Backend:** `cd backend && npm start`
- **Users Client:** `cd users && npm start`
- **Admin Client:** `cd admin && npm start`
