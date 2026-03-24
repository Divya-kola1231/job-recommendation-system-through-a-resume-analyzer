from django.db import models
import uuid

class UserProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=False)
    email = models.EmailField(unique=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

class ResumeUpload(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='resumes')
    filename = models.CharField(max_length=255)
    skills = models.TextField(blank=True)
    suggested_roles = models.TextField(blank=True)
    experience_level = models.CharField(max_length=50, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.filename}"