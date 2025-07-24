import pytest
import asyncio
from src.engine import execute_workflow

@pytest.mark.asyncio
async def test_branching():
    workflow = {
        "nodes": [
            {"id": "1", "type": "ManualTriggerNode", "config": {}},
            {"id": "2", "type": "CodeNode", "config": {"code": "result = {'value': 1}"}},
            {"id": "3", "type": "CodeNode", "config": {"code": "result = {'msg': 'Branch A'}"}},
            {"id": "4", "type": "CodeNode", "config": {"code": "result = {'msg': 'Branch B'}"}}
        ],
        "connections": [
            {"source": "1", "target": "2"},
            {"source": "2", "target": "3", "conditions": {"field": "json.value", "equals": 1}},
            {"source": "2", "target": "4", "conditions": {"field": "json.value", "equals": 2}}
        ]
    }
    results = await execute_workflow(workflow)
    assert "3" in results
    assert results["3"][0]["json"]["msg"] == "Branch A"
    assert "4" not in results 