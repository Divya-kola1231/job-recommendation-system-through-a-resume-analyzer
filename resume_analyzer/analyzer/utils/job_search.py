import os
import requests

def fetch_jobs(roles, location="India"):
    """
    Fetches job listings from JSearch API via RapidAPI.
    Uses the suggested roles to build a query.
    """
    api_key = os.getenv("RAPIDAPI_KEY")
    if not api_key:
        return []

    # Join top 2 roles for a broader query to ensure we get results
    query_roles = " OR ".join(roles[:2]) 
    query = f"{query_roles} jobs in {location}"

    url = "https://jsearch.p.rapidapi.com/search"
    querystring = {
        "query": query,
        "page": "1",
        "num_pages": "1",
        "date_posted": "all"
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
        for item in data.get("data", [])[:10]: # Limit to 10 jobs
            job = {
                "id": item.get("job_id"),
                "title": item.get("job_title"),
                "company": item.get("employer_name"),
                "location": f"{item.get('job_city', '')}, {item.get('job_country', '')}".strip(", "),
                "type": item.get("job_employment_type", "Full-time"),
                "link": item.get("job_apply_link") or item.get("job_google_link"),
                "description": item.get("job_description", "")[:150] + "..."
            }
            jobs.append(job)
            
        return jobs
    except Exception as e:
        print(f"Error fetching jobs: {e}")
        return []
