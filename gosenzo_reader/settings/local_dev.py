import os

from .base import *

# This should not be used in servers!

dev_domain = os.environ.get("DEV_CANONICAL_ROOT_DOMAIN", "test.shamiko.moe")

CANONICAL_ROOT_DOMAIN = dev_domain

DEBUG = os.getenv('DEBUG', 'True').lower() in ['true', '1']

ALLOWED_HOSTS = ["*", "localhost"]

CANONICAL_SITE_NAME = dev_domain

LOGGING = {
    "version": 1,
    "disable_existing_loggers": True,
    "formatters": {
        "verbose": {
            "format": "%(asctime)s %(levelname)s [%(name)s:%(lineno)s] %(module)s %(process)d %(thread)d %(message)s"
        }
    },
    "handlers": {
        "file": {
            "level": "WARNING",
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "verbose",
            "filename": os.path.join(PARENT_DIR, "gosenzo_reader.log"),
            "maxBytes": 1024 * 1024 * 100,  # 100 mb
        }
    },
    "loggers": {
        "django": {"handlers": ["file"], "level": "WARNING", "propagate": True,},
    },
}

CACHES = {"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache",}}

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": os.environ.get("DEV_DB_NAME"),
        "USER": os.environ.get("DEV_DB_USER"),
        "PASSWORD": os.environ.get("DEV_DB_PASS"),
        "HOST": "localhost",
        "PORT": "",
    }
}

OCR_SCRIPT_PATH = os.path.join(PARENT_DIR, "ocr_tool.sh")
