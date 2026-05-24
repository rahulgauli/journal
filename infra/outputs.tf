output "server_ip" {
  description = "Static external IP of the journal server"
  value       = google_compute_address.journal_ip.address
}

output "ssh_command" {
  description = "SSH into the server"
  value       = "ssh ${var.ssh_user}@${google_compute_address.journal_ip.address}"
}
