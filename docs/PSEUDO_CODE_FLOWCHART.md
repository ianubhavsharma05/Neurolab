# NeuroSense AI Pseudo Code Flowchart

## End-To-End User Logic

```mermaid
graph TD
    Start([Open App]) --> Restore[Restore auth + language from localStorage]
    Restore --> Auth{Authenticated?}

    Auth -->|No| Landing[Show Home + About]
    Auth -->|Yes| Hub[Open Intelligence Hub]

    Landing --> Login[Login or signup]
    Login --> AuthOK{Login success?}
    AuthOK -->|No| Login
    AuthOK -->|Yes| Hub

    Hub --> Action{Choose module}
    Action --> MRI[MRI Analysis]
    Action --> Speech[Vocal Patterns]
    Action --> Cognitive[Cognitive Tests]
    Action --> Reports[Session Matrix]

    MRI --> MRIInput[Select image file]
    MRIInput --> MRIUpload[Send file to backend]
    MRIUpload --> MRIResult[Store MRI result locally]

    Speech --> SpeechInput[Record or upload audio]
    SpeechInput --> SpeechUpload[Send audio to backend]
    SpeechUpload --> SpeechResult[Store speech result locally]

    Cognitive --> CognitiveFlow[Run browser test flow]
    CognitiveFlow --> CognitiveResult[Store cognitive result locally]

    MRIResult --> Fusion[Calculate fused accuracy]
    SpeechResult --> Fusion
    CognitiveResult --> Fusion
    Fusion --> Reports
    Reports --> PDF[Optional PDF export]
    Reports --> Hub
```

## Simplified Pseudo Code

```text
onAppLoad:
  restoreUser()
  restoreLanguage()

if userIsAuthenticated:
  showDashboard()
else:
  showPublicPages()

onMRIUpload:
  sendImageToBackend()
  receiveClassificationAndHeatmap()
  saveMRIResult()

onSpeechUpload:
  sendAudioToBackend()
  receiveFeaturesAndClassification()
  saveSpeechResult()

onCognitiveCompletion:
  computeCognitiveScore()
  saveCognitiveResult()

onFusionRequest:
  sendMRI + speech + cognitive scores
  receiveOverallAccuracy()
  saveAssessment()

onReportExport:
  generatePDF()
```
