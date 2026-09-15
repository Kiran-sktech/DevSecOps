from kubernetes import client, config
from datetime import datetime


NAMESPACE = "forever"
DEPLOYMENT_NAME = "backend"


def restart_backend():
    """
    Restart the backend deployment by updating its pod template.
    Kubernetes will terminate the old pod and create a new one.
    """

    # Load the user's local Kubernetes configuration
    config.load_kube_config()

    apps_api = client.AppsV1Api()

    # Get the current backend deployment
    deployment = apps_api.read_namespaced_deployment(
        name=DEPLOYMENT_NAME,
        namespace=NAMESPACE
    )

    # Add/update a restart timestamp
    if deployment.spec.template.metadata.annotations is None:
        deployment.spec.template.metadata.annotations = {}

    deployment.spec.template.metadata.annotations[
        "self-healing/restarted-at"
    ] = datetime.utcnow().isoformat()

    # Update the deployment
    apps_api.patch_namespaced_deployment(
        name=DEPLOYMENT_NAME,
        namespace=NAMESPACE,
        body=deployment
    )

    print("🔄 Recovery action triggered: backend restart")


if __name__ == "__main__":
    restart_backend()
    