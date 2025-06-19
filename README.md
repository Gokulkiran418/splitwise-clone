# Splitwise Clone

A full-stack Splitwise clone built with **FastAPI**, **React**, and **PostgreSQL**, featuring AI-powered chat capabilities via **OpenAI**. This app lets users manage group expenses, track balances, and query financial data conversationally.

---

## 🚀 Features

- User and group creation
- Add and split expenses
- View individual balances and group expenses
- AI Chatbot to parse queries like:
  - “How much does Alice owe?”
  - “Show my last 3 expenses”
  - “Who paid the most in Goa Trip?”

---
## Assumptions Made

- Project assumes a Dockerized PostgreSQL database or one running locally.
- Project assumes you have an OpenAI API key. Sorry its dangerous to upload private key in GitHub.
- Without OpenAI API only chatbot feature won't work. 
- Frontend and backend are separated in the project structure.

## 📦 Prerequisites

Ensure the following are installed:

- [Docker + Docker Compose](https://docs.docker.com/get-docker/)
- [Node.js v18+](https://nodejs.org/en)
- [Python 3.11+](https://www.python.org/)
- PostgreSQL 15+ (if not using Docker)
- An [OpenAI API Key](https://platform.openai.com/account/api-keys)

---

## 📁 Project Structure

```
splitwise-clone/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── api.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── .env
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   ├── components/
│   │   │   └── Chatbot.js
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   └── GroupPage.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## ✨ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Gokulkiran418/splitwise-clone.git
cd splitwise-clone
```

### 2. Add Environment Variables

Create a `.env` file in `backend/app/`:

```bash
touch backend/.env
```
- To use Chatbot feature paste your OpenAI API key in .env

Paste the following:
```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=postgresql://postgres:mypassword@db:5432/splitwise
```

> Replace `your_openai_api_key_here` with your real OpenAI API key.

### 3. Install Dependencies

#### Backend
- VSCode Default Terminal(Other OS and bash commands given below)
```bash
cd backend
python -m venv venv
venv\Scripts\activate # Windows bash: source venv/Scripts/activate, MAC and Linux: source venv/bin/activate
pip install -r requirements.txt
cd ..
```
- Important!
- CTRL + SHIFT + P (command palette) 
- Python: Select Interpreter
- Enter Interpreter Path -> Find
- Locate venv/Scripts/python.exe in the project root and double click python.exe

#### Frontend

```bash
cd frontend
npm install
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
cd ..
```
- Deprecated warnings and severity warnings can be ignored.
- These warnings doesn't affect workflow of project.

## 🛠️ Docker Setup

- Download Docker [Download Docker](https://www.docker.com/products/docker-desktop/)
- Install Docker

### 4. Run the Application

- Go to root directory of project, then run

```bash
docker-compose up --build
```

- Backend: [http://localhost:8000](http://localhost:8000)
- Frontend: [http://localhost:3000](http://localhost:3000)
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Running Project without Docker

- Install PostgreSQL(pgadmin) (Note username and password)
- Create Database, Example splitwise.
- Go to root backend/app/database.py 
- Change mypassword to PostgreSQL user password, database with your database name
  postgresql://postgres:mypassword@localhost:5432/database
- Open two terminals in VSCODE for backend and frontend
- Make sure to run venv command in root folder
  venv\Scripts\activate Windows bash: source venv/Scripts/activate , MAC and Linux: source venv/bin/activate
- Backend(from root)
```bash
cd backend
uvicorn app.main:app --reload
```
- Frontend(from root)
```bash
cd frontend
npm start
```
- Open http://localhost:3000

## 📘 FastAPI Auto-Generated Documentation

The **Splitwise Clone** project uses [FastAPI](https://fastapi.tiangolo.com/), a modern Python web framework that auto-generates interactive API documentation.

### 🔗 Accessing the API Docs

FastAPI provides two built-in documentation UIs:

- **Swagger UI** – Interactive and great for testing endpoints  
  👉 [http://localhost:8000/docs](http://localhost:8000/docs)

- **ReDoc** – A clean, readable documentation view  
  👉 [http://localhost:8000/redoc](http://localhost:8000/redoc)

> ✅ Ensure the backend is running before accessing these URLs.

---

### ⚙️ Prerequisites

## 🧪 Using Swagger UI

#### `GET /users`
Retrieve all users.

**Try It Out → Execute → Response:**
```json
[
  { "id": 1, "name": "Alice" },
  { "id": 2, "name": "Bob" }
]
```

---

#### `POST /users`
Create a new user.
```json
{
  "name": "Charlie"
}
```
**Response:**
```json
{
  "id": 3,
  "name": "Charlie"
}
```

---

#### `GET /groups`
Retrieve all groups.
```json
[
  { "id": 1, "name": "Goa Trip" },
  { "id": 2, "name": "Weekend Trip" }
]
```

---

#### `POST /groups`
Create a new group.
```json
{
  "name": "Beach Vacation",
  "member_ids": [1, 2]
}
```
**Response:**
```json
{
  "id": 3,
  "name": "Beach Vacation",
  "members": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
}
```

---

#### `POST /expenses`
Create a new expense.
```json
{
  "group_id": 1,
  "description": "Dinner",
  "amount": 100.0,
  "paid_by_id": 1,
  "splits": [
    { "user_id": 1, "share_amount": 50.0 },
    { "user_id": 2, "share_amount": 50.0 }
  ]
}
```

---

#### `GET /users/{user_id}/balance`
Check balance of a specific user.
```json
{
  "user_id": 1,
  "name": "Alice",
  "total_balance": -50.0,
  "group_balances": [
    {
      "group_id": 1,
      "group_name": "Goa Trip",
      "balance": -50.0
    }
  ]
}
```

---

#### `POST /chat`
Ask questions using natural language.
```json
{
  "query": "How much does Alice owe in group Goa Trip?",
  "current_user_id": 1
}
```
**Response:**
```json
{
  "response": "Alice owes $50 in Goa Trip."
}
```

---

## 📑 Schema Section (at bottom of Swagger UI)

You can view all Pydantic model definitions, including:
- Fields with types (`string`, `integer`, `float`, etc.)
- Required vs optional fields
- Example payloads

**Example: `ChatRequest` model**
```json
{
  "query": "string",
  "current_user_id": "integer | null"
}
```

---

## ❗ Common Errors

FastAPI's docs will show error responses:

- `422 Unprocessable Entity` – Missing or invalid fields
- `404 Not Found` – Resource not found
- `500 Internal Server Error` – Server-side issues

Example error for `POST /users` with empty name:
```json
{
  "detail": "Name is required"
}
```

---

## 📎 Copying Curl Commands

Each request tested in Swagger UI provides a `curl` tab for CLI use.

**Example: `POST /chat`**
```bash
curl -X 'POST' \
  'http://localhost:8000/chat' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"query":"How much does Alice owe in group Goa Trip?","current_user_id":1}'
```

Use this for scripting, testing, or integrating with external tools.

## ⏹️ Stop the App

```bash
docker-compose down
```

## ⚡ Troubleshooting

### Backend

```bash
docker logs splitwise-clone-backend-1
```

- Check .env file and OpenAI key

### Frontend

```bash
docker logs splitwise-clone-frontend-1
```

- Ensure `npm install` completed

### PostgreSQL

```bash
docker logs splitwise-clone-db-1
```

- Or reset DB:

```bash
docker-compose down -v && docker-compose up --build
```

### Chatbot

- Ensure a user is selected
- Open DevTools > Network > check `/chat` call

---

## 🌐 Developer Mode

### Run Backend Without Docker

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

### Run Frontend Without Docker

```bash
cd frontend
npm start
```

### Clear DB Records

```bash
docker exec -it splitwise-clone-db-1 psql -U postgres -d splitwise
```

Then run:

```sql
DELETE FROM expense_splits;
DELETE FROM expenses;
DELETE FROM group_members;
DELETE FROM groups;
DELETE FROM users;
```

---


