# Web Tools and Utilities

A comprehensive collection of web-based tools and utilities built with FastAPI and Python.

## Features

- **PDF Tools**
  - Combine multiple PDF files into one
  - Compress PDFs while maintaining readability
  
- **Image Tools**
  - Resize images with optional aspect ratio preservation
  - Convert between different image formats (JPEG, PNG, WEBP)
  - Optimize images to reduce file size
  
- **Unit Converter**
  - Length (km, m, cm, mm, mi, yd, ft, in)
  - Area (km², m², cm², ha, ac, ft²)
  - Volume (m³, L, mL, gal, qt, pt, fl oz)
  - Weight (kg, g, mg, lb, oz)
  - Temperature (Celsius, Fahrenheit, Kelvin)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/web-utils.git
cd web-utils
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

The application will be available at:
- Web Interface: http://127.0.0.1:8000
- API Documentation: http://127.0.0.1:8000/docs

## API Routes

### PDF Tools
- `GET /pdf` - PDF tools interface
- `POST /pdf/combine` - Combine multiple PDFs
- `POST /pdf/compress` - Compress a PDF file

### Image Tools
- `GET /image` - Image tools interface
- `POST /image/resize` - Resize an image
- `POST /image/convert` - Convert image format
- `POST /image/optimize` - Optimize image size

### Unit Converter
- `GET /units` - Unit converter interface
- `GET /units/api/convert` - Convert between units
  - Parameters:
    - `type`: Type of conversion (length, area, volume, weight, temperature)
    - `from_unit`: Source unit
    - `to_unit`: Target unit
    - `value`: Value to convert

### Other Pages
- `GET /privacy` - Privacy Policy

## Technologies Used

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Jinja2](https://jinja.palletsprojects.com/) - Template engine
- [PyPDF2](https://pypdf2.readthedocs.io/) - PDF processing
- [Pillow](https://python-pillow.org/) - Image processing
- [Pydantic](https://pydantic-docs.helpmanual.io/) - Data validation

## Development

The project structure follows FastAPI best practices:
```
web-utils/
├── app/
│   ├── main.py          # FastAPI application
│   ├── config.py        # Configuration
│   ├── routes/          # Route handlers
│   │   ├── pdf.py
│   │   ├── image.py
│   │   ├── units.py
│   │   └── privacy.py
│   ├── static/         # Static files
│   └── templates/      # Jinja2 templates
├── requirements.txt    # Python dependencies
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 