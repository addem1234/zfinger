job "zfinger" {
  type = "service"

  group "zfinger" {
    network {
      port "http" {
        to = 5000
      }
    }

    service {
      name     = "zfinger"
      port     = "http"
      provider = "nomad"
      tags = [
        "traefik.enable=true",
        "traefik.http.routers.zfinger.rule=Host(`zfinger.datasektionen.se`)",
        "traefik.http.routers.zfinger.tls.certresolver=default",
      ]
    }

    task "zfinger" {
      driver = "docker"

      config {
        image = var.image_tag
        ports = ["http"]
      }

      template {
        data        = <<ENV
{{ with nomadVar "nomad/jobs/zfinger" }}
AWS_SECRET_ACCESS_KEY={{ .aws_secret_access_key }}
LOGIN_API_KEY={{ .login_api_key }}
{{ end }}
AWS_ACCESS_KEY_ID=AKIATUCF4UAO3OIEOFJA
LOGIN_FRONTEND_URL=https://sso.datasektionen.se/legacyapi
LOGIN_API_URL=http://sso.nomad.dsekt.internal/legacyapi
HODIS_HOST=https://hodis.datasektionen.se
ENV
        destination = "local/.env"
        env         = true
      }

      resources {
        memory = 150
      }
    }
  }
}

variable "image_tag" {
  type = string
  default = "ghcr.io/datasektionen/zfinger:latest"
}
