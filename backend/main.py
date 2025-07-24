from fastapi import FastAPI, Request, HTTPException, Body
from pymongo import ObjectId
from scheduler import start_scheduler
from credentials import create_credential, get_credential, list_credentials
from templates import create_template, list_templates, get_template, delete_template, update_template
from variables import create_variable, list_variables, update_variable, delete_variable

@app.post("/webhook/{workflow_id}")
async def webhook_trigger(workflow_id: str, request: Request):
    db = get_db()
    w = db.workflows.find_one({"_id": ObjectId(workflow_id)})
    if not w:
        raise HTTPException(404, "Workflow not found")
    body = await request.json()
    exec_id = execute_workflow(w, trigger_input=body)
    return {"execution_id": exec_id}

@app.post("/credentials")
def create_cred(name: str = Body(...), type_: str = Body(...), data: str = Body(...)):
    return {"id": create_credential(name, type_, data)}

@app.get("/credentials")
def list_creds():
    return list_credentials()

@app.get("/credentials/{id}")
def get_cred(id: str):
    return get_credential(id)

@app.post("/templates")
def create_tpl(name: str = Body(...), description: str = Body(""), workflow: dict = Body(...)):
    return {"id": create_template(name, description, workflow)}

@app.get("/templates")
def list_tpls():
    return list_templates()

@app.get("/templates/{id}")
def get_tpl(id: str):
    tpl = get_template(id)
    if not tpl:
        raise HTTPException(404, "Template not found")
    return tpl

@app.delete("/templates/{id}")
def delete_tpl(id: str):
    delete_template(id)
    return {"ok": True}

@app.put("/templates/{id}")
def update_tpl(id: str, name: str = Body(None), description: str = Body(None), workflow: dict = Body(None)):
    update_template(id, name, description, workflow)
    return {"ok": True}

@app.post("/variables")
def create_var(key: str = Body(...), value: str = Body("")):
    return {"ok": create_variable(key, value)}

@app.get("/variables")
def list_vars():
    return list_variables()

@app.put("/variables/{key}")
def update_var(key: str, value: str = Body(...)):
    return {"ok": update_variable(key, value)}

@app.delete("/variables/{key}")
def delete_var(key: str):
    return {"ok": delete_variable(key)}

start_scheduler() 