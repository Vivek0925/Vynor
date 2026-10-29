import json
import os
import subprocess

secret = json.loads(subprocess.check_output([
    "aws", "secretsmanager", "get-secret-value",
    "--secret-id", os.environ["RDS_SECRET_ARN"],
    "--query", "SecretString",
    "--output", "text",
    "--region", "ap-south-1"
], text=True))

env = os.environ.copy()
env["PGPASSWORD"] = secret["password"]

query = """
SELECT count(*) AS public_table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
"""

subprocess.run([
    "psql",
    "--host=" + os.environ["RDS_HOST"],
    "--username=" + secret["username"],
    "--dbname=" + os.environ["RDS_DB"],
    "--no-password",
    "--set=ON_ERROR_STOP=1",
    "--command=" + query
], env=env, check=True)
