# Core Programming Concepts In NeuroSense AI

This document summarizes the main implementation patterns used in the current codebase.

## 1. Context-Based Global State

The app uses React context for shared UI and session state.

### Auth context

- restores demo users from `localStorage`
- supports login, signup, logout, and display-name updates

### Language context

- switches between English and Hindi
- persists the selected language in `localStorage`

Example pattern:

```tsx
const { language, setLanguage } = useLanguage();
const { user, logout, isAuthenticated } = useAuth();
```

## 2. Conditional Rendering

The UI changes based on:

- authentication state
- selected language
- whether a result has been produced yet
- whether the user is recording or uploading data (JPEG/PNG/WAV validations)

Example pattern:

```tsx
const navItems = isAuthenticated
  ? authenticatedItems
  : publicItems;
```

## 3. Local Persistence

The frontend stores session data in `localStorage`.

Tracked collections include:

- MRI results (precisionScore)
- speech results (precisionScore)
- cognitive results (overallScore)
- fused risk assessments (precisionScore)

This allows the dashboard and reports pages to rebuild history without a database dependency in the current frontend flow.

## 4. API Integration

The frontend sends user inputs to FastAPI using `fetch`.

Current API calls:

- `POST /analyze-mri` (JPEG/PNG mandatory)
- `POST /analyze-speech` (WAV mandatory)
- `POST /calculate-risk` (weighted fusion)

Example pattern:

```ts
const response = await fetch(`${API_BASE_URL}/analyze-mri`, {
  method: 'POST',
  body: formData,
});
```

## 5. Weighted Fusion Logic

The backend computes a combined score from three signals:

- MRI: 45%
- Speech: 25%
- Cognitive: 30%

Example (Updated Logic):

```python
precision_score = (
    request.mriScore * 0.45 +
    request.speechScore * 0.25 +
    request.cognitiveScore * 0.30
)
```

## 6. Data Visualization

The UI renders multiple visual formats:

- gauges for risk and precision scores
- line charts for longitudinal trends (MRI vs Fused)
- heatmaps for MRI explainability (Grad-CAM overlays)
- waveform visualization for speech markers

These are built from stored result objects using the finalized data schema in `types/index.ts`.

## 7. Progressive UI States

Several pages follow the same state progression:

1. idle
2. input collected (WAV/JPEG/PNG)
3. processing (Loading screens with technical logging)
4. result rendered (Heatmaps, feature lists, gauges)
5. reset / re-run

## 8. Route Experience

The app includes:

- scroll reset on route change
- shared curved page-shell styling
- transparent panel surfaces (Glassmorphism)

This keeps navigation between dashboard, about, MRI, speech, and reports visually consistent.
