from database import get_db

def create_template(name, description, workflow):
    db = get_db()
    tpl = {"name": name, "description": description, "workflow": workflow}
    return str(db.templates.insert_one(tpl).inserted_id)

def list_templates():
    db = get_db()
    return [{"id": str(t["_id"]), "name": t["name"], "description": t.get("description", "")} for t in db.templates.find()]

def get_template(id):
    db = get_db()
    t = db.templates.find_one({"_id": id})
    if t:
        t["id"] = str(t["_id"])
        del t["_id"]
    return t

def delete_template(id):
    db = get_db()
    db.templates.delete_one({"_id": id})
    return True

def update_template(id, name=None, description=None, workflow=None):
    db = get_db()
    update = {}
    if name is not None:
        update["name"] = name
    if description is not None:
        update["description"] = description
    if workflow is not None:
        update["workflow"] = workflow
    db.templates.update_one({"_id": id}, {"$set": update})
    return True 