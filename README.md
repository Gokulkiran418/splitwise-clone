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
touch backend/app/.env
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

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

#### Frontend

```bash
cd frontend
npm install
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
cd ..
```

---

## 🛠️ Docker Setup

- Download Docker [text](https://www.docker.com/products/docker-desktop/)
- Install Docker

### 4. Run the Application

- Go to root directory of project, then run

```bash
docker-compose up --build
```

- Backend: [http://localhost:8000](http://localhost:8000)
- Frontend: [http://localhost:3000](http://localhost:3000)
- API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 💳 Usage

### Add Users

- Go to homepage (`/`) and use the "Add User" form
- Users will appear instantly in the chatbot dropdown and user list

### Create Groups

- Navigate to `/groups` and use the group form
- Groups show up in dropdowns

### Add Expenses

- Inside a group page, use the expense form
- Balances update in real time

### Use the Chatbot

- Open the chat bubble (bottom-right corner)
- Select a user from the dropdown
- Try queries like:
  - "How much does Alice owe in Goa Trip?"
  - "Show me my last 3 expenses"
  - "Who paid the most in Weekend Trip?"

---

## ⏹️ Stop the App

```bash
docker-compose down
```

To remove database data:

```bash
docker-compose down -v
```

---

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


