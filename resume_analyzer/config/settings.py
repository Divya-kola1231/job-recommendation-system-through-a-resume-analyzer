"""
Django settings for resume_analyzer project.
"""

import os
import dj_database_url
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / '.env')

# SECURITY
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-fallback-key')

DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# ─── ALLOWED HOSTS ────────────────────────────────────────────────────────────
# Render default domain pattern for this app
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME', '')

if DEBUG:
    # Development: Accept localhost and 127.0.0.1
    ALLOWED_HOSTS = ['localhost', '127.0.0.1', '*.localhost']
else:
    # Production: Explicitly list allowed hosts
    allowed_hosts_str = os.environ.get('ALLOWED_HOSTS', '')
    
    if RENDER_EXTERNAL_HOSTNAME:
        # On Render, use the provided external hostname
        ALLOWED_HOSTS = [RENDER_EXTERNAL_HOSTNAME]
    elif allowed_hosts_str:
        # Fallback: parse from ALLOWED_HOSTS environment variable (comma-separated)
        ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_str.split(',') if h.strip()]
    else:
        # No hosts configured - this will cause DisallowedHost errors
        # Set one via environment variable
        ALLOWED_HOSTS = []
        
    # Ensure the list is not empty
    if not ALLOWED_HOSTS:
        # This is a safety net, but ideally ALLOWED_HOSTS should be explicitly set
        ALLOWED_HOSTS = ['job-recommendation-system-through-a-piij.onrender.com']

# Application definition
INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'analyzer',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # ← Whitenoise for static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# ─── DATABASE ────────────────────────────────────────────────────────────────
# Uses DATABASE_URL env var on Render (PostgreSQL)
# Falls back to SQLite locally
DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Google Gemini API Key
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ─── STATIC FILES ────────────────────────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ─── MEDIA FILES ─────────────────────────────────────────────────────────────
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─── CORS ────────────────────────────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS = True

# ─── SECURITY (only enforced when DEBUG=False) ───────────────────────────────
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'False') == 'True'
    SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False') == 'True'
    CSRF_COOKIE_SECURE = os.environ.get('CSRF_COOKIE_SECURE', 'False') == 'True'