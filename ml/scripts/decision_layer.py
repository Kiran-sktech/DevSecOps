import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier


# =========================
# Load dataset
# =========================

df = pd.read_csv("ml/dataset/forever_metrics.csv")


# =========================
# Select features
# =========================

features = [
    "cpu_usage",
    "memory_usage",
    "request_rate",
    "application_health"
]

X = df[features]
y = df["label"]


# =========================
# Split dataset
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# =========================
# Train final model
# =========================

model = DecisionTreeClassifier(
    random_state=42,
    max_depth=5
)

model.fit(X_train, y_train)


# =========================
# Calculate risk scores
# =========================

risk_scores = model.predict_proba(X_test)[:, 1]


# =========================
# Convert risk score to level
# =========================

def get_risk_level(risk_score):

    if risk_score < 0.40:
        return "LOW"

    elif risk_score < 0.70:
        return "MEDIUM"

    else:
        return "HIGH"

def get_action(risk_level):

    if risk_level == "LOW":
        return "Continue Monitoring"

    elif risk_level == "MEDIUM":
        return "Generate Alert"

    else:
        return "Trigger Recovery"
# =========================
# Display results
# =========================

print("\n===== RISK SCORE DECISION LAYER =====")

for i, risk_score in enumerate(risk_scores):

    risk_level = get_risk_level(risk_score)
    action = get_action(risk_level)

    print(
        f"Sample {i + 1}: "
        f"Risk Score = {risk_score:.2f} | "
        f"Risk Level = {risk_level} | "
        f"Action = {action}"
    )