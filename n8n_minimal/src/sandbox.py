from RestrictedPython import compile_restricted, safe_globals

class SandboxError(Exception):
    pass

def run_in_sandbox(code: str, input_vars: dict = None) -> dict:
    """
    Execute user code in a restricted Python sandbox.
    Returns a dict with 'result' or 'error'.
    """
    input_vars = input_vars or {}
    try:
        byte_code = compile_restricted(code, '<string>', 'exec')
        local_vars = {}
        exec(byte_code, {**safe_globals, **input_vars}, local_vars)
        return {"result": local_vars.get("result")}
    except Exception as e:
        return {"error": str(e)} 