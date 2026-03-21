"""
Improved MRI Model Training with Better Hyperparameters
"""
import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms
from torchvision import models
from torch.utils.data import DataLoader, Subset
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import numpy as np
import random
import os

# Set seeds
SEED = 42
torch.manual_seed(SEED)
np.random.seed(SEED)
random.seed(SEED)

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Transformations
IMAGE_SIZE = 224
train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.RandomHorizontalFlip(0.5),
    transforms.RandomRotation(15),
    transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Load dataset
print("Loading dataset...")
base_dataset = torchvision.datasets.ImageFolder(
    root="data/mri-data/full_dataset",
    transform=val_transform
)

X = np.arange(len(base_dataset))
y = [label for _, label in base_dataset.samples]

print(f"Total samples: {len(base_dataset)}")
print(f"Classes: {base_dataset.classes}")

# Class weights to handle imbalance
class_counts = np.bincount(y)
class_weights = torch.tensor([1.0 / count for count in class_counts], dtype=torch.float)
class_weights = class_weights / class_weights.sum() * 4
print(f"Class weights: {class_weights}")

# Cross-validation
skf = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
fold_results = []
best_model = None
best_acc = 0

for fold, (train_idx, val_idx) in enumerate(skf.split(X, y)):
    print(f"\n{'='*50}")
    print(f"FOLD {fold+1}/3")
    print(f"{'='*50}")

    # Create train/val splits
    train_dataset = torchvision.datasets.ImageFolder(
        root="data/mri-data/full_dataset",
        transform=train_transform
    )
    val_dataset = torchvision.datasets.ImageFolder(
        root="data/mri-data/full_dataset",
        transform=val_transform
    )

    train_subset = Subset(train_dataset, train_idx)
    val_subset = Subset(val_dataset, val_idx)

    train_loader = DataLoader(train_subset, batch_size=16, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_subset, batch_size=16, shuffle=False, num_workers=0)

    print(f"Train samples: {len(train_subset)}, Val samples: {len(val_subset)}")

    # Model with better architecture
    model = models.resnet50(weights="IMAGENET1K_V1")  # Better than resnet18
    num_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Linear(num_features, 256),
        nn.ReLU(),
        nn.Dropout(0.5),
        nn.Linear(256, 4)
    )
    model = model.to(device)

    # Unfreeze more layers for fine-tuning
    for param in model.layer3.parameters():
        param.requires_grad = True
    for param in model.layer4.parameters():
        param.requires_grad = True
    for param in model.fc.parameters():
        param.requires_grad = True

    # Optimizer and scheduler
    criterion = nn.CrossEntropyLoss(weight=class_weights.to(device))
    optimizer = optim.AdamW(
        list(model.layer3.parameters()) + 
        list(model.layer4.parameters()) + 
        list(model.fc.parameters()),
        lr=0.001,
        weight_decay=0.0001
    )
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=20)

    # Training
    EPOCHS = 25
    best_fold_acc = 0
    patience_counter = 0

    for epoch in range(EPOCHS):
        model.train()
        train_loss = 0.0
        for batch_idx, (images, labels) in enumerate(train_loader):
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item()
            if (batch_idx + 1) % 10 == 0:
                print(f"Epoch {epoch+1}/{EPOCHS}, Batch {batch_idx+1}/{len(train_loader)}, Loss: {loss.item():.4f}")

        # Validation
        model.eval()
        preds = []
        labels_list = []

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, predicted = torch.max(outputs, 1)
                preds.extend(predicted.cpu().numpy())
                labels_list.extend(labels.cpu().numpy())

        val_acc = accuracy_score(labels_list, preds)
        scheduler.step()

        print(f"Epoch {epoch+1} - Train Loss: {train_loss/len(train_loader):.4f}, Val Acc: {val_acc:.4f}")

        # Early stopping
        if val_acc > best_fold_acc:
            best_fold_acc = val_acc
            patience_counter = 0
            # Save best model for this fold
            torch.save(model.state_dict(), "best_fold_model.pth")
        else:
            patience_counter += 1
            if patience_counter >= 5:
                print(f"Early stopping at epoch {epoch+1}")
                break

    # Load best fold model and evaluate
    model.load_state_dict(torch.load("best_fold_model.pth"))
    model.eval()
    preds = []
    labels_list = []

    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, predicted = torch.max(outputs, 1)
            preds.extend(predicted.cpu().numpy())
            labels_list.extend(labels.cpu().numpy())

    final_acc = accuracy_score(labels_list, preds)
    fold_results.append(final_acc)

    print(f"\n{'='*50}")
    print(f"Fold {fold+1} Final Accuracy: {final_acc:.4f}")
    print(f"Classification Report:")
    print(classification_report(labels_list, preds, target_names=base_dataset.classes))
    print(f"Confusion Matrix:")
    print(confusion_matrix(labels_list, preds))
    print(f"{'='*50}")

    # Save best overall model
    if final_acc > best_acc:
        best_acc = final_acc
        best_model = model
        torch.save(model.state_dict(), "models/final_model.pth")
        print(f"✓ New best model saved! Accuracy: {best_acc:.4f}")

# Final results
print(f"\n{'='*60}")
print(f"CROSS-VALIDATION RESULTS")
print(f"{'='*60}")
print(f"Fold Accuracies: {fold_results}")
print(f"Mean Accuracy: {np.mean(fold_results):.4f}")
print(f"Std Deviation: {np.std(fold_results):.4f}")
print(f"Best Model Accuracy: {best_acc:.4f}")
print(f"{'='*60}")

# Save final model
if best_model is not None:
    os.makedirs("models", exist_ok=True)
    torch.save(best_model.state_dict(), "models/final_model.pth")
    print("✓ Final model saved to models/final_model.pth")
