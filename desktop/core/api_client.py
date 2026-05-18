import requests

BASE = "http://localhost:8000/api"
TIMEOUT = 12


def _h(token: str | None = None) -> dict:
    h = {}
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h


def _list(data) -> list:
    """Handle both plain list and DRF paginated {'results': [...]} responses."""
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and "results" in data:
        return data["results"]
    return []


def login(username: str, password: str) -> dict:
    r = requests.post(f"{BASE}/auth/login/", json={"username": username, "password": password}, timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()


def get_current_user(token: str) -> dict:
    r = requests.get(f"{BASE}/users/me/", headers=_h(token), timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()


def get_courses(token: str) -> list:
    r = requests.get(f"{BASE}/courses/", headers=_h(token), timeout=TIMEOUT)
    r.raise_for_status()
    return _list(r.json())


def get_subjects(token: str) -> list:
    r = requests.get(f"{BASE}/subjects/", headers=_h(token), timeout=TIMEOUT)
    r.raise_for_status()
    return _list(r.json())


def get_services(token: str) -> list:
    r = requests.get(f"{BASE}/services/", headers=_h(token), timeout=TIMEOUT)
    r.raise_for_status()
    return _list(r.json())


def get_my_assignments(token: str) -> list:
    r = requests.get(f"{BASE}/assignments/", headers=_h(token), timeout=TIMEOUT)
    r.raise_for_status()
    return _list(r.json())


def get_my_corrections(token: str) -> list:
    r = requests.get(f"{BASE}/corrections/", headers=_h(token), timeout=TIMEOUT)
    r.raise_for_status()
    return _list(r.json())


def get_all_users(token: str) -> list:
    r = requests.get(f"{BASE}/users/", headers=_h(token), timeout=TIMEOUT)
    r.raise_for_status()
    return _list(r.json())


def submit_assignment(token: str, course_id: int, service_id: int, file_path: str) -> dict:
    import os
    with open(file_path, "rb") as f:
        r = requests.post(
            f"{BASE}/assignments/submit/",
            headers=_h(token),
            data={"course": course_id, "service": service_id},
            files={"file": (os.path.basename(file_path), f)},
            timeout=30,
        )
    r.raise_for_status()
    return r.json()
