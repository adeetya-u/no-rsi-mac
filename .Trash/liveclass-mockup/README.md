# LiveClass Mockup - React Application

This is a React-based mockup of the LiveClass Participation Platform, demonstrating the core user interface and functionality.

## Features Demonstrated

### 🎯 Core Components
- **Dashboard**: Overview of forum activity, active questions, and team projects
- **Forum**: Real-time discussion board with posting and interaction features
- **Question Creator**: Interface for creating various question types (multiple choice, short answer, drawing, etc.)
- **Team Management**: Team formation, joining, and collaboration tools
- **Participation Analytics**: Professor view with student performance tracking and grading

### 🎨 UI Features
- **Responsive Design**: Works on desktop and mobile devices
- **Role-based Views**: Different interfaces for students and professors
- **Interactive Elements**: Buttons, forms, and real-time updates
- **Modern Styling**: Clean, professional interface with intuitive navigation

### 📊 Mock Data
- Sample forum posts and discussions
- Mock student participation data
- Example teams and projects
- Simulated question responses and analytics

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation
1. Navigate to the project directory:
   ```bash
   cd liveclass-mockup
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application

### Available Scripts
- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard with overview cards
│   ├── Forum.tsx              # Discussion forum interface
│   ├── QuestionCreator.tsx    # Question creation and answering
│   ├── TeamManagement.tsx     # Team formation and management
│   └── ParticipationAnalytics.tsx # Professor analytics view
├── App.tsx                    # Main application component
├── App.css                    # Global styles and component styling
└── index.tsx                  # Application entry point
```

## User Interface

### Student View
- **Dashboard**: Shows participation summary, recent forum posts, active questions, and team projects
- **Forum**: Post messages, like/reply to discussions, view class conversations
- **Questions**: Answer various question types, view peer questions
- **Teams**: Join/create teams, collaborate on projects

### Professor View
- **Dashboard**: Same as student with additional professor tools
- **Forum**: Moderate discussions, post announcements
- **Questions**: Create questions, monitor responses, manage question bank
- **Teams**: Manage team formation, track collaboration
- **Analytics**: View detailed participation metrics, generate reports, export data

## Technology Stack

- **React 18** with TypeScript
- **CSS3** for styling and responsive design
- **Create React App** for development tooling
- **Modern JavaScript** (ES6+) features

## Mockup Limitations

This is a frontend mockup and does not include:
- Backend API integration
- Real-time WebSocket connections
- Database persistence
- User authentication
- File upload functionality
- Advanced drawing canvas

## Future Development

The mockup serves as a foundation for the full LiveClass platform, which will include:
- Backend API development
- Database integration
- Real-time communication
- User authentication and authorization
- Advanced analytics and reporting
- Mobile application

## Contributing

This mockup was created as part of CS 411 Database Systems project. For development questions or suggestions, please contact the development team.

## Team Members

- **Adeetya Upadhyay** (Team Lead) - adeeu2@illinois.edu
- **Devansh Mathijia** - dam16@illinois.edu  
- **Jonathan Chen** - cwchen7@illinois.edu
- **Rona Oum** - roum@illinois.edu