def run_inference(mri_score: float, speech_score: float, cognitive_score: float) -> dict:
    total_risk = (mri_score * 0.45) + (speech_score * 0.25) + (cognitive_score * 0.30)

    if total_risk > 66:
        classification = "High"
    elif total_risk > 33:
        classification = "Moderate"
    else:
        classification = "Low"

    return {
        "overallRisk": total_risk,
        "classification": classification,
        "recommendation": (
            "Clinical consultation recommended." if total_risk > 50
            else "Longitudinal tracking advised."
        ),
        "confidence": None,
    }
