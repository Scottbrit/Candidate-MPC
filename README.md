# ConciousMindV2 - Project Handoff Documentation

---

## Technology Stack

### Frontend

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: TanStack React Form
- **PDF Generation**: @react-pdf/renderer
- **Authentication**: Supabase JS Client

### Backend

- **Framework**: FastAPI
- **Task Queue**: Celery
- **Broker/Cache**: Redis
- **Package Manager**: uv
- **Database/Auth**: Supabase
- **PDF Processing**: PyPDF

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Production Platform**: Render.com
- **Services**: Web servers (backend & frontend), Celery worker, Redis

---

## Running Locally

### Prerequisites

Before running the project locally, ensure you have:

- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Git** - For cloning the repository

### Step 1: Clone the Repository

```bash
git clone https://github.com/ardaakdere/ConciousMindV2.git
cd ConciousMindV2
```

### Step 2: Set Up Environment Files

You need to create **two** `.env` files:

#### Backend Environment File

Create `backend/.env` with the following variables:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SECRET_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key

# Apollo (for data enrichment)
APOLLO_API_KEY=your_apollo_api_key

# Ashby (ATS integration)
ASHBY_API_KEY=your_ashby_api_key

# Fathom Analytics
FATHOM_API_KEY=your_fathom_api_key

# Email Configuration (SMTP)
EMAIL_HOSTNAME=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password

# LemList (email automation)
LEMLIST_API_KEY=your_lemlist_api_key

# Celery/Redis (handled automatically by compose.yaml)
CELERY_BROKER_URL=redis://redis:6379
CELERY_RESULT_BACKEND=redis://redis:6379
```

#### Frontend Environment File

Create `frontend/.env` with:

```bash
# Backend API URL
VITE_APP_API_URL=http://localhost:8000
```

### Step 3: Start the Application

Run the entire stack with a single command:

```bash
docker-compose up
```

This single command starts:

- **Backend API** (Port 8000)
- **Celery Worker** (background tasks)
- **Redis** (Port 6379)
- **Frontend Dev Server** (Port 5173)

### Step 4: Access the Application

Once running, open your browser to:

- **Frontend**: http://localhost:5173
- **Backend API Docs**: http://localhost:8000/docs (Swagger UI)

### Step 5: Stopping the Application

Press `Ctrl+C` in the terminal where docker-compose is running, or run:

```bash
docker-compose down
```

---

## Deployment Guide

The application is configured to deploy to **Render.com** using the `render.yaml` blueprint.

### Architecture on Render

The deployment consists of 4 services:

1. **mpc-be** (Backend Web Service) - FastAPI application
2. **celery-worker** (Background Worker) - Celery task processor
3. **mpc-fe** (Frontend Static Site) - React application
4. **redis-broker** (Redis Key-Value Store) - Message broker & cache

### Deployment Steps

#### Automatic Deployment

1. **Connect Repository to Render**
   
   - Log in to [render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`

2. **Configure Environment Variables**
   
   Render will prompt you to set all the environment variables listed in `render.yaml`. You need to provide:
   
   **For Backend (mpc-be):**
   
   - `ASHBY_API_KEY`
   - `FATHOM_API_KEY`
   - `OPENAI_API_KEY`
   - `EMAIL_HOSTNAME`
   - `EMAIL_USERNAME`
   - `EMAIL_PASSWORD`
   - `EMAIL_PORT`
   - `LEMLIST_API_KEY`
   - `SUPABASE_JWT_SECRET`
   - `SUPABASE_SECRET_KEY`
   - `SUPABASE_URL`
   
   *(Note: CELERY_BROKER_URL and CELERY_RESULT_BACKEND are auto-populated from Redis service)*
   
   **For Worker (celery-worker):**
   
   - Same as backend (Render will sync these automatically)
   
   **For Frontend (mpc-fe):**
   
   - `VITE_APP_API_URL` - Set to your backend URL: `https://mpc-be.onrender.com`

3. **Deploy**
   
   - Click "Apply" to create all services
   - Render will build and deploy automatically
   - Initial deployment takes ~10-15 minutes

---

## Key Features & Routes

### Frontend Routes

#### Public Routes

- `/login` - Magic link login page
- `/magic-link` - Magic link verification

#### Admin Routes (Role: 'admin')

- `/` - Redirects to dashboard
- `/dashboard` - Candidates list view
- `/candidates/new` - Create new candidate
- `/candidates/:id` - Edit candidate
- `/campaigns` - Campaigns list
- `/campaigns/:id` - Campaign details

#### Candidate Routes (Role: 'candidate')

- `/candidate/selection` - Company selection interface
- `/candidate/thank-you` - Submission confirmation

### Backend API Endpoints

All routes are documented at `http://localhost:8000/docs` when running locally.

**Main Routers:**

- `/auth/*` - Authentication endpoints
- `/candidates/*` - Candidate CRUD operations
- `/campaigns/*` - Campaign management
- `/ashby/*` - Ashby integration endpoints
- `/fathom/*` - Analytics endpoints

---

## 📝 Important Notes for Technical Handoff

### Code Organization

1. **Backend Architecture**
   
   - FastAPI follows a modular structure with separate routers for each domain
   - Dependency injection is used extensively (`dependencies.py`)
   - All environment configs are centralized in `config.py`
   - Celery tasks are defined in `src/workers/`

2. **Frontend Architecture**
   
   - Uses feature-based folder structure
   - Route-based code splitting (lazy loading)
   - Centralized API configuration
   - Role-based route protection via `ProtectedRoute` component

3. **Authentication Flow**
   
   - Magic link authentication via Supabase
   - JWT tokens stored in client
   - Role-based authorization (admin/candidate)
   - Protected routes check user role before rendering

### Database Schema

The database is managed in **Supabase**. Key tables:

- `candidates` - Candidate information
- `campaigns` - Marketing campaigns
- `users` - Authentication (managed by Supabase Auth)

> **Access Database**: Log into Supabase dashboard → Table Editor
