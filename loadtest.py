import asyncio
import urllib.request
import json
import random
import uuid
from datetime import datetime
import time

URL = "http://localhost:3000/orders"

TOTAL_REQUESTS = 10000
CONCURRENCY = 100

ITEMS = [
    "Laptop", "Phone", "Keyboard",
    "Mouse", "Monitor", "Headset",
    "Tablet", "Camera"
]

def generate_payload():
    return {
        "orderId": str(uuid.uuid4()),
        "userId": random.randint(1, 10000),
        "item": random.choice(ITEMS),
        "price": random.randint(50, 3000),
        "quantity": random.randint(1, 5),
        "timestamp": datetime.utcnow().isoformat()
    }

def send_request():
    payload = generate_payload()
    data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(
        URL,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            return response.status
    except Exception as e:
        return None

async def worker(loop):
    return await loop.run_in_executor(None, send_request)

async def main():
    loop = asyncio.get_running_loop()

    tasks = []
    for _ in range(TOTAL_REQUESTS):
        tasks.append(worker(loop))

        # giới hạn concurrency
        if len(tasks) >= CONCURRENCY:
            results = await asyncio.gather(*tasks)
            tasks = []

    if tasks:
        await asyncio.gather(*tasks)

start = time.time()
asyncio.run(main())
print(f"Finished in {time.time() - start:.2f} seconds")