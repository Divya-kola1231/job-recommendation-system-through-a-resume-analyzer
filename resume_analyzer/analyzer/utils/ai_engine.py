import os
from groq import Groq

# configure Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_recommendations(resume_text, jd):

    prompt = f"""Extract only the skills from this resume. Output skill names only, one per line, no bullets, no numbers, no explanations, no extra text whatsoever.

Resume:
{resume_text}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content


def suggest_roles(skills, interests):

    prompt = f"""You are a career advisor. Based on the candidate's skills and their selected role interests, suggest the top 5 most suitable job roles for them.

Candidate Skills:
{skills}

Role Interests Selected by Candidate:
{interests}

Return ONLY a list of 5 specific job role titles, one per line, no numbers, no bullets, no explanations. Just the role titles."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content