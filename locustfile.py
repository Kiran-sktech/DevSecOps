from locust import HttpUser, task, between

class ForeverUser(HttpUser):
    wait_time = between(0.1, 0.5)

    @task
    def get_products(self):
        self.client.get("/api/product/list")