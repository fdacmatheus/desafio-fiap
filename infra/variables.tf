variable "cluster_name" {
  description = "Nome do cluster kind"
  type        = string
  default     = "oficina"
}

variable "db_user" {
  description = "Usuário do PostgreSQL"
  type        = string
  default     = "oficina"
}

variable "db_password" {
  description = "Senha do PostgreSQL"
  type        = string
  default     = "oficina"
  sensitive   = true
}

variable "db_name" {
  description = "Nome do banco de dados"
  type        = string
  default     = "oficina"
}
