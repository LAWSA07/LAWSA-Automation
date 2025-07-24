from apscheduler.schedulers.background import BackgroundScheduler
from database import get_db
from engine import execute_workflow
import time

def run_scheduled_workflows():
    db = get_db()
    for wf in db.workflows.find():
        for node in wf.get('nodes', []):
            if node.get('type') == 'trigger' and node.get('config', {}).get('schedule'):
                last_run = node.get('config', {}).get('last_run', 0)
                interval = int(node['config']['schedule'])
                now = int(time.time())
                if now - last_run >= interval:
                    print(f"Running scheduled workflow {wf['_id']}")
                    execute_workflow(wf)
                    node['config']['last_run'] = now
                    db.workflows.update_one({'_id': wf['_id']}, {'$set': {'nodes': wf['nodes']}})

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_scheduled_workflows, 'interval', seconds=10)
    scheduler.start() 