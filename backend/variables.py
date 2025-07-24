from database import get_db

def create_variable(key, value):
    db = get_db()
    if db.variables.find_one({"key": key}):
        raise Exception("Variable key already exists")
    db.variables.insert_one({"key": key, "value": value})
    return True

def list_variables():
    db = get_db()
    return [{"key": v["key"], "value": v["value"]} for v in db.variables.find()]

def update_variable(key, value):
    db = get_db()
    db.variables.update_one({"key": key}, {"$set": {"value": value}})
    return True

def delete_variable(key):
    db = get_db()
    db.variables.delete_one({"key": key})
    return True 