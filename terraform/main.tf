terraform {
  required_version = ">= 1.0"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 5.3"
    }
  }
}

provider "vercel" {
  # Reads VERCEL_API_TOKEN from environment automatically
}

# ─────────────────────────────────────────────
# Project
# ─────────────────────────────────────────────
resource "vercel_project" "brainfart" {
  name      = var.vercel_project_name
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = var.github_repo
  }

  build_command    = "pnpm run build"
  install_command  = "pnpm install"
  output_directory = ".next"
  root_directory   = var.root_directory

  ignore_command = "fn() { echo \"$VERCEL_GIT_COMMIT_MESSAGE\" | grep -qE '\\[skip ci\\]' && exit 0 || exit 1 }"
}

# ─────────────────────────────────────────────
# Domain (conditional)
# ─────────────────────────────────────────────
resource "vercel_project_domain" "brainfart" {
  count = var.domain_name != "" ? 1 : 0

  project_id = vercel_project.brainfart.id
  domain     = var.domain_name
}

# ─────────────────────────────────────────────
# Direct Deployment (optional)
# ─────────────────────────────────────────────
#
# Uncomment to deploy directly via Terraform instead of git-push.
#
# data "vercel_project_directory" "brainfart" {
#   path = "${path.module}/.."
# }
#
# resource "vercel_deployment" "brainfart" {
#   project_id  = vercel_project.brainfart.id
#   files       = data.vercel_project_directory.brainfart.files
#   path_prefix = "${path.module}/.."
#   production  = true
# }
