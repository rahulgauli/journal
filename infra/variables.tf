variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "ssh_user" {
  description = "SSH username to create on the VM"
  type        = string
  default     = "deploy"
}

variable "ssh_public_key_path" {
  description = "Path to your local SSH public key"
  type        = string
  default     = "~/.ssh/id_ed25519.pub"
}
