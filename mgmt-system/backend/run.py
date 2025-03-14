import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get server settings from environment variables or use defaults
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG,
        log_level="info" if not DEBUG else "debug"
    )
    print(f"Server running at http://{HOST}:{PORT}")
    if DEBUG:
        print("Debug mode is enabled. Auto-reload is active.")
    print("Press CTRL+C to quit.") 