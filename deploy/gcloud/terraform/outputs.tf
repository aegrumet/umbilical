output "url" {
  description = "The Cloud Run URL for the service"
  value       = google_cloud_run_service.umbilical.status[0].url
}
