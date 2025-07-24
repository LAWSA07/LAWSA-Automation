from .db import get_db_from_uri

def create_variable(connection_string, key, value):
    _, db = get_db_from_uri(connection_string)
    if db.variables.find_one({"key": key}):
        raise Exception("Variable key already exists")
    db.variables.insert_one({"key": key, "value": value})
    return True

def list_variables(connection_string):
    _, db = get_db_from_uri(connection_string)
    return [{"key": v["key"], "value": v["value"]} for v in db.variables.find()]

def update_variable(connection_string, key, value):
    _, db = get_db_from_uri(connection_string)
    db.variables.update_one({"key": key}, {"$set": {"value": value}})
    return True

def delete_variable(connection_string, key):
    _, db = get_db_from_uri(connection_string)
    db.variables.delete_one({"key": key})
    return True 