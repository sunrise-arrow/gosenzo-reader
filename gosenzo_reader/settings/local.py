import os

from .base import *

# This should not be used in servers!

CANONICAL_ROOT_DOMAIN = "localhost:8000"

DEBUG = os.getenv('DEBUG', 'True').lower() in ['true', '1']

ALLOWED_HOSTS = [os.environ.get("ALLOWED_HOSTS", "localhost"), '*']

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.path.join(BASE_DIR, "db.sqlite3"),
    }
}
