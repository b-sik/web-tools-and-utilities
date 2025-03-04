from fastapi import APIRouter, Request, HTTPException
from fastapi.templating import Jinja2Templates
from datetime import datetime
import httpx
from app.config import UTILITIES

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

# Common currencies with their names
CURRENCIES = [
    {"code": "USD", "name": "US Dollar"},
    {"code": "EUR", "name": "Euro"},
    {"code": "GBP", "name": "British Pound"},
    {"code": "JPY", "name": "Japanese Yen"},
    {"code": "AUD", "name": "Australian Dollar"},
    {"code": "CAD", "name": "Canadian Dollar"},
    {"code": "CHF", "name": "Swiss Franc"},
    {"code": "CNY", "name": "Chinese Yuan"},
    {"code": "INR", "name": "Indian Rupee"},
    {"code": "NZD", "name": "New Zealand Dollar"},
]

@router.get("/")
async def currency_converter(request: Request):
    """Render the currency converter page."""
    return templates.TemplateResponse(
        "currency.html",
        {
            "request": request,
            "utilities": UTILITIES,
            "currencies": CURRENCIES,
            "year": datetime.now().year
        }
    )

@router.get("/api/convert")
async def convert_currency(
    amount: float,
    from_currency: str,
    to_currency: str
):
    """Convert between currencies using the ExchangeRate-API."""
    try:
        # Using the free ExchangeRate-API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://open.er-api.com/v6/latest/{from_currency}"
            )
            data = response.json()

            if "error" in data:
                raise HTTPException(status_code=400, detail=data["error"])

            if to_currency not in data["rates"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Currency {to_currency} not found"
                )

            rate = data["rates"][to_currency]
            result = amount * rate

            return {
                "result": result,
                "rate": rate,
                "timestamp": data["time_last_update_unix"] * 1000  # Convert to milliseconds
            }

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail="Unable to fetch exchange rates"
        ) from e 