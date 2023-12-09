resource "google_project_service" "cloud_run_api" {
  project            = var.project
  service            = "run.googleapis.com"
  disable_on_destroy = var.disable_api_on_destroy
}

resource "google_cloud_run_service" "umbilical" {
  name     = "umbilical"
  location = var.region
  template {
    spec {
      containers {
        image = "aegrumet/umbilical:latest"
        env {
          name  = "PI_API_KEY"
          value = var.pi_api_key
        }
        env {
          name  = "PI_API_SECRET"
          value = var.pi_api_secret
        }
        env {
          name  = "UMBILICAL_KEYS"
          value = var.umbilical_keys
        }
        env {
          name  = "DEBUG"
          value = var.debug
        }
        ports {
          container_port = 8000
        }
      }
    }
  }

  depends_on = [ // Here
    google_project_service.cloud_run_api
  ]
}

resource "google_project_service" "run_api" {
  service = "run.googleapis.com"

  disable_on_destroy = true
  depends_on         = [google_project_service.run_api]
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location = google_cloud_run_service.umbilical.location
  project  = google_cloud_run_service.umbilical.project
  service  = google_cloud_run_service.umbilical.name

  policy_data = data.google_iam_policy.noauth.policy_data
}

