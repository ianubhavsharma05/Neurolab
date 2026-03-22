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

    MRI --> MRIInput[Select JPEG/PNG file]
    MRIInput --> MRIUpload[Send file to backend]
    MRIUpload --> MRIResult[Store precisionScore locally]

    Speech --> SpeechInput[Record or upload WAV]
    SpeechInput --> SpeechUpload[Send WAV to backend]
    SpeechUpload --> SpeechResult[Store precisionScore locally]

    Cognitive --> CognitiveFlow[Run browser test flow]
    CognitiveFlow --> CognitiveResult[Store overallScore locally]

    MRIResult --> Fusion[Calculate precisionScore via /calculate-risk]
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
  if fileIsJPEGorPNG:
    sendImageToBackend()
    receiveClassificationAndHeatmap() # Returns precisionScore keyword
    saveMRIResult()
  else:
    showError("Invalid format")

onSpeechUpload:
  if fileIsWAV:
    sendAudioToBackend()
    receiveFeaturesAndClassification() # Returns precisionScore keyword
    saveSpeechResult()
  else:
    showError("Invalid format")

onCognitiveCompletion:
  computeCognitiveScore()
  saveCognitiveResult()

onFusionRequest:
  sendMRI(precisionScore) + speech(precisionScore) + cognitive(overallScore)
  receiveOverallRisk() # Computed as (MRI*0.45 + Speech*0.25 + Cognitive*0.30)
  saveAssessment()

onReportExport:
  generatePDF() # Exports "Precision" telemetry in table rows
```
