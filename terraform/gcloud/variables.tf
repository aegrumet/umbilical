variable "project" {
  type = string
}

variable "region" {
  type = string
}

variable "pi_api_key" {
  type = string
}

variable "pi_api_secret" {
  type = string
}

variable "disable_api_on_destroy" {
  type    = bool
  default = false
}
