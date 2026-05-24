terraform {
  required_version = ">= 1.6"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ── Static external IP ────────────────────────────────────────────────────────
resource "google_compute_address" "journal_ip" {
  name   = "journal-ip"
  region = var.region
}

# ── Firewall: SSH ─────────────────────────────────────────────────────────────
resource "google_compute_firewall" "allow_ssh" {
  name    = "journal-allow-ssh"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["journal-server"]
}

# ── Firewall: HTTP + HTTPS ────────────────────────────────────────────────────
resource "google_compute_firewall" "allow_web" {
  name    = "journal-allow-web"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["journal-server"]
}

# ── VM ────────────────────────────────────────────────────────────────────────
resource "google_compute_instance" "journal_server" {
  name         = "journal-server"
  machine_type = "e2-micro"
  zone         = var.zone
  tags         = ["journal-server"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 20
      type  = "pd-standard"
    }
  }

  network_interface {
    network = "default"
    access_config {
      nat_ip = google_compute_address.journal_ip.address
    }
  }

  metadata = {
    ssh-keys       = "${var.ssh_user}:${file(pathexpand(var.ssh_public_key_path))}"
    enable-oslogin = "FALSE"
  }

  metadata_startup_script = <<-EOT
    #!/bin/bash
    set -e
    apt-get update -y
    apt-get install -y nginx curl git

    # Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs

    # pm2
    npm install -g pm2
    pm2 startup systemd -u ${var.ssh_user} --hp /home/${var.ssh_user}

    # App + db directories
    mkdir -p /var/www/journal/db
    chown -R ${var.ssh_user}:${var.ssh_user} /var/www/journal
  EOT
}
