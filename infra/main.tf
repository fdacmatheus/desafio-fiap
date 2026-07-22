# Cluster Kubernetes local (kind) com as portas NodePort da API (30080)
# e da UI do MailHog (30825) mapeadas para o host.
resource "kind_cluster" "oficina" {
  name           = var.cluster_name
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"

      extra_port_mappings {
        container_port = 30080
        host_port      = 30080
      }
      extra_port_mappings {
        container_port = 30825
        host_port      = 30825
      }
    }

    node {
      role = "worker"
    }
  }
}

provider "kubernetes" {
  host                   = kind_cluster.oficina.endpoint
  cluster_ca_certificate = kind_cluster.oficina.cluster_ca_certificate
  client_certificate     = kind_cluster.oficina.client_certificate
  client_key             = kind_cluster.oficina.client_key
}

resource "kubernetes_namespace" "oficina" {
  metadata {
    name = "oficina"
  }
}

resource "kubernetes_secret" "db" {
  metadata {
    name      = "oficina-api-secrets"
    namespace = kubernetes_namespace.oficina.metadata[0].name
  }

  data = {
    DB_USER            = var.db_user
    DB_PASSWORD        = var.db_password
    JWT_SECRET         = "EmHzUxUalRvagKzD2/B5GwMkNK+7L07Y+HX/H7mNwqKVdWZBKM/BbiPbX23IZjuk"
    JWT_REFRESH_SECRET = "hd01CRqmIUa3MOGpzwHzBoWYGRQkrugTLiOpWBUmjQagPPiCqglj8Ng+uO22Xxq9"
  }
}

# Banco de dados PostgreSQL provisionado pelo Terraform dentro do cluster.
resource "kubernetes_persistent_volume_claim" "postgres" {
  metadata {
    name      = "postgres-data"
    namespace = kubernetes_namespace.oficina.metadata[0].name
  }
  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = "1Gi"
      }
    }
  }
  wait_until_bound = false
}

resource "kubernetes_deployment" "postgres" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace.oficina.metadata[0].name
    labels    = { app = "postgres" }
  }

  spec {
    replicas = 1
    strategy {
      type = "Recreate"
    }
    selector {
      match_labels = { app = "postgres" }
    }
    template {
      metadata {
        labels = { app = "postgres" }
      }
      spec {
        container {
          name  = "postgres"
          image = "postgres:16-alpine"

          port {
            container_port = 5432
          }

          env {
            name  = "POSTGRES_USER"
            value = var.db_user
          }
          env {
            name  = "POSTGRES_PASSWORD"
            value = var.db_password
          }
          env {
            name  = "POSTGRES_DB"
            value = var.db_name
          }
          env {
            name  = "PGDATA"
            value = "/var/lib/postgresql/data/pgdata"
          }

          volume_mount {
            name       = "data"
            mount_path = "/var/lib/postgresql/data"
          }

          readiness_probe {
            exec {
              command = ["pg_isready", "-U", var.db_user, "-d", var.db_name]
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }
        }

        volume {
          name = "data"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.postgres.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "postgres" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace.oficina.metadata[0].name
  }
  spec {
    selector = { app = "postgres" }
    port {
      port        = 5432
      target_port = 5432
    }
  }
}
