from gosenzo_reader.settings.base import *

ALLOWED_HOSTS = ["web", "localhost"]

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.memcached.MemcachedCache",
        "LOCATION": "memcached:11211",
    }
}

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": "gosenzo_reader",
        "USER": "POSTGRES_USER",
        "PASSWORD": "POSTGRES_PASSWORD",
        "HOST": "postgres",
        "PORT": "",
    }
}
