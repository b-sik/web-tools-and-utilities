# Web Utilities

A collection of web-based utilities including PDF tools, image processing, unit conversion, and currency conversion.

## Features

- PDF Tools: Combine and compress PDF files
- Image Tools: Compress and resize images
- Unit Converter: Convert between different units of measurement
- Currency Converter: Convert between different currencies

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript

## Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend API will be available at `http://localhost:5000`

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/pdf/combine` - Combine PDF files
- `POST /api/image/compress` - Compress images
- `POST /api/units/convert` - Convert units
- `POST /api/currency/convert` - Convert currencies

## Development

- Frontend development server includes HMR (Hot Module Replacement)
- Backend uses nodemon for automatic restarting during development
- TypeScript for type safety across the entire stack
- Tailwind CSS for responsive styling 