from typing import List
import os
from dotenv import load_dotenv
from pydantic import field_validator

# Load environment variables
load_dotenv()

class Settings:
    def __init__(self):
        self.environment = os.getenv("ENVIRONMENT", "development")
        
        # Parse allowed origins from env or use default
        origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:8000")
        self.allowed_origins = [origin.strip() for origin in origins.split(",") if origin.strip()]
        
        # Parse rate limits from env or use defaults
        self.rate_limit_per_day = int(os.getenv("RATE_LIMIT_PER_DAY", "5000"))
        self.rate_limit_per_hour = int(os.getenv("RATE_LIMIT_PER_HOUR", "500"))

settings = Settings()

UTILITIES = [
    {
        'id': 'pdf',
        'name': 'PDF Tools',
        'description': 'Combine and compress PDF files easily.',
        'path': '/pdf',
        'icon_path': 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
        'subnav': [
            {'name': 'Combine', 'anchor': 'combine'},
            {'name': 'Compress', 'anchor': 'compress'},
        ]
    },
    {
        'id': 'image',
        'name': 'Image Tools',
        'description': 'Resize, convert, and optimize images.',
        'path': '/image',
        'icon_path': 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
        'subnav': [
            {'name': 'Resize', 'anchor': 'resize'},
            {'name': 'Convert', 'anchor': 'convert'},
            {'name': 'Optimize', 'anchor': 'optimize'},
        ]
    },
    {
        'id': 'units',
        'name': 'Unit Converter',
        'description': 'Convert between different units of measurement.',
        'path': '/units',
        'icon_path': 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
        'subnav': [
            {'name': 'Length', 'anchor': 'length'},
            {'name': 'Area', 'anchor': 'area'},
            {'name': 'Volume', 'anchor': 'volume'},
            {'name': 'Weight', 'anchor': 'weight'},
            {'name': 'Temperature', 'anchor': 'temperature'},
        ]
    },
    {
        'id': 'currency',
        'name': 'Currency Converter',
        'description': 'Convert between different currencies.',
        'path': '/currency',
        'icon_path': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    }
]

# Unit conversion configurations
UNIT_CONVERSIONS = {
    'length': {
        'name': 'Length',
        'units': [
            {'id': 'km', 'name': 'Kilometers', 'to_base': lambda x: x * 1000},
            {'id': 'm', 'name': 'Meters', 'to_base': lambda x: x},
            {'id': 'cm', 'name': 'Centimeters', 'to_base': lambda x: x / 100},
            {'id': 'mm', 'name': 'Millimeters', 'to_base': lambda x: x / 1000},
            {'id': 'mi', 'name': 'Miles', 'to_base': lambda x: x * 1609.344},
            {'id': 'yd', 'name': 'Yards', 'to_base': lambda x: x * 0.9144},
            {'id': 'ft', 'name': 'Feet', 'to_base': lambda x: x * 0.3048},
            {'id': 'in', 'name': 'Inches', 'to_base': lambda x: x * 0.0254},
        ]
    },
    'area': {
        'name': 'Area',
        'units': [
            {'id': 'km2', 'name': 'Square Kilometers', 'to_base': lambda x: x * 1000000},
            {'id': 'm2', 'name': 'Square Meters', 'to_base': lambda x: x},
            {'id': 'cm2', 'name': 'Square Centimeters', 'to_base': lambda x: x / 10000},
            {'id': 'ha', 'name': 'Hectares', 'to_base': lambda x: x * 10000},
            {'id': 'ac', 'name': 'Acres', 'to_base': lambda x: x * 4046.856},
            {'id': 'ft2', 'name': 'Square Feet', 'to_base': lambda x: x * 0.092903},
        ]
    },
    'volume': {
        'name': 'Volume',
        'units': [
            {'id': 'm3', 'name': 'Cubic Meters', 'to_base': lambda x: x * 1000},
            {'id': 'l', 'name': 'Liters', 'to_base': lambda x: x},
            {'id': 'ml', 'name': 'Milliliters', 'to_base': lambda x: x / 1000},
            {'id': 'gal', 'name': 'Gallons (US)', 'to_base': lambda x: x * 3.785412},
            {'id': 'qt', 'name': 'Quarts (US)', 'to_base': lambda x: x * 0.946353},
            {'id': 'pt', 'name': 'Pints (US)', 'to_base': lambda x: x * 0.473176},
            {'id': 'fl_oz', 'name': 'Fluid Ounces (US)', 'to_base': lambda x: x * 0.0295735},
        ]
    },
    'weight': {
        'name': 'Weight',
        'units': [
            {'id': 'kg', 'name': 'Kilograms', 'to_base': lambda x: x * 1000},
            {'id': 'g', 'name': 'Grams', 'to_base': lambda x: x},
            {'id': 'mg', 'name': 'Milligrams', 'to_base': lambda x: x / 1000},
            {'id': 'lb', 'name': 'Pounds', 'to_base': lambda x: x * 453.592},
            {'id': 'oz', 'name': 'Ounces', 'to_base': lambda x: x * 28.3495},
        ]
    },
    'temperature': {
        'name': 'Temperature',
        'units': [
            {'id': 'c', 'name': 'Celsius', 'to_base': lambda x: x},
            {'id': 'f', 'name': 'Fahrenheit', 'to_base': lambda x: (x - 32) * 5/9},
            {'id': 'k', 'name': 'Kelvin', 'to_base': lambda x: x - 273.15},
        ]
    }
} 