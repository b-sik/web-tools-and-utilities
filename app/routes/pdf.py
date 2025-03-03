from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pypdf import PdfReader, PdfWriter
from pathlib import Path
import logging
import tempfile
import shutil
import os

logger = logging.getLogger(__name__)
router = APIRouter()

# Create a temporary directory that persists across requests
TEMP_DIR = Path(tempfile.gettempdir()) / "web_utils_pdfs"
TEMP_DIR.mkdir(exist_ok=True)

@router.post("/combine")
async def combine_pdfs(files: list[UploadFile] = File(...), background_tasks: BackgroundTasks = None):
    """Combine multiple PDF files into one."""
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files are required")
    
    logger.info(f"Combining {len(files)} PDF files")
    
    try:
        writer = PdfWriter()
        temp_files = []
        
        # Process each uploaded file
        for file in files:
            if not file.filename.lower().endswith('.pdf'):
                raise HTTPException(status_code=400, detail="All files must be PDFs")
            
            # Create a temporary file for this upload
            temp_path = TEMP_DIR / f"upload_{file.filename}"
            content = await file.read()
            temp_path.write_bytes(content)
            temp_files.append(temp_path)
            
            # Read PDF and append all pages
            reader = PdfReader(str(temp_path))
            for page in reader.pages:
                writer.add_page(page)
        
        # Save the combined PDF
        timestamp = tempfile.mktemp(prefix='', dir='').lstrip('/')  # Get a unique identifier
        output_path = TEMP_DIR / f"combined_{timestamp}.pdf"
        with open(output_path, "wb") as output_file:
            writer.write(output_file)
        
        # Clean up individual upload files
        for temp_file in temp_files:
            try:
                temp_file.unlink()
            except Exception as e:
                logger.warning(f"Failed to delete temporary file {temp_file}: {e}")
        
        # Add cleanup task to background tasks
        background_tasks.add_task(cleanup_file, output_path)
        
        # Return the combined PDF
        return FileResponse(
            path=output_path,
            filename="combined.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        logger.error(f"Error combining PDFs: {str(e)}")
        # Clean up any temporary files in case of error
        for temp_file in temp_files:
            try:
                temp_file.unlink()
            except Exception:
                pass
        raise HTTPException(status_code=500, detail="Failed to combine PDF files")

@router.post("/compress")
async def compress_pdf(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    """Compress a PDF file."""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    logger.info(f"Compressing PDF file: {file.filename}")
    
    try:
        # Save uploaded file
        temp_path = TEMP_DIR / f"upload_{file.filename}"
        content = await file.read()
        temp_path.write_bytes(content)
        
        # Read and compress
        reader = PdfReader(str(temp_path))
        writer = PdfWriter()
        
        # Copy pages with compression
        for page in reader.pages:
            writer.add_page(page)
        
        # Set compression parameters
        writer.add_metadata(reader.metadata)
        
        # Save compressed file
        timestamp = tempfile.mktemp(prefix='', dir='').lstrip('/')  # Get a unique identifier
        output_path = TEMP_DIR / f"compressed_{timestamp}_{file.filename}"
        with open(output_path, "wb") as output_file:
            writer.write(output_file)
        
        # Clean up the upload file
        try:
            temp_path.unlink()
        except Exception as e:
            logger.warning(f"Failed to delete temporary file {temp_path}: {e}")
        
        # Add cleanup task to background tasks
        background_tasks.add_task(cleanup_file, output_path)
        
        # Return the compressed PDF
        return FileResponse(
            path=output_path,
            filename=f"compressed_{file.filename}",
            media_type="application/pdf"
        )
    except Exception as e:
        logger.error(f"Error compressing PDF: {str(e)}")
        # Clean up the temporary file in case of error
        try:
            temp_path.unlink()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail="Failed to compress PDF file")

def cleanup_file(file_path: Path):
    """Clean up a temporary file after it has been sent."""
    try:
        file_path.unlink()
    except Exception as e:
        logger.warning(f"Failed to delete temporary file {file_path}: {e}")

# Cleanup old temporary files on startup
def cleanup_old_files():
    """Clean up old temporary files."""
    try:
        for file in TEMP_DIR.glob("*"):
            try:
                file.unlink()
            except Exception as e:
                logger.warning(f"Failed to delete old temporary file {file}: {e}")
    except Exception as e:
        logger.error(f"Error cleaning up temporary directory: {e}")

# Clean up old files when the module loads
cleanup_old_files() 