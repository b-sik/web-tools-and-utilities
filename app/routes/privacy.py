from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
from datetime import datetime
from app.config import UTILITIES

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

@router.get("/")
async def privacy_policy(request: Request):
    """Render the privacy policy page."""
    return templates.TemplateResponse(
        "privacy.html",
        {
            "request": request,
            "utilities": UTILITIES,
            "year": datetime.now().year
        }
    ) 