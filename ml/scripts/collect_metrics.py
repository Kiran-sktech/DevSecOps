import requests
session = requests.Session()
import csv
import time
from datetime import datetime

PROMETHEUS_URL = "http://localhost:9090/api/v1/query"

OUTPUT_FILE = "ml/dataset/forever_metrics.csv"

INTERVAL = 10


def query_prometheus(query):
    try:
        response = session.get(
            PROMETHEUS_URL,
            params={"query": query},
            timeout=5
        )

        data = response.json()

        if data["status"] == "success" and data["data"]["result"]:
            return float(data["data"]["result"][0]["value"][1])

    except Exception as e:
        print("Prometheus error:", e)

    return None


def collect_metrics(label):
    timestamp = datetime.now().isoformat()

    cpu = query_prometheus(
        'rate(process_cpu_seconds_total{job="forever-backend"}[1m]) * 100'
    )

    memory = query_prometheus(
        'process_resident_memory_bytes{job="forever-backend"}'
    )

    request_rate = query_prometheus(
        'sum(rate(http_requests_total{job="forever-backend"}[1m]))'
    )

    response_time = query_prometheus(
        '''
        sum(rate(http_request_duration_seconds_sum{job="forever-backend"}[1m]))
        /
        sum(rate(http_request_duration_seconds_count{job="forever-backend"}[1m]))
        '''
    )

    error_rate = query_prometheus(
        '''
        (
            sum(rate(http_errors_total{job="forever-backend",status_code=~"5.."}[1m]))
            or vector(0)
        )
        /
        sum(rate(http_requests_total{job="forever-backend"}[1m]))
        * 100
        '''
    )

    health = query_prometheus(
        'up{job="forever-backend"}'
    )

    row = [
        timestamp,
        cpu,
        memory,
        request_rate,
        response_time,
        error_rate,
        health,
        label
    ]

    print(row)

    with open(OUTPUT_FILE, "a", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(row)


print("Starting metrics collection...")
print("Press CTRL+C to stop.")

import os

if not os.path.exists(OUTPUT_FILE):
    with open(OUTPUT_FILE, "w", newline="") as file:
        writer = csv.writer(file)

        writer.writerow([
            "timestamp",
            "cpu_usage",
            "memory_usage",
            "request_rate",
            "avg_response_time",
            "error_rate",
            "application_health",
            "label"
        ])


while True:
    collect_metrics(1)
    time.sleep(INTERVAL)