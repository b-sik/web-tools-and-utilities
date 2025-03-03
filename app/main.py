from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
import logging
from datetime import datetime
from .routes.pdf import router as pdf_router
from .config import UTILITIES

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="Web Utilities")

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Setup templates
templates = Jinja2Templates(directory="app/templates")

# Add template context processor for common variables
@app.middleware("http")
async def add_template_context(request: Request, call_next):
    request.state.year = datetime.now().year
    response = await call_next(request)
    return response

# Create uploads directory
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

# Include routers
app.include_router(pdf_router, prefix="/pdf", tags=["pdf"])

@app.get("/")
async def home(request: Request):
    """Render the home page with all available utilities."""
    logger.info("Home page accessed")
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "year": request.state.year, "utilities": UTILITIES}
    )

@app.get("/pdf")
async def pdf_tools(request: Request):
    """Render the PDF tools page."""
    logger.info("PDF tools page accessed")
    return templates.TemplateResponse(
        "utilities/pdf.html",
        {"request": request, "year": request.state.year, "utilities": UTILITIES}
    )

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    logger.info("Health check endpoint accessed")
    return {"status": "ok", "timestamp": datetime.now().isoformat()} 