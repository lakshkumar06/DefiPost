# DefiPost

DefiPost is a platform that connects founders, investors, and collaborators in the decentralized finance space. Build, invest, and grow together.

## Features

- **User Authentication**: Sign up as a founder, investor, or collaborator
- **Role-Based Access**: Different experiences based on your role
- **Project Management**: Create and manage projects
- **DeFi Integration**: Connect with DeFi protocols

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express
- SQLite
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/defipost.git
cd defipost
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Create a .env file in the backend directory with the following content:
```
PORT=5000
JWT_SECRET=your_jwt_secret
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
defipost/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── tailwind.config.js
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.