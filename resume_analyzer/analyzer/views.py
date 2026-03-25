from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from .utils.resume_parser import extract_resume_text
from .utils.ai_engine import generate_recommendations, suggest_roles
from .utils.job_search import fetch_jobs
from .models import UserProfile, ResumeUpload
import json


# ── Resume Analyze ─────────────────────────────────────────────────────────────
@csrf_exempt
def analyze_resume(request):
    if request.method == "POST":
        resume_file = request.FILES.get("resume")
        username    = request.POST.get("username", "guest")
        email       = request.POST.get("email", "guest@example.com")
        jd          = request.POST.get("job_description", "")

        if not resume_file:
            return JsonResponse({"error": "Missing resume file"})

        resume_text = extract_resume_text(resume_file)
        analysis    = generate_recommendations(resume_text, jd)

        roles_raw  = suggest_roles(analysis, "")
        role_list  = [r.strip() for r in roles_raw.split("\n") if r.strip()]

        # Save to Supabase via Django ORM
        user, _ = UserProfile.objects.get_or_create(
            username=username,
            defaults={"email": email}
        )
        ResumeUpload.objects.create(
            user=user,
            filename=resume_file.name,
            skills=analysis,
            suggested_roles="\n".join(role_list),
        )

        return JsonResponse({
            "analysis": analysis,
            "suggested_roles": role_list
        })

    return JsonResponse({"message": "Invalid request"})


# ── Fetch Jobs ─────────────────────────────────────────────────────────────────
@csrf_exempt
def fetch_jobs_view(request):
    if request.method == "POST":
        try:
            data       = json.loads(request.body)
            roles      = data.get("roles", [])
            location   = data.get("location", "India")
            experience = data.get("experience", None)

            if not roles:
                return JsonResponse({"error": "Missing roles for job search"})

            jobs = fetch_jobs(roles, location, experience)
            return JsonResponse({"jobs": jobs})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"message": "Invalid request"})


# ── Suggest Roles (for skill-based re-suggestion) ────────────────────────────
@csrf_exempt
def suggest_roles_view(request):
    if request.method == "POST":
        try:
            data     = json.loads(request.body)
            skills   = data.get("skills", [])

            if not skills:
                return JsonResponse({"error": "Missing skills"})

            skills_text = "\n".join(skills)
            roles_raw   = suggest_roles(skills_text, "")
            role_list   = [r.strip() for r in roles_raw.split("\n") if r.strip()]

            return JsonResponse({"roles": role_list})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"message": "Invalid request"})


# ── Admin Login ────────────────────────────────────────────────────────────────
@csrf_exempt
def admin_login_view(request):
    if request.method == "POST":
        try:
            data     = json.loads(request.body)
            username = data.get("username", "").strip()
            password = data.get("password", "").strip()

            if not username or not password:
                return JsonResponse(
                    {"success": False, "message": "Username and password required."},
                    status=400
                )

            user = authenticate(username=username, password=password)

            if user is not None and user.is_active and (user.is_staff or user.is_superuser):
                return JsonResponse({
                    "success": True,
                    "message": f"Welcome, {user.username}!",
                    "admin":   user.username,
                })
            else:
                return JsonResponse(
                    {"success": False, "message": "Invalid credentials or not an admin."},
                    status=401
                )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"message": "Invalid request"})


# ── Admin Dashboard ────────────────────────────────────────────────────────────
# Using POST instead of GET to avoid CORS custom header issues
@csrf_exempt
def admin_dashboard_view(request):
    if request.method == "POST":
        try:
            data  = json.loads(request.body)
            token = data.get("token", "").strip()

            # Validate token sent in body
            if token != "admin-authenticated":
                return JsonResponse({"error": "Unauthorized"}, status=401)

            users = UserProfile.objects.all().order_by("-created_at")
            data_list = []

            for user in users:
                resumes = ResumeUpload.objects.filter(user=user).order_by("-uploaded_at")
                resume_list = []

                for r in resumes:
                    resume_list.append({
                        "id":               str(r.id),
                        "filename":         r.filename,
                        "skills":           r.skills or "",
                        "suggested_roles":  r.suggested_roles or "",
                        "experience_level": r.experience_level or "",
                        "uploaded_at":      r.uploaded_at.strftime("%d %b %Y, %I:%M %p"),
                    })

                data_list.append({
                    "id":            str(user.id),
                    "username":      user.username,
                    "email":         user.email,
                    "created_at":    user.created_at.strftime("%d %b %Y, %I:%M %p"),
                    "resumes":       resume_list,
                    "total_uploads": len(resume_list),
                })

            return JsonResponse({"users": data_list, "total": len(data_list)})

        except Exception as e:
            print(f"[Dashboard Error]: {e}")
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"message": "Invalid request"})