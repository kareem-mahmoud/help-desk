# Help Desk

## Setup

1. Clone the repository and open the project directory:

   ```bash
   git clone <repository-url>
   cd help-desk
   ```

2. Install the client dependencies:

   ```bash
   cd client
   npm install
   ```

3. Start the Angular development server:

   ```bash
   npm start
   ```

   Then open `http://localhost:4200/`.

4. In a second terminal, start the server:

   ```bash
   cd server
   npm run dev
   ```

   The server health endpoint is available at `http://localhost:3000/health`.

   For a production-style run, build first with `npm run build`, then use
   `npm start`.

5. If an environment file is required, copy the example file before starting
   the application:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, use `Copy-Item .env.example .env` instead.

## Project layout

- `client/` - frontend application
- `server/` - backend application
- `docs/` - project documentation

> The server currently provides a minimal health endpoint and is ready for
> backend routes and dependencies to be added.
