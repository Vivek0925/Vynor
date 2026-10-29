FROM python:3.12-slim-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates gnupg \
    && install -d /usr/share/postgresql-common/pgdg \
    && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
       -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
    && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" \
       > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client-18 \
    && pip install --no-cache-dir awscli \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY migration/restore.sh /usr/local/bin/restore.sh
RUN sed -i 's/\r$//' /usr/local/bin/restore.sh \
    && chmod +x /usr/local/bin/restore.sh

ENTRYPOINT ["/usr/local/bin/restore.sh"]

COPY migration/verify_db.py /usr/local/bin/verify_db.py
