# User Management API

A professional RESTful API for user management built with Node.js, Express, and PostgreSQL.

## Features

- User registration and authentication
- Role-based user management
- Secure password handling with bcrypt
- PostgreSQL database with Sequelize ORM
- Comprehensive error handling

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=8585
   DB_USER=postgres
   DB_PASSWORD=Abdi@@123
   DB_NAME=abdirahman
   DB_HOST=localhost
   DB_PORT=5432
   ```
4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### User Management

#### Register a new user
- **URL**: `/api/users`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "role": "admin" // optional, defaults to "admin"
  }
  ```
- **Response**: Returns the created user without password

#### User Login
- **URL**: `/api/users/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: Returns the user data without password

#### Get All Users
- **URL**: `/api/users`
- **Method**: `GET`
- **Response**: Returns an array of all users

#### Get User by ID
- **URL**: `/api/users/:id`
- **Method**: `GET`
- **Response**: Returns the user with the specified ID

#### Update User
- **URL**: `/api/users/:id`
- **Method**: `PUT`
- **Body**:
  ```json
  {
    "email": "newemail@example.com", // optional
    "password": "newpassword123", // optional
    "role": "admin" // optional
  }
  ```
- **Response**: Returns the updated user

#### Delete User
- **URL**: `/api/users/:id`
- **Method**: `DELETE`
- **Response**: Success message

### Role Management

#### Get All Available Roles
- **URL**: `/api/users/roles`
- **Method**: `GET`
- **Response**: Returns an array of all available roles

#### Update User Role
- **URL**: `/api/users/:id/role`
- **Method**: `PATCH`
- **Body**:
  ```json
  {
    "role": "admin"
  }
  ```
- **Response**: Returns the updated user

#### Get Users by Role
- **URL**: `/api/users/role/:role`
- **Method**: `GET`
- **Response**: Returns all users with the specified role

## Database

The application uses PostgreSQL with Sequelize ORM. User data is stored in the `app_users` table.

## Development

Start the development server with auto-reload:
```
npm run dev
```

## Project Structure

```
.
├── package.json
├── src/
│   ├── config/
│   │   ├── config.js         # Database configuration
│   │   └── database.js       # Sequelize database connection
│   ├── controllers/
│   │   └── userController.js # User CRUD operations and authentication
│   ├── models/
│   │   ├── index.js          # Models associations
│   │   └── User.js           # User model definition
│   ├── routes/
│   │   ├── index.js          # Main routes file
│   │   └── userRoutes.js     # User routes
│   └── server.js             # Express server setup
└── .env                      # Environment variables
``` 