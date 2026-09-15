def recovery_policy(risk_level):

    if risk_level == "LOW":
        return {
            "action": "MONITOR",
            "description": "Continue monitoring the application"
        }

    elif risk_level == "MEDIUM":
        return {
            "action": "ALERT",
            "description": "Generate an alert for investigation"
        }

    elif risk_level == "HIGH":
        return {
            "action": "RECOVER",
            "description": "Trigger application recovery"
        }

    else:
        return {
            "action": "UNKNOWN",
            "description": "No action available for unknown risk level"
        }


# Test recovery policies

risk_levels = ["LOW", "MEDIUM", "HIGH"]

print("\n===== RECOVERY POLICY =====")

for risk_level in risk_levels:

    policy = recovery_policy(risk_level)

    print(
        f"Risk Level: {risk_level} | "
        f"Action: {policy['action']} | "
        f"Description: {policy['description']}"
    )