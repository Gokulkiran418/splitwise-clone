from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router
from app.database import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Splitwise Clone API")
# Allow CORS for frontend communication (localhost:3000 for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)