from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import logging
from datetime import datetime
from .routes.pdf import router as pdf_router
from .routes.image import router as image_router
from .routes.units import router as units_router
from .routes.privacy import router as privacy_router
from .routes.currency import router as currency_router
from .config import UTILITIES, settings
from fastapi.responses import FileResponse

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
app = FastAPI(
    title="Web Utilities",
    docs_url="/api/docs" if settings.environment == "development" else None,
    redoc_url="/api/redoc" if settings.environment == "development" else None,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],  # You can restrict this to specific methods if needed
    allow_headers=["*"],  # You can restrict this to specific headers if needed
)

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
app.include_router(image_router, prefix="/image", tags=["image"])
app.include_router(units_router, prefix="/units", tags=["units"])
app.include_router(privacy_router, prefix="/privacy", tags=["privacy"])
app.include_router(currency_router, prefix="/currency", tags=["currency"])

# Serve robots.txt and sitemap.xml from root
@app.get("/robots.txt")
async def robots():
    """Serve robots.txt file."""
    return FileResponse("app/static/robots.txt")

@app.get("/sitemap.xml")
async def sitemap():
    """Serve sitemap.xml file."""
    return FileResponse("app/static/sitemap.xml")

@app.get("/")
async def home(request: Request):
    """Render the home page."""
    logger.info("Home page accessed")
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "year": request.state.year, "utilities": UTILITIES}
    )

@app.get("/favicon.ico")
async def favicon():
    """Serve the favicon."""
    return FileResponse("app/static/img/favicon.ico")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    logger.info("Health check endpoint accessed")
    return {"status": "ok", "timestamp": datetime.now().isoformat()} 