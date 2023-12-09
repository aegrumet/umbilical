module "umbilical" {
  source         = "../.."
  project        = var.project
  region         = var.region
  pi_api_key     = var.pi_api_key
  pi_api_secret  = var.pi_api_secret
  umbilical_keys = var.umbilical_keys
  debug          = var.debug
  providers = {
    google = google
  }
}
