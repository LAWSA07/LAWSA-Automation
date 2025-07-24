from prometheus_fastapi_instrumentator import Instrumentator

def add_metrics(app):
    Instrumentator().instrument(app).expose(app, include_in_schema=False, should_gzip=True) 