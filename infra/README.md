# Infraestrutura como Código (Terraform)

Provisiona a infraestrutura local do Tech Challenge com **Terraform + kind**.

## Recursos criados

| Recurso Terraform                       | O que provisiona                                                        |
| --------------------------------------- | ----------------------------------------------------------------------- |
| `kind_cluster.oficina`                   | Cluster Kubernetes local (1 control-plane + 1 worker) com NodePorts 30080 (API) e 30825 (MailHog UI) mapeadas para o host |
| `kubernetes_namespace.oficina`           | Namespace `oficina`                                                      |
| `kubernetes_secret.db`                   | Secret `oficina-api-secrets` (credenciais do banco e segredos JWT)       |
| `kubernetes_persistent_volume_claim`     | PVC de 1Gi para os dados do PostgreSQL                                   |
| `kubernetes_deployment.postgres`         | Banco de dados PostgreSQL 16                                             |
| `kubernetes_service.postgres`            | Service `postgres` (porta 5432) consumido pela API                       |

## Pré-requisitos

- [Terraform](https://developer.hashicorp.com/terraform/downloads) ≥ 1.5
- [Docker](https://docs.docker.com/get-docker/) (o kind cria os nós como containers)
- `kubectl`

## Como aplicar

```bash
cd infra
terraform init
terraform plan
terraform apply
```

Ao final, o kubeconfig do cluster é gravado (veja o output `kubeconfig_path`) e o
contexto `kind-oficina` fica disponível no seu `~/.kube/config`.

Depois, faça o deploy da aplicação com os manifestos:

```bash
kubectl --context kind-oficina apply -f ../k8s/
```

> O Secret também existe em `k8s/secret.yaml` (mesmos valores) para permitir o
> deploy sem Terraform; o `kubectl apply` apenas o sobrescreve.

Para o HPA funcionar no kind, instale o metrics-server:

```bash
kubectl --context kind-oficina apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl --context kind-oficina -n kube-system patch deployment metrics-server \
  --type=json -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
```

## Como destruir

```bash
terraform destroy
```
