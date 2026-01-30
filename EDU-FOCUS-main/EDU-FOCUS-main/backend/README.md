# EDU-FOCUS Backend API

Flask backend server for EDU-FOCUS student learning platform.

## Features

- **Authentication**: JWT-based user authentication
- **Database**: SQLAlchemy with SQLite (upgradeable to PostgreSQL)
- **Security**: Password hashing, CORS protection, token management
- **AI Integration**: OpenAI API proxy for secure key management
- **RESTful API**: Complete CRUD operations for all study tools

## Installation

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Edit `.env` file with your settings:
```
OPENAI_API_KEY=your-openai-api-key
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
```

### 3. Run the Server

```bash
python app.py
```

Server will start on `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user
- `PUT /update-profile` - Update user profile

### Study Tools (`/api/study`)

**Sessions:**
- `GET /sessions` - Get all study sessions
- `POST /sessions` - Create session
- `PUT /sessions/<id>` - Update session
- `DELETE /sessions/<id>` - Delete session

**Flashcards:**
- `GET /flashcards/decks` - Get all decks
- `POST /flashcards/decks` - Create deck
- `DELETE /flashcards/decks/<id>` - Delete deck
- `POST /flashcards/decks/<id>/cards` - Add card
- `DELETE /flashcards/cards/<id>` - Delete card

**Notes:**
- `GET /notes` - Get all notes
- `POST /notes` - Create note
- `PUT /notes/<id>` - Update note
- `DELETE /notes/<id>` - Delete note

**Quizzes:**
- `GET /quizzes` - Get all quizzes
- `POST /quizzes` - Create quiz
- `DELETE /quizzes/<id>` - Delete quiz

**Mind Maps:**
- `GET /mindmaps` - Get all mind maps
- `POST /mindmaps` - Create mind map
- `PUT /mindmaps/<id>` - Update mind map
- `DELETE /mindmaps/<id>` - Delete mind map

**Pomodoro:**
- `GET /pomodoro/stats` - Get statistics
- `POST /pomodoro/stats` - Update statistics

### AI Features (`/api/ai`)

- `POST /chat` - AI Assistant chat
- `POST /summarize-video` - Video summarization
- `POST /summarize-pdf` - PDF summarization
- `POST /recommendations` - Get study recommendations
- `POST /study-guide` - Generate study guide
- `POST /analyze-material` - Analyze uploaded material

## Database Schema

### Users
- id, username, email, password_hash, full_name, created_at, last_login

### StudySession
- id, user_id, subject, session_date, session_time, duration, goals, status

### FlashcardDeck
- id, user_id, name, description, created_at

### Flashcard
- id, deck_id, question, answer, difficulty, review stats

### Note
- id, user_id, title, content, tags, timestamps

### Quiz
- id, user_id, title, topic, difficulty, questions_data, score

### MindMap
- id, user_id, title, description, map_data, timestamps

### PomodoroStats
- id, user_id, sessions_completed, total_focus_time, date

## Security Features

✅ JWT token authentication
✅ Password hashing with bcrypt
✅ CORS protection
✅ API key security (server-side)
✅ Input validation
✅ SQL injection prevention (SQLAlchemy)

## Production Deployment

### Using Gunicorn

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Environment Variables (Production)

```
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
OPENAI_API_KEY=your-api-key
SECRET_KEY=strong-random-secret
JWT_SECRET_KEY=strong-random-jwt-secret
```

## Tech Stack

- **Flask 3.0** - Web framework
- **SQLAlchemy** - ORM
- **Flask-JWT-Extended** - JWT authentication
- **Flask-Bcrypt** - Password hashing
- **Flask-CORS** - CORS handling
- **OpenAI API** - AI features
- **SQLite/PostgreSQL** - Database
