from fastapi import APIRouter, Request, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path
import logging
from PIL import Image
import io
import os
from datetime import datetime
import tempfile
from ..config import UTILITIES
from .. import limiter

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")
logger = logging.getLogger(__name__)

ALLOWED_FORMATS = ["JPEG", "PNG", "WEBP"]
TEMP_DIR = Path("temp")
TEMP_DIR.mkdir(exist_ok=True)

def save_temp_file(img: Image.Image, format: str, filename: str) -> Path:
    """Save image to a temporary file and return the path."""
    temp_path = TEMP_DIR / filename
    img.save(temp_path, format=format)
    return temp_path

@router.post("/resize")
@limiter.limit("20 per minute")
async def resize_image(
    request: Request,  # Required for rate limiting
    file: UploadFile = File(...),
    width: int = Form(...),
    height: int = Form(...),
    maintain_aspect: bool = Form(True)
):
    """Resize an uploaded image to specified dimensions."""
    try:
        # Read image
        image_data = await file.read()
        img = Image.open(io.BytesIO(image_data))
        
        # Calculate dimensions if maintaining aspect ratio
        if maintain_aspect:
            original_width, original_height = img.size
            aspect_ratio = original_width / original_height
            if width / height > aspect_ratio:
                width = int(height * aspect_ratio)
            else:
                height = int(width / aspect_ratio)
        
        # Resize image
        resized_img = img.resize((width, height), Image.Resampling.LANCZOS)
        
        # Save to temporary file
        filename = f"resized_{file.filename}"
        temp_path = save_temp_file(resized_img, img.format, filename)
        
        return FileResponse(
            temp_path,
            media_type=f"image/{img.format.lower()}",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
            background=lambda: os.unlink(temp_path)
        )
    except Exception as e:
        logger.error(f"Error resizing image: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing image")

@router.post("/convert")
@limiter.limit("20 per minute")
async def convert_image(
    request: Request,  # Required for rate limiting
    file: UploadFile = File(...),
    format: str = Form(...)
):
    """Convert an image to a different format."""
    try:
        if format.upper() not in ALLOWED_FORMATS:
            raise HTTPException(status_code=400, detail="Unsupported format")
        
        # Read image
        image_data = await file.read()
        img = Image.open(io.BytesIO(image_data))
        
        # Create filename
        original_name = Path(file.filename).stem
        filename = f"{original_name}.{format.lower()}"
        
        # Save to temporary file
        temp_path = save_temp_file(img, format, filename)
        
        return FileResponse(
            temp_path,
            media_type=f"image/{format.lower()}",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
            background=lambda: os.unlink(temp_path)
        )
    except Exception as e:
        logger.error(f"Error converting image: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing image")

@router.post("/optimize")
@limiter.limit("20 per minute")
async def optimize_image(
    request: Request,  # Required for rate limiting
    file: UploadFile = File(...),
    quality: int = Form(...)
):
    """Optimize an image by reducing its file size while maintaining acceptable quality."""
    try:
        # Read image
        image_data = await file.read()
        img = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if RGBA
        if img.mode == 'RGBA':
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background
        
        # Create filename
        filename = f"optimized_{file.filename}"
        
        # Save to temporary file with optimization
        temp_path = TEMP_DIR / filename
        img.save(temp_path, 
                format=img.format or 'JPEG',
                optimize=True, 
                quality=quality)
        
        return FileResponse(
            temp_path,
            media_type=f"image/{img.format.lower()}",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
            background=lambda: os.unlink(temp_path)
        )
    except Exception as e:
        logger.error(f"Error optimizing image: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing image")

@router.get("/")
async def image_tools(request: Request):
    """Render the image tools page."""
    return templates.TemplateResponse(
        "image.html",
        {
            "request": request,
            "formats": ALLOWED_FORMATS,
            "utilities": UTILITIES,
            "year": datetime.now().year
        }
    ) 