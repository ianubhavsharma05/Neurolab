import os
import json
import uuid
import random

def generate_patient_data():
    root_dir = r"C:\Users\ianub\Documents\Neurosense\Dementia_mri_project\data\mri-data\full_dataset"
    backend_data_path = r"C:\Users\ianub\Documents\Neurosense\Code\backend\patient_records.json"
    
    categories = ["MildDemented", "ModerateDemented", "NonDemented", "VeryMildDemented"]
    risk_map = {
        "NonDemented": "Low",
        "VeryMildDemented": "Early",
        "MildDemented": "Moderate",
        "ModerateDemented": "High"
    }
    
    patients = []
    
    if not os.path.exists(root_dir):
        print(f"Error: Directory {root_dir} not found.")
        return

    for category in categories:
        cat_path = os.path.join(root_dir, category)
        if not os.path.exists(cat_path):
            continue
            
        files = [f for f in os.listdir(cat_path) if f.endswith(('.jpg', '.jpeg', '.png'))]
        
        for filename in files:
            # Name is the filename without extension (e.g. Aarav_Sharma)
            name = os.path.splitext(filename)[0].replace("_", " ")
            
            # Generate some mock "real" metadata
            age = random.randint(62, 88)
            gender = random.choice(["Male", "Female"])
            # Generate a consistent Join Date within the last 2 years
            join_date = f"202{random.randint(4,5)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
            
            patient = {
                "id": str(uuid.uuid4())[:8].upper(),
                "name": name,
                "age": age,
                "gender": gender,
                "condition": category,
                "riskLevel": risk_map.get(category, "Moderate"),
                "imagePath": filename,
                "lastConsultation": join_date,
                "status": "Archived" if random.random() > 0.3 else "Active"
            }
            patients.append(patient)
            
    # Save to the backend folder
    with open(backend_data_path, 'w') as f:
        json.dump(patients, f, indent=2)
        
    print(f"Successfully generated {len(patients)} records at {backend_data_path}")

if __name__ == "__main__":
    generate_patient_data()
