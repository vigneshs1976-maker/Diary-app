# 📖 My Diary — Online Diary Web Application

A secure, real-time online diary built with **React + Django + MySQL**.

---

## 🏗️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS        |
| Backend    | Django 5, Django REST Framework     |
| Auth       | JWT (SimpleJWT) with token refresh  |
| Database   | MySQL                               |
| HTTP       | Axios with interceptors             |

---

## 🔐 Security Features

- **JWT Authentication** — access tokens (1 day) + refresh tokens (30 days)
- **Token auto-refresh** — transparent renewal via Axios interceptors
- **Token blacklisting** — refresh tokens invalidated on logout
- **Bcrypt password hashing** — via Django's `AbstractBaseUser`
- **Django password validators** — minimum length, common password checks
- **Per-user data isolation** — every entry filtered by authenticated user
- **CORS protection** — only allowed origins can call the API
- **CSRF middleware** — Django default protection

---

## 📁 Project Structure

```
diary-app/
├── backend/                  # Django project
│   ├── config/
│   │   ├── settings.py       # Django settings (MySQL, JWT, CORS)
│   │   └── urls.py           # Root URL configuration
│   ├── accounts/             # User auth app
│   │   ├── models.py         # Custom User model
│   │   ├── serializers.py    # Register / Profile serializers
│   │   ├── views.py          # Register, Login, Logout, Profile
│   │   └── urls.py           # /api/auth/* routes
│   ├── entries/              # Diary entries app
│   │   ├── models.py         # Entry + Tag models
│   │   ├── serializers.py    # Entry CRUD serializers
│   │   ├── views.py          # Dashboard + Entry CRUD views
│   │   └── urls.py           # /api/entries/* routes
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                 # React + Vite project
    └── src/
        ├── api/
        │   └── axios.js      # Axios instance + JWT interceptors
        ├── context/
        │   └── AuthContext.jsx  # Global auth state
        ├── pages/
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   └── Dashboard.jsx
        ├── components/
        │   ├── EntryCard.jsx    # Entry display card
        │   └── EntryEditor.jsx  # Create/edit modal
        ├── App.jsx           # Router + protected routes
        └── main.jsx
```

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8+

---

### 1. MySQL — Create the database

```sql
CREATE DATABASE diary_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'diary_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON diary_db.* TO 'diary_user'@'localhost';
FLUSH PRIVILEGES;
```

---

### 2. Backend (Django)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment — edit settings.py or use .env
# Update DATABASES section with your MySQL credentials:
#   NAME: diary_db
#   USER: diary_user
#   PASSWORD: your_strong_password
#   HOST: localhost
#   PORT: 3306

# Run migrations
python manage.py makemigrations
python manage.py migrate

# (Optional) Create admin user
python manage.py createsuperuser

# Start the server
python manage.py runserver
```

The Django API will run at **http://localhost:8000**

---

### 3. Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The React app will run at **http://localhost:5173**

---

## 🔗 API Endpoints

### Auth (`/api/auth/`)
| Method | Endpoint            | Description              | Auth |
|--------|---------------------|--------------------------|------|
| POST   | `/register/`        | Create new account       | No   |
| POST   | `/login/`           | Login, receive tokens    | No   |
| POST   | `/logout/`          | Blacklist refresh token  | Yes  |
| GET    | `/profile/`         | Get current user info    | Yes  |
| PATCH  | `/profile/`         | Update user info         | Yes  |
| POST   | `/token/refresh/`   | Get new access token     | No   |

### Entries (`/api/`)
| Method | Endpoint              | Description                    | Auth |
|--------|-----------------------|--------------------------------|------|
| GET    | `/dashboard/`         | All entries + user stats       | Yes  |
| GET    | `/entries/`           | List entries (search/filter)   | Yes  |
| POST   | `/entries/`           | Create entry                   | Yes  |
| GET    | `/entries/{id}/`      | Get single entry               | Yes  |
| PUT    | `/entries/{id}/`      | Full update entry              | Yes  |
| PATCH  | `/entries/{id}/`      | Partial update                 | Yes  |
| DELETE | `/entries/{id}/`      | Delete entry                   | Yes  |

### Query Parameters for `/api/entries/`
- `?search=keyword` — search in title, body, tags
- `?date=YYYY-MM-DD` — filter by date

---

## ✨ Features

- **Secure auth** with JWT access + refresh tokens
- **Rich diary entries** — title, body, color theme, custom tags
- **Interactive calendar** — click any date to filter entries
- **Search** — filter by keyword across title, content, and tags
- **Stats panel** — word count, entry count, streak, tag count
- **Color themes** — 9 card background colors per entry
- **Edit & delete** with confirmation dialog
- **Auto-redirect** — unauthenticated users sent to login
- **Responsive layout** — clean, modern design

---

## 🌐 Production Deployment Tips

1. Set `DEBUG = False` and configure `ALLOWED_HOSTS` in settings
2. Use environment variables for `SECRET_KEY`, `DB_PASSWORD`
3. Set up Gunicorn + Nginx for Django
4. Build React: `npm run build` → serve `dist/` with Nginx
5. Use HTTPS + set `CORS_ALLOWED_ORIGINS` to your domain
6. Enable `rest_framework_simplejwt.token_blacklist` in `INSTALLED_APPS` for logout
