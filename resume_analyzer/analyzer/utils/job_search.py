import os
import requests

EXPERIENCE_MAP = {
    "Fresher (0-1 years)": ("entry_level", "INTERN,FULLTIME", "entry level fresher"),
    "Junior (1-3 years)": ("mid_level", "FULLTIME", "junior 1-3 years experience"),
    "Mid-level (3-5 years)": ("mid_level", "FULLTIME", "mid level 3-5 years experience"),
    "Senior (5+ years)": ("senior_level", "FULLTIME", "senior 5+ years experience"),
}

def fetch_jobs(roles, location="India", experience=None):
    """
    Fetches job listings from JSearch API via RapidAPI.
    Filters by roles, location, and optional experience level.
    """
    api_key = os.getenv("RAPIDAPI_KEY")
    if not api_key:
        return []

    # Build query with experience keywords if provided
    query_roles = " OR ".join(roles[:2])
    exp_keyword = ""
    employment_type = "FULLTIME"

    if experience and experience in EXPERIENCE_MAP:
        _, employment_type, exp_keyword = EXPERIENCE_MAP[experience]

    query = f"{query_roles} {exp_keyword} jobs in {location}".strip()

    url = "https://jsearch.p.rapidapi.com/search"
    querystring = {
        "query": query,
        "page": "1",
        "num_pages": "1",
        "date_posted": "all",
        "employment_types": employment_type,
    }

    headers = {
        "x-rapidapi-key": api_key,
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
    }

    try:
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status()
        data = response.json()

        jobs = []
        for item in data.get("data", [])[:10]:
            job = {
                "id": item.get("job_id"),
                "title": item.get("job_title"),
                "company": item.get("employer_name"),
                "location": f"{item.get('job_city', '')}, {item.get('job_country', '')}".strip(", "),
                "type": item.get("job_employment_type", "Full-time"),
                "link": item.get("job_apply_link") or item.get("job_google_link"),
                "description": item.get("job_description", "")[:150] + "...",
                "experience": experience or "Not specified",
            }
            jobs.append(job)

        return jobs
    except Exception as e:
        print(f"Error fetching jobs: {e}")
        return []