import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

# Step 1: SQL to run in Supabase SQL Editor:
#
# CREATE TABLE patients (
#   id TEXT PRIMARY KEY,
#   name TEXT NOT NULL,
#   age INTEGER,
#   gender TEXT,
#   condition TEXT,
#   risk_level TEXT,
#   image_path TEXT,
#   last_consultation DATE,
#   status TEXT,
#   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
# );

def migrate_to_supabase():
    # Load from Code/.env where user indicated keys are stored
    root_env = r"C:\Users\ianub\Documents\NeuroLab\Code\.env"
    load_dotenv(root_env)
    
    url = os.environ.get("VITE_SUPABASE_URL")
    key = os.environ.get("VITE_SUPABASE_ANON_KEY")
    
    if "your-supabase" in url or not url:
        print("Error: Please update your .env file with real Supabase URL and Key.")
        return

    supabase: Client = create_client(url, key)
    
    db_path = r"C:\Users\ianub\Documents\NeuroLab\Code\backend\patient_records.json"
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found. Run generate_records.py first.")
        return
        
    with open(db_path, "r") as f:
        records = json.load(f)
        
    print(f"Uploading {len(records)} records to Supabase...")
    
    # Supabase allows bulk insert by passing a list
    # We map "riskLevel" (JSON) to "risk_level" (DB)
    db_records = []
    for r in records:
        db_records.append({
            "id": r["id"],
            "name": r["name"],
            "age": r["age"],
            "gender": r["gender"],
            "condition": r["condition"],
            "risk_level": r["riskLevel"],
            "image_path": r["imagePath"],
            "last_consultation": r["lastConsultation"],
            "status": r["status"]
        })
        
    # Batch the uploads to avoid timeouts (1000 at a time)
    batch_size = 1000
    for i in range(0, len(db_records), batch_size):
        batch = db_records[i:i+batch_size]
        try:
            supabase.table("patients").upsert(batch).execute()
            print(f"Uploaded batch {i // batch_size + 1}")
        except Exception as e:
            print(f"Failed to upload batch {i}: {e}")
            break

    print("Migration complete!")

if __name__ == "__main__":
    migrate_to_supabase()
