output "cluster_name" {
  value = kind_cluster.oficina.name
}

output "kubeconfig_path" {
  value = kind_cluster.oficina.kubeconfig_path
}

output "api_url" {
  description = "URL da API após aplicar os manifestos de k8s/"
  value       = "http://localhost:30080/api"
}

output "mailhog_ui" {
  description = "UI do MailHog para visualizar os e-mails enviados"
  value       = "http://localhost:30825"
}
