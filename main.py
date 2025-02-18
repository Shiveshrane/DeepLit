import logging
from backend import app

# Configure logging
logging.basicConfig(level=logging.DEBUG)

if __name__ == "__main__":
    try:
        app.run(host="0.0.0.0", port=3000, debug=True)
    except Exception as e:
        logging.error(f"Error starting the server: {str(e)}")
        raise