from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# --- CORS FIX (allows Expo app to connect) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Allow all devices on your network
    allow_credentials=True,
    allow_methods=["*"],          # Allow POST, GET, etc
    allow_headers=["*"],
)
# ---------------------------------------------

# Booking model
class Booking(BaseModel):
    pickup: str
    dropoff: str

# Test route
@app.get("/")
def read_root():
    return {"status": "Backend running"}

# Booking route
@app.post("/book")
def make_booking(data: Booking):
    return {
        "message": "Booking received",
        "pickup": data.pickup,
        "dropoff": data.dropoff
    }




