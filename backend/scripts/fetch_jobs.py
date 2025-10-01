import os
import sys
import logging
from typing import Any, Dict, List
from dotenv import load_dotenv

load_dotenv()
try:
    from supabase import create_client, Client  # type: ignore
except Exception as e:
    print("[Error] Failed to import supabase client. Did you run 'pip install -r backend/requirements.txt'?", file=sys.stderr)
    raise e


def mask_token(token: str) -> str:
    if not token:
        return "(empty)"
    if len(token) <= 8:
        return token
    return f"{token[:4]}...{token[-4:]}"


def setup_logger() -> logging.Logger:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    return logging.getLogger("fetch_jobs")


def get_supabase_client(logger: logging.Logger) -> Client:
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_KEY", "")

    logger.info(
        "[Init] Env check",
        extra={
            "supabase": {
                "has_url": bool(url),
                "has_key": bool(key),
                "url_host": (url.split("//")[1].split("/")[0] if (url and "//" in url) else "(none)"),
                "key_preview": mask_token(key),
            }
        },
    )

    if not url or not key:
        print(url, key)
        logger.error("SUPABASE_URL or SUPABASE_KEY missing in environment")
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_KEY")

    try:
        client = create_client(url, key)
        logger.info("[Init] Supabase client created")
        return client
    except Exception as e:
        logger.exception("[Init] Failed to create Supabase client")
        raise e


def fetch_all_jobs(client: Client, logger: logging.Logger) -> List[Dict[str, Any]]:
    logger.info("[Query] Fetching jobs from 'jobs' table")
    try:
        resp = (
            client.table("jobs")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        data = getattr(resp, "data", []) or []
        logger.info("[Query] Success", extra={"count": len(data)})
        return data
    except Exception:
        logger.exception("[Query] Error while fetching jobs")
        raise


def main() -> None:
    logger = setup_logger()
    try:
        client = get_supabase_client(logger)
        jobs = fetch_all_jobs(client, logger)

        if not jobs:
            print("No jobs found.")
            return

        print(f"Total jobs: {len(jobs)}")
        # Print a compact view
        for idx, job in enumerate(jobs, start=1):
            job_id = job.get("id")
            title = job.get("title")
            created = job.get("created_at")
            print(f"{idx}. id={job_id}, title={title}, created_at={created}")
    except Exception as e:
        print(f"[Fatal] {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()


