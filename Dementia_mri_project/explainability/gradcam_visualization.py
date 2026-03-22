import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms
from PIL import Image
import numpy as np
import cv2
import matplotlib.pyplot as plt
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Model Loading
model = models.resnet18(weights=None)
num_features = model.fc.in_features
model.fc = nn.Linear(num_features, 4)

# Trained Weight Loading
model.load_state_dict(torch.load("models/final_model.pth", map_location=device))
model = model.to(device)
model.eval()

class_names = [
    "MildDemented",
    "ModerateDemented",
    "NonDemented",
    "VeryMildDemented"
]

label_map = {
    "NonDemented": "No Dementia Detected",
    "VeryMildDemented": "Early Stage Dementia (Very Mild)",
    "MildDemented": "Mild / Moderate Dementia",
    "ModerateDemented": "Mild / Moderate Dementia"
}

explanations = {
    "NonDemented": """
No signs of dementia were detected in the MRI scan.

The brain structures appear within normal patterns.
If symptoms such as memory loss, confusion, or cognitive decline
are present, a clinical evaluation by a neurologist is recommended.
""",

    "Uncertain Result": """
The AI model detected patterns that are not strongly associated
with a specific dementia stage.

This may occur when the MRI scan is very close to normal
or when early structural changes are subtle.

A clinical neurological evaluation is recommended for
accurate diagnosis.
""",
      
    "VeryMildDemented": """
The MRI scan shows early structural patterns associated with
very mild dementia or early cognitive decline.

Possible symptoms may include:
• minor memory lapses
• slight difficulty with complex tasks
• occasional confusion

Early diagnosis can help slow disease progression with proper care.
""",

    "MildDemented": """
The MRI scan indicates structural patterns consistent with
mild to moderate dementia.

Possible symptoms may include:
• noticeable memory loss
• difficulty reasoning or planning
• changes in behavior or personality

A neurological consultation is strongly recommended for
medical diagnosis and treatment planning.
"""
}
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    # Normalized to 0.5 to match the training notebooks
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

def print_clinical_header():
    print("\n" + "="*50)
    print("      NEUROSCAN AI CLINICAL ANALYSIS REPORT")
    print("="*50)
    print("Modality: MR | Study: Brain Structural")
    print("Manufacturer: SIEMENS | Field: 3.0 Tesla")
    print("Sequence: T2-FLAIR | Slice: 5.0mm")
    print("-" * 50)

def predict_and_explain(image_path):
    print_clinical_header()
    image = Image.open(image_path).convert("RGB")
    img = np.array(image.resize((224,224))) / 255.0
    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():

        # TTA
        inputs = [
            input_tensor,
            torch.flip(input_tensor, dims=[3]),          # horizontal flip
            torch.rot90(input_tensor, 1, [2,3]),         # rotate 90
            torch.rot90(input_tensor, 3, [2,3])          # rotate -90
        ]
        probs_list = []
        for inp in inputs:
            outputs = model(inp)
            probs = torch.softmax(outputs, dim=1)
            probs_list.append(probs)
        probs = torch.mean(torch.stack(probs_list), dim=0)
        confidence, pred = torch.max(probs,1)
    prediction_raw = class_names[pred.item()]

    # merge Moderate into Mild
    if prediction_raw == "ModerateDemented":
        prediction_raw = "MildDemented"
    prediction = label_map[prediction_raw]
    confidence = confidence.item()*100

    if confidence < 60:
        diagnosis = "Uncertain Result"
    else:
        diagnosis = prediction

    print("\nDiagnosis Result:", diagnosis)
    print("Classification Confidence:", f"{confidence:.2f}%")
    print("\nClinical AI Interpretation:")
    print(explanations.get(diagnosis, explanations[prediction_raw]))
    print("-" * 50)

    target_layer = model.layer4[-1]
    cam = GradCAM(model=model, target_layers=[target_layer])
    grayscale_cam = cam(input_tensor=input_tensor)[0]
    grayscale_cam = cv2.resize(grayscale_cam, (224,224))
    visualization = show_cam_on_image(img, grayscale_cam, use_rgb=True)

    plt.imshow(visualization)
    plt.axis("off")
    plt.title("Grad-CAM Explanation")
    plt.show()
