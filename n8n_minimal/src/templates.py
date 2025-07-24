from .db import get_db_from_uri

def create_template(connection_string, name, description, workflow):
    _, db = get_db_from_uri(connection_string)
    tpl = {"name": name, "description": description, "workflow": workflow}
    return str(db.templates.insert_one(tpl).inserted_id)

def list_templates(connection_string):
    _, db = get_db_from_uri(connection_string)
    return [{"id": str(t["_id"]), "name": t["name"], "description": t.get("description", "")} for t in db.templates.find()]

def get_template(connection_string, id):
    _, db = get_db_from_uri(connection_string)
    t = db.templates.find_one({"_id": id})
    if t:
        t["id"] = str(t["_id"])
        del t["_id"]
    return t

def delete_template(connection_string, id):
    _, db = get_db_from_uri(connection_string)
    db.templates.delete_one({"_id": id})
    return True

def update_template(connection_string, id, name=None, description=None, workflow=None):
    _, db = get_db_from_uri(connection_string)
    update = {}
    if name is not None:
        update["name"] = name
    if description is not None:
        update["description"] = description
    if workflow is not None:
        update["workflow"] = workflow
    db.templates.update_one({"_id": id}, {"$set": update})
    return True 