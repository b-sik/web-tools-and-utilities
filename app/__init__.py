# This file makes the app directory a Python package 

from fastapi import FastAPI
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

app = FastAPI()

# Initialize rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["5000 per day", "500 per hour"],  # Increased limits
    storage_uri="memory://",
)
app.state.limiter = limiter

# Add rate limit exceeded handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Too many requests. Please try again later.",
            "limit": str(exc.detail)
        }
    )

# Configure max file size (16MB)
class MaxBodySizeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.method == "POST":
            content_length = int(request.headers.get("content-length", 0))
            MAX_SIZE = 16 * 1024 * 1024  # 16MB
            if content_length > MAX_SIZE:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "File too large. Maximum size is 16MB."}
                )
        return await call_next(request)

app.add_middleware(MaxBodySizeMiddleware)

from app import routes 