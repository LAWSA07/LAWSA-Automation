FROM python:3.11-slim

WORKDIR /app

COPY n8n_minimal/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY n8n_minimal/src ./src
RUN ls -l /app/src

WORKDIR /src
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]