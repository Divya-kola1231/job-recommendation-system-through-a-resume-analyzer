from django.contrib import admin
from .models import UserProfile, ResumeUpload

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'created_at']
    search_fields = ['username', 'email']

@admin.register(ResumeUpload)
class ResumeUploadAdmin(admin.ModelAdmin):
    list_display = ['user', 'filename', 'experience_level', 'uploaded_at']
    search_fields = ['user__username', 'filename']
    list_filter = ['experience_level', 'uploaded_at']