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

4. If an environment file is required, copy the example file before starting
   the application:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, use `Copy-Item .env.example .env` instead.

## Project layout

- `client/` - frontend application
- `server/` - backend application
- `docs/` - project documentation

> The server is not implemented yet. The current scaffold provides the Angular
> client only.
