from apscheduler.schedulers.asyncio import AsyncIOScheduler
from .engine import execute_workflow
import asyncio

scheduler = AsyncIOScheduler()
scheduler.start()

async def run_workflow_job(workflow):
    await execute_workflow(workflow)

def register_schedule_job(workflow, cron):
    scheduler.add_job(lambda: asyncio.create_task(run_workflow_job(workflow)), 'cron', **cron) 