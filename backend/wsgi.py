#!/usr/bin/env python3
"""
Production WSGI entry point for Creator Bounty Payment Backend
"""
import os
from src.main import app

if __name__ == "__main__":
    from waitress import serve
    port = int(os.getenv('PORT', 8000))
    print(f"Starting production server on port {port}")
    serve(app, host='0.0.0.0', port=port)
