# Mental Health & Mindfulness Journal

A comprehensive MERN stack web application designed to support mental health and wellness through digital journaling, professional therapist connections, and community support.

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **Digital Journaling** - Create, edit, and manage daily journal entries with mood tracking
- **Mood Analytics** - Visualize emotional patterns with interactive charts and insights
- **Goal Tracking** - Set and monitor personal mental health goals
- **Mindfulness Resources** - Access curated meditation audio/video content
- **Breathing Exercises** - Interactive box breathing tool for stress relief

### Advanced Features
- **Therapist Dashboard** - Professional monitoring of patient progress and mood trends
- **Patient-Therapist Connection** - Secure linking between users and mental health professionals
- **Community Circles** - Topic-based support groups with moderated discussions
- **Anonymous Posting** - Share experiences privately in community circles
- **Admin Panel** - Content management and user moderation tools
- **Soft Ban System** - Temporary account suspension without data loss

## 🛠 Tech Stack

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Context API** - State management
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM library
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

## 📦 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd Mental_Health_Journal_try_Base
```

### 2. Install server dependencies
```bash
cd server
npm install
```

### 3. Install client dependencies
```bash
cd ../client
npm install
```

## ⚙️ Configuration

### Server Configuration

Create a `.env` file in the `server` directory:

```env
PORT=5050
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mental_health_journal
JWT_SECRET=your_jwt_secret_key_here
VITE_API_BASE=http://localhost:5050
```

### Client Configuration

The client is pre-configured to connect to `http://localhost:5050`. If you need to change this, update the API base URL in the client configuration files.

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Start the server:**
```bash
cd server
npm run dev
```
Server will run on `http://localhost:5050`

**Terminal 2 - Start the client:**
```bash
cd client
npm run dev
```
Client will run on `http://localhost:5173`

### Seeding the Database

To populate the database with initial data (meditation content, community circles):

```bash
cd server
node src/seed.js
```

## 👥 User Roles

### Regular User
- Create and manage journal entries
- View mood insights and analytics
- Set and track personal goals
- Access mindfulness resources
- Select a therapist
- Join community circles
- Post in communities (anonymous or public)

**Default Login:**
- Register normally without any secret codes

### Therapist
- View assigned patients
- Monitor patient mood trends
- Access patient analytics
- Professional dashboard with data visualizations

**Registration:**
- Use secret code: `therapistSecret: "therapist123"`

**Test Account:**
- Email: `therapist@mindspace.com`
- Password: `therapistt1234`

### Administrator
- Manage meditation content
- Create and delete community circles
- Ban/unban users (soft ban)
- Full platform oversight

**Registration:**
- Use secret code: `adminSecret: "admin123"`

**Test Account:**
- Email: `admin@mindspace.com`
- Password: `adminn1234`

## 📁 Project Structure

```
Mental_Health_Journal_try_Base/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context providers
│   │   ├── pages/         # Page components
│   │   └── App.jsx        # Main app component
│   └── package.json
│
├── server/                # Node.js backend
│   ├── src/
│   │   ├── middleware/   # Auth & role middleware
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Utility functions
│   │   ├── app.js        # Express app setup
│   │   └── seed.js       # Database seeding
│   └── package.json
│
└── report/               # Documentation
    ├── PROJECT_DOCUMENTATION.md
    └── API_DOCUMENTATION.md
```

## 📚 API Documentation

Comprehensive API documentation is available in [`/report/API_DOCUMENTATION.md`](./report/API_DOCUMENTATION.md)

### Quick API Overview

**Base URL:** `http://localhost:5050/api`

**Main Endpoints:**
- `/auth` - Authentication (register, login)
- `/journal` - Journal entries CRUD
- `/goals` - Goals management
- `/insights` - Mood analytics
- `/meditations` - Mindfulness content
- `/therapist` - Therapist-patient features
- `/circles` - Community circles
- `/admin` - Admin operations

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Role-Based Access Control** - Protected routes by user role
- **Soft Ban System** - Temporary suspension without data loss
- **Input Validation** - Server-side validation
- **CORS Protection** - Configured for security

## 🎨 Key Features Walkthrough

### For Users
1. **Register/Login** → Access your personal dashboard
2. **Create Journal Entry** → Track your daily mood and thoughts
3. **View Insights** → Analyze mood patterns with charts
4. **Set Goals** → Create and track wellness objectives
5. **Find Therapist** → Connect with a professional
6. **Join Community** → Participate in support circles

### For Therapists
1. **Login** → Auto-redirect to therapist dashboard
2. **View Patients** → See all assigned patients
3. **Monitor Progress** → Access patient mood trends
4. **Analyze Data** → View aggregated statistics

### For Admins
1. **Manage Content** → Add/remove meditation resources
2. **Create Circles** → Set up new community groups
3. **Moderate Users** → Ban/unban as needed

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Mental health professionals for guidance on features
- Open-source community for amazing tools and libraries
- Users who provided feedback during development

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ for mental health awareness and support**
