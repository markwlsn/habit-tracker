# Habit Tracker Backend

A TypeScript-based REST API built with Express.js and Supabase for tracking habits, calculating streaks, and providing analytics.

## Features

- **User Authentication**: Secure registration and login using Supabase Auth with JWT tokens
- **Habit Management**: Full CRUD operations for daily and weekly habits
- **Habit Logging**: Track habit completions with duplicate prevention
- **Streak Calculation**: Automatic calculation of current and longest streaks
- **Analytics Dashboard**: Comprehensive analytics with heatmaps, statistics, and completion rates
- **Row Level Security**: Database-level data isolation using Supabase RLS policies
- **Type Safety**: Built with TypeScript in strict mode
- **Input Validation**: Request validation using Zod schemas
- **Testing**: Comprehensive unit, integration, and property-based tests

## Tech Stack

- **Runtime**: Node.js LTS
- **Language**: TypeScript
- **Web Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT)
- **Validation**: Zod
- **Testing**: Jest + Supertest + fast-check
- **Package Manager**: npm

## Architecture

The application follows a three-layer architecture:

```
Controller Layer → Service Layer → Repository Layer → Database
```

- **Controller Layer**: Handles HTTP requests, validates input, formats responses
- **Service Layer**: Implements business logic, coordinates operations
- **Repository Layer**: Executes database queries, handles data persistence

## Prerequisites

- Node.js LTS (v18 or higher)
- npm (comes with Node.js)
- A Supabase project account

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here
JWT_SECRET=your-jwt-secret-here
PORT=3000
NODE_ENV=development
```

**Getting Supabase Credentials:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL (SUPABASE_URL)
4. Copy the anon/public key (SUPABASE_ANON_KEY)
5. Copy the service_role key (SUPABASE_SERVICE_KEY)

**JWT_SECRET:**
Generate a secure random string for JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Set Up Database

Run the setup script to create tables, indexes, and RLS policies:

```bash
npm run setup
```

This will:
- Validate environment variables
- Test database connectivity
- Create `habits` and `habit_logs` tables
- Apply Row Level Security policies
- Create performance indexes
- Verify setup completion

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your .env file).

## Frontend

The companion React frontend lives in [`frontend/`](./frontend). It is a separate Vite app and communicates **only** with this Express API; it does not contain or call Supabase credentials directly.

In a second terminal, after starting this API:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173`). `VITE_API_BASE_URL` defaults to `http://localhost:3000`; set it in `frontend/.env.local` when the API is hosted elsewhere. Do not put Supabase keys in any `VITE_` variable: browser-visible variables are intentionally public.

For local acceptance testing, registration requires a Philippine mobile number and explicit acceptance of the in-app Terms and Privacy Notice. The account stores the normalized number, notice version, and acceptance timestamp in Supabase Auth metadata. Before production, replace the privacy-contact placeholder in the notice with the responsible organization’s real contact details and have the terms reviewed for your business.

The local-testing legal documents are in [Privacy Notice](./docs/PRIVACY_NOTICE.md) and [Terms of Service](./docs/TERMS_OF_SERVICE.md).

Frontend checks:

```bash
cd frontend
npm test
npm run build
```

## Available Scripts

- `npm run dev` - Start the TypeScript development server
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run setup` - Set up database schema and RLS policies
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Logout and invalidate session

### Habits

- `POST /api/habits` - Create a new habit
- `GET /api/habits` - Get all user habits
- `GET /api/habits/:id` - Get a specific habit
- `PUT /api/habits/:id` - Update a habit
- `DELETE /api/habits/:id` - Delete a habit
- `GET /api/habits/:id/streak` - Get streak data for a habit

### Logs

- `POST /api/logs` - Log a habit completion
- `GET /api/logs/:habitId` - Get logs for a habit (with optional date filtering)
- `DELETE /api/logs/:id` - Delete a log entry

### Analytics

- `GET /api/analytics/dashboard` - Get comprehensive dashboard data

For endpoint details and request fields, see [API.md](./docs/API.md).

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Test Types

- **Unit Tests**: Test individual functions and classes in isolation
- **Integration Tests**: Test API endpoints with database operations
- **Property-Based Tests**: Test correctness properties across many inputs using fast-check

## Project Structure

```
habit-tracker-backend/
├── frontend/              # React + Vite client (API-only, no Supabase keys)
├── src/
│   ├── config/           # Configuration and environment variables
│   ├── controllers/      # HTTP request handlers
│   ├── services/         # Business logic
│   ├── repositories/     # Database operations
│   ├── middleware/       # Express middleware (auth, validation, error handling)
│   ├── types/            # TypeScript interfaces and types
│   ├── utils/            # Utility functions
│   └── server.ts         # Application entry point
├── scripts/
│   └── setup.ts          # Database setup script
├── tests/                # Test files
├── .env.example          # Example environment variables
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── jest.config.js        # Jest test configuration
└── README.md             # This file
```

## Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use strict mode for type checking
- Write descriptive variable and function names
- Add comments for complex logic
- Use Prettier for code formatting
- Use ESLint for code quality

### Testing Guidelines

- Write unit tests for all service methods
- Write integration tests for all API endpoints
- Use property-based tests for correctness properties
- Mock external dependencies in unit tests
- Use descriptive test names

### Security Guidelines

- Never commit `.env` file to version control
- Use environment variables for all sensitive data
- Validate all user inputs with Zod schemas
- Use Row Level Security policies at database level
- Sanitize error messages to avoid exposing sensitive data

## Deployment

### Production Checklist

1. Set all environment variables in production environment
2. Run database setup script against production Supabase project
3. Confirm RLS policies are active
4. Enable HTTPS for API endpoints
5. Implement rate limiting middleware
6. Configure CORS for allowed origins
7. Set up structured logging
8. Configure error tracking (e.g., Sentry)
9. Implement health check endpoint
10. Set up CI/CD pipeline

### Building for Production

```bash
npm run build
npm start
```

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.
