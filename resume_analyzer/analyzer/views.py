from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .utils.resume_parser import extract_resume_text
from .utils.ai_engine import generate_recommendations, suggest_roles
from .utils.job_search import fetch_jobs
import json


@csrf_exempt
def analyze_resume(request):

    if request.method == "POST":

        resume_file = request.FILES.get("resume")
        jd = request.POST.get("job_description", "")

        if not resume_file:
            return JsonResponse({"error": "Missing resume file"})

        resume_text = extract_resume_text(resume_file)

        analysis = generate_recommendations(resume_text, jd)

        return JsonResponse({
            "analysis": analysis
        })

    return JsonResponse({"message": "Invalid request"})


@csrf_exempt
def suggest_roles_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            skills = data.get("skills", [])
            interests = data.get("interests", [])

            if not skills or not interests:
                return JsonResponse({"error": "Missing skills or interests"})

            skills_text = "\n".join(skills)
            interests_text = "\n".join(interests)

            roles = suggest_roles(skills_text, interests_text)
            role_list = [r.strip() for r in roles.split("\n") if r.strip()]

            return JsonResponse({"roles": role_list})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"message": "Invalid request"})


@csrf_exempt
def fetch_jobs_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            roles = data.get("roles", [])
            location = data.get("location", "India")  # Default to India if not specified
            
            if not roles:
                return JsonResponse({"error": "Missing roles for job search"})

            jobs = fetch_jobs(roles, location)
            
            return JsonResponse({"jobs": jobs})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"message": "Invalid request"})