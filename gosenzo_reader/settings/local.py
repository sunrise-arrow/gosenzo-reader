import os

from .base import *


CANONICAL_ROOT_DOMAIN = "localhost:8000"

DEBUG = False

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
