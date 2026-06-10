# Why this file exists:
# This Dockerfile builds the environment for the Python FastAPI LangGraph backend.
# It uses Python 3.11 slim to minimize image size while providing a complete python environment.
# Tricky Logic / Build Notes:
# - We install build-essential (gcc, g++, make, python3-dev) before installing dependencies because
#   chromadb and other agentic packages often compile native C++ extensions during pip install.
# - We make sure to write logs without buffering (PYTHONUNBUFFERED=1) to see realtime agent telemetry.

FROM python:3.11-slim

# Avoid writing .pyc files and force unbuffered logging for cleaner docker logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set workspace working directory
WORKDIR /app

# Install compilation prerequisites for chromadb native build extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy python dependencies list from the backend folder
COPY backend/requirements.txt ./backend/

# Install python dependencies globally inside the container
# (We don't need a venv inside the container since the container itself is an isolated environment)
RUN pip install --no-cache-dir -r backend/requirements.txt

# The project root files (including backend/main.py) will be bind-mounted at runtime.
# We expose port 8000 for FastAPI.
EXPOSE 8000

# Execute backend/main.py using the python interpreter inside the container.
# This runs uvicorn on port 8000 as configured in main.py.
CMD ["python", "backend/main.py"]
