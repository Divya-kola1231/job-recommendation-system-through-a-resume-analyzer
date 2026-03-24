from django.urls import path
from .views import analyze_resume, fetch_jobs_view, admin_login_view, admin_dashboard_view

urlpatterns = [
    path("analyze/",         analyze_resume),
    path("jobs/",            fetch_jobs_view),
    path("admin-login/",     admin_login_view),
    path("admin-dashboard/", admin_dashboard_view),
]