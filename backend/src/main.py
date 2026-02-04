from fastapi import FastAPI
from src.candidates.router import router as candidates_router
from src.campaigns.router import router as campaigns_router
from src.asbhy.router import router as ashby_router
from src.auth.router import router as auth_router
from src.fathom.router import router as fathom_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(candidates_router)
app.include_router(campaigns_router)
app.include_router(auth_router)
app.include_router(ashby_router)
app.include_router(fathom_router)

origins = [
    "http://localhost",
    "http://localhost:5175",
    "http://localhost:5174",
    "http://localhost:5173",
    "http://localhost:4173",
    "https://mpc-fe-4g06.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
