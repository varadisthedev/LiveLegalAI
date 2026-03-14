"""
logger.py
---------
Centralised logging setup for the entire microservice.

Every module should import `logger` from here so that all logs
flow through a single, consistently-formatted channel.

Format: [TIMESTAMP] [LEVEL] [MODULE] — message
"""

import logging
import sys


def get_logger(name: str) -> logging.Logger:
    """
    Return a logger configured with a human-readable format.

    Args:
        name: Typically __name__ from the calling module.

    Returns:
        A Python standard-library Logger instance.
    """
    logger = logging.getLogger(name)

    # Prevent duplicate handlers when get_logger is called multiple times
    if logger.handlers:
        return logger

    logger.setLevel(logging.DEBUG)

    # Stream handler — sends everything to stdout (visible in Docker / terminal)
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.DEBUG)

    formatter = logging.Formatter(
        fmt="%(asctime)s  [%(levelname)-8s]  %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger


# Module-level convenience logger (import this directly when needed)
logger = get_logger("rag_service")
