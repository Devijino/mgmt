# AI-Powered Project Management System

A comprehensive AI-enhanced project management solution designed to manage multiple projects and tasks with automation, smart scheduling, and powerful analytics.

## Features

- **Comprehensive Dashboard**: Visual overview of all your projects, tasks, and key metrics
- **Project & Task Management**: Kanban-style interface for tracking tasks with drag-and-drop functionality
- **Smart Calendar**: Schedule tasks and visualize deadlines with an interactive calendar
- **AI-Powered Assistance**:
  - Task suggestions based on project context
  - Automated schedule optimization
  - Intelligent prioritization of tasks
- **Analytics Dashboard**: Track project performance and completion metrics
- **Dark/Light Mode**: Support for both themes for comfortable usage
- **Responsive Design**: Access from any device with a fully responsive UI

## System Architecture

### Frontend
- **Framework**: React.js with Next.js
- **UI Libraries**: Chakra UI and Tailwind CSS
- **State Management**: React Context API and Zustand
- **Charts**: Chart.js for analytics visualization
- **Drag & Drop**: react-beautiful-dnd for Kanban boards

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (via SQLAlchemy ORM)
- **Authentication**: JWT-based authentication
- **AI Integration**: OpenAI GPT and LangChain for AI features
- **API Documentation**: Automatic with Swagger UI

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- PostgreSQL (optional, can use SQLite for development)

### Installation

#### Frontend

```bash
# Navigate to the frontend directory
cd mgmt-system/frontend

# Install dependencies
npm install

# Create a .env.local file
cp .env.example .env.local

# Start the development server
npm run dev
```

#### Backend

```bash
# Navigate to the backend directory
cd mgmt-system/backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload
```

### Environment Variables

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Backend (.env)
```
DATABASE_URL=sqlite:///./project_management.db
# For PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost/project_management
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=your-openai-api-key
```

## Usage

1. **Register/Login**: Create an account or log in to access the dashboard
2. **Create Projects**: Set up new projects with details, timelines, and team members
3. **Manage Tasks**: Create and assign tasks with priorities and deadlines
4. **Calendar View**: Schedule and visualize tasks on the calendar
5. **AI Features**: Get task suggestions and optimize schedules with AI assistance
6. **Analytics**: Track project progress and performance metrics

## Project Structure

```
mgmt-system/
├── frontend/             # React/Next.js frontend
│   ├── public/           # Static assets
│   └── src/              
│       ├── components/   # UI components
│       ├── context/      # State management
│       ├── hooks/        # Custom React hooks
│       ├── pages/        # Next.js pages
│       ├── styles/       # Global styles
│       └── utils/        # Utility functions
│
├── backend/              # FastAPI backend
│   ├── app/              
│   │   ├── ai/           # AI-related functionality
│   │   ├── models/       # Database models
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   └── migrations/       # Database migrations
│
└── docs/                 # Documentation
```

## Development

### Running Tests

#### Frontend
```bash
cd mgmt-system/frontend
npm run test
```

#### Backend
```bash
cd mgmt-system/backend
pytest
```

### Building for Production

#### Frontend
```bash
cd mgmt-system/frontend
npm run build
```

#### Backend
See the deployment documentation in the `docs` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for GPT integration
- LangChain for AI framework
- All open-source libraries used in this project 