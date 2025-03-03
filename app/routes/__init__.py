# This file makes the routes directory a Python package 

from . import image, pdf, units

def init_app(app):
    app.include_router(image.router, prefix="/image", tags=["image"])
    app.include_router(pdf.router, prefix="/pdf", tags=["pdf"])
    app.include_router(units.router, prefix="/units", tags=["units"]) 