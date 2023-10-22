# umbilical gcloud terraform

Provisions a Google Cloud Run Service to run umbilical.

## Inputs

| Name                     | Description                                            | Type   | Required | Default |
| ------------------------ | ------------------------------------------------------ | ------ | -------- | ------- |
| `project`                | The Google Cloud Project in which the service will run | string | Yes      | n/a     |
| `region`                 | The Google Cloud region in which the service will run  | string | Yes      | n/a     |
| `pi_api_key`             | The PodcastIndex API Key, for searches                 | string | Yes      | n/a     |
| `pi_api_secret`          | The PodcastIndex API Secret, for searches              | string | Yes      | n/a     |
| `disable_api_on_destroy` | Whether to disable the Cloud Run API on destroy        | bool   | No       | false   |
