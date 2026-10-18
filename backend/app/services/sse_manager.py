import asyncio
import json
import logging
from typing import Set, Dict, Any
from datetime import datetime

logger = logging.getLogger("terraguard.sse")

class AlertStreamManager:
    def __init__(self):
        self.subscribers: Set[asyncio.Queue] = set()

    async def subscribe(self) -> asyncio.Queue:
        queue = asyncio.Queue()
        self.subscribers.add(queue)
        logger.info(f"New SSE client connected. Total clients: {len(self.subscribers)}")
        return queue

    def unsubscribe(self, queue: asyncio.Queue):
        if queue in self.subscribers:
            self.subscribers.remove(queue)
            logger.info(f"SSE client disconnected. Total clients: {len(self.subscribers)}")

    async def broadcast(self, event_type: str, data: Dict[str, Any]):
        if not self.subscribers:
            return
        payload = {
            "event": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        dead_queues = []
        for q in self.subscribers:
            try:
                q.put_nowait(payload)
            except asyncio.QueueFull:
                dead_queues.append(q)

        for dq in dead_queues:
            self.unsubscribe(dq)


stream_manager = AlertStreamManager()
