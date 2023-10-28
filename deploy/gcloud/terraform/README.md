# umbilical gcloud terraform

Provisions a Google Cloud Run Service to run umbilical.

## Example Usage

main.tf:

```hcl
module "umbilical" {
  source        = "git@github.com:aegrumet/umbilical.git//terraform/gcloud?ref=v0.0.9"
  project       = var.project
  region        = var.region
  pi_api_key    = var.pi_api_key
  pi_api_secret = var.pi_api_secret
  umbilical_keys = var.umbilical_keys

  providers = {
    google = google
  }
}
```

umbilical.gcloud.tfvars:

```
project          = "my-project"
region           = "us-central1"
pi_api_key       = "Podcast Index API Key"
pi_api_secret    = "Podcast Index API Secret"
credentials_file = "/Path/To/Your/Credentials.json"
umbilical_keys   = "SIGNING_KEY_1,SIGNING_KEY_2"

```

deploy:

```bash
terraform init
terraform plan -var-file=umbilical.gcloud.tfvars
terraform apply -var-file=umbilical.gcloud.tfvars
```

## Inputs

| Name                     | Description                                            | Type   | Required | Default |
| ------------------------ | ------------------------------------------------------ | ------ | -------- | ------- |
| `project`                | The Google Cloud Project in which the service will run | string | Yes      | n/a     |
| `region`                 | The Google Cloud region in which the service will run  | string | Yes      | n/a     |
| `pi_api_key`             | The PodcastIndex API Key, for searches                 | string | Yes      | n/a     |
| `pi_api_secret`          | The PodcastIndex API Secret, for searches              | string | Yes      | n/a     |
| `umbilical_keys`         | Comma separated list of authentication signing keys    | string | Yes      | n/a     |
| `disable_api_on_destroy` | Whether to disable the Cloud Run API on destroy        | bool   | No       | false   |
