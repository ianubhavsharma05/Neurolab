# NeuroSense AI Architecture Flowchart

## Current Application Architecture

```mermaid
graph TB
    subgraph Frontend[Frontend - React / Vite]
        App[App.tsx]
        Navbar[Navbar + route navigation]
        Pages[Pages and feature screens]
        AuthContext[AuthContext]
        LanguageContext[LanguageContext]
        PageShell[Curved transparent page shell]
        DataStore[dataStore local persistence]
        API[services/api.ts]
        UI[Charts, gauges, heatmaps, waveform, chatbot, 3D visuals]
    end

    subgraph Backend[Backend - FastAPI]
        Main[main.py]
        MRIEndpoint[/POST analyze-mri/]
        SpeechEndpoint[/POST analyze-speech/]
        AccuracyEndpoint[/POST calculate-accuracy/]
        MLUtils[ml_utils.py]
    end

    subgraph Models[Models and Metrics]
        MRIModel[final_model.pth]
        SpeechModel[speech_model.pkl]
        MRIMetrics[mri_metrics.json]
        SpeechMetrics[speech_metrics.json]
        GradCAM[Grad-CAM]
    end

    App --> Navbar
    App --> Pages
    App --> AuthContext
    App --> LanguageContext
    Pages --> PageShell
    Pages --> DataStore
    Pages --> API
    Pages --> UI

    API --> MRIEndpoint
    API --> SpeechEndpoint
    API --> AccuracyEndpoint

    MRIEndpoint --> Main
    SpeechEndpoint --> Main
    AccuracyEndpoint --> Main

    Main --> MLUtils
    Main --> MRIModel
    Main --> SpeechModel
    Main --> MRIMetrics
    Main --> SpeechMetrics
    Main --> GradCAM
```

## Notes

### Frontend

- React Router manages page navigation
- `AuthContext` manages demo authentication state
- `LanguageContext` manages English/Hindi UI selection
- `PageShell` provides the shared curved transparent layout
- `dataStore` persists longitudinal data in `localStorage`

### Backend

- FastAPI exposes inference and score-calculation endpoints
- MRI inference uses PyTorch + torchvision + Grad-CAM
- Speech inference uses librosa feature extraction and a serialized model

### Data Path

1. User input is collected in the frontend
2. Relevant files or scores are sent to FastAPI
3. The backend returns predictions and metadata
4. The frontend stores results locally
5. Dashboard and reports rebuild the user timeline from stored results
