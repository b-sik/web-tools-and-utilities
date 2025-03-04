from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.config import UNIT_CONVERSIONS, UTILITIES
from .. import limiter

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

class ConversionResult(BaseModel):
    result: float

def convert_temperature(value: float, from_unit: str, to_unit: str) -> float:
    """Convert temperature between different units."""
    # First convert to Celsius (our base unit)
    if from_unit == 'c':
        celsius = value
    elif from_unit == 'f':
        celsius = (value - 32) * 5/9
    elif from_unit == 'k':
        celsius = value - 273.15
    else:
        raise ValueError(f"Unsupported temperature unit: {from_unit}")

    # Then convert from Celsius to target unit
    if to_unit == 'c':
        return celsius
    elif to_unit == 'f':
        return (celsius * 9/5) + 32
    elif to_unit == 'k':
        return celsius + 273.15
    else:
        raise ValueError(f"Unsupported temperature unit: {to_unit}")

@router.get("/")
@limiter.limit("60 per minute")
async def unit_converter(request: Request):
    """Render the unit converter page."""
    return templates.TemplateResponse(
        "units.html",
        {
            "request": request,
            "unit_types": UNIT_CONVERSIONS,
            "utilities": UTILITIES,
            "year": datetime.now().year
        }
    )

@router.get("/api/convert", response_model=ConversionResult)
@limiter.limit("120 per minute")  # Higher limit for API endpoint
async def convert_units(
    request: Request,  # Required for rate limiting
    type: str = Query(..., description="Type of unit to convert"),
    from_unit: str = Query(..., description="Source unit"),
    to_unit: str = Query(..., description="Target unit"),
    value: float = Query(..., description="Value to convert")
):
    """Convert a value from one unit to another."""
    try:
        if type not in UNIT_CONVERSIONS:
            raise HTTPException(status_code=400, detail="Invalid unit type")

        conversion_config = UNIT_CONVERSIONS[type]
        from_config = next((u for u in conversion_config['units'] if u['id'] == from_unit), None)
        to_config = next((u for u in conversion_config['units'] if u['id'] == to_unit), None)

        if not from_config or not to_config:
            raise HTTPException(status_code=400, detail="Invalid unit")

        # Special handling for temperature conversions
        if type == 'temperature':
            result = convert_temperature(value, from_unit, to_unit)
        else:
            # Convert to base unit first
            base_value = from_config['to_base'](value)
            
            # Then convert from base unit to target unit
            # If from_base function doesn't exist, we need to invert the to_base function
            if hasattr(to_config, 'from_base'):
                result = to_config['from_base'](base_value)
            else:
                # Invert the to_base function
                to_base_lambda = to_config['to_base']
                factor = to_base_lambda(1)
                result = base_value / factor if factor != 0 else 0

        return ConversionResult(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 