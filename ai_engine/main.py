from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import lancedb
import pandas as pd
import os
import time

app = FastAPI()

# Ensure data directory exists
os.makedirs("data/lancedb", exist_ok=True)

# LanceDB Vector Database Initialization
db = lancedb.connect("data/lancedb")
table_name = "agent_memories"

# Initialize table if not exists
if table_name not in db.table_names():
    # Schema for agent memories
    schema = {
        "vector": [0.0] * 128, # Placeholder for embeddings
        "agent_id": "str",
        "action": "str",
        "timestamp": 0.0
    }
    db.create_table(table_name, data=[schema])

table = db.open_table(table_name)

class AgentState(BaseModel):
    agent_id: str
    x: float
    y: float
    z: float
    mood: str = "NEUTRAL"

@app.get("/")
async def root():
    return {"status": "V4 AI_ENGINE ACTIVE", "engine": "Python 3.14.3", "db": "LanceDB Connected"}

@app.post("/decide")
async def decide_action(state: AgentState):
    # Simple Agent Logic: Move towards the center if far
    dist = (state.x**2 + state.y**2 + state.z**2)**0.5
    
    action = "WANDER"
    if dist > 5:
        action = "RETURN_TO_CENTER"
    elif state.mood == "AGITATED":
        action = "PROTEST"
    
    # Store memory in LanceDB
    memory_data = pd.DataFrame([{
        "vector": [0.0] * 128,
        "agent_id": state.agent_id,
        "action": action,
        "timestamp": time.time()
    }])
    table.add(memory_data)
    
    return {
        "agent_id": state.agent_id,
        "suggested_action": action,
        "new_target": [0, 1, 0] if action == "RETURN_TO_CENTER" else None
    }
