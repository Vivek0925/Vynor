#!/bin/sh
set -eu

: "${RDS_HOST:?RDS_HOST is required}"
: "${RDS_DB:?RDS_DB is required}"
: "${BACKUP_S3_URI:?BACKUP_S3_URI is required}"
: "${RDS_SECRET_ARN:?RDS_SECRET_ARN is required}"

RDS_SECRET_JSON="$(aws secretsmanager get-secret-value \
  --secret-id "$RDS_SECRET_ARN" \
  --query SecretString \
  --output text)"

export PGPASSWORD="$(printf '%s' "$RDS_SECRET_JSON" | python -c 'import json,sys; print(json.load(sys.stdin)["password"])')"
RDS_USER="$(printf '%s' "$RDS_SECRET_JSON" | python -c 'import json,sys; print(json.load(sys.stdin)["username"])')"
export RDS_USER

echo "Downloading database backup from S3..."
aws s3 cp "$BACKUP_S3_URI" /tmp/vynor-production.dump

echo "Checking backup archive..."
pg_restore --list /tmp/vynor-production.dump > /tmp/restore-toc.txt
echo "Backup archive is readable."

echo "Checking target PostgreSQL version..."
psql \
  --host="$RDS_HOST" \
  --username="$RDS_USER" \
  --dbname="$RDS_DB" \
  --no-password \
  --set=ON_ERROR_STOP=1 \
  --command="SELECT version();"

echo "Generating SQL from backup..."
pg_restore \
  --no-owner \
  --no-acl \
  --file=/tmp/restore.sql \
  /tmp/vynor-production.dump

echo "Removing the PostgreSQL 18-only setting..."
sed '/^SET transaction_timeout = 0;$/d' \
  /tmp/restore.sql > /tmp/restore-compatible.sql

if grep -q 'SET transaction_timeout = 0;' /tmp/restore-compatible.sql; then
  echo "ERROR: Incompatible setting remains in SQL."
  exit 1
fi

echo "Starting compatible restore..."
psql \
  --host="$RDS_HOST" \
  --username="$RDS_USER" \
  --dbname="$RDS_DB" \
  --no-password \
  --set=ON_ERROR_STOP=1 \
  --file=/tmp/restore-compatible.sql

echo "Restore command completed. Verify table counts before using the database."
