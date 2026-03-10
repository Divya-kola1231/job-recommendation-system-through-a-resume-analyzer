from django.urls import path
from .views import analyze_resume, suggest_roles_view, fetch_jobs_view

urlpatterns = [
    path("analyze/", analyze_resume),
    path("suggest-roles/", suggest_roles_view),
    path("jobs/", fetch_jobs_view),
]