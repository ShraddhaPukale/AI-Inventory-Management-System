from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers.products import router as products_router

from routers.auth import router as auth_router

app = FastAPI(title="AI Inventory Management System")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include product routes
app.include_router(products_router)
app.include_router(auth_router)

# Root API
@app.get("/")
def root():
    return {"message": "AI Inventory Management System API is running!"}