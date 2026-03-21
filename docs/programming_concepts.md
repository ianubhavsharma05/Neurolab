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
- whether the user is recording or uploading data

Example pattern:

```tsx
const navItems = isAuthenticated
  ? authenticatedItems
  : publicItems;
```

## 3. Local Persistence

The frontend stores session data in `localStorage`.

Tracked collections include:

- MRI results
- speech results
- cognitive results
- fused risk assessments

This allows the dashboard and reports pages to rebuild history without a database dependency in the current frontend flow.

## 4. API Integration

The frontend sends user inputs to FastAPI using `fetch`.

Current API calls:

- `POST /analyze-mri`
- `POST /analyze-speech`
- `POST /calculate-accuracy`

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

Example:

```python
overall_accuracy = (
    request.mriScore * 0.45 +
    request.speechScore * 0.25 +
    request.cognitiveScore * 0.30
)
```

## 6. Data Visualization

The UI renders multiple visual formats:

- gauges for confidence and summary scores
- line charts for longitudinal trends
- heatmaps for MRI explainability
- waveform visualization for speech

These are built from stored result objects rather than hardcoded display values.

## 7. Progressive UI States

Several pages follow the same state progression:

1. idle
2. input collected
3. processing
4. result rendered
5. reset / re-run

This pattern is visible in MRI and speech analysis flows.

## 8. Route Experience

The app includes:

- scroll reset on route change
- shared curved page-shell styling
- transparent panel surfaces

This keeps navigation between dashboard, about, MRI, speech, and reports visually consistent.
