# ─────────────────────────────────────────────
# Project
# ─────────────────────────────────────────────
variable "vercel_project_name" {
  description = "Name of the Vercel project"
  type        = string
  default     = "brainfart"
}

variable "github_repo" {
  description = "GitHub repository in the format 'owner/repo'"
  type        = string
  default     = "NickyHariniaina/Brainfart"
}

variable "github_branch" {
  description = "Production branch"
  type        = string
  default     = "main"
}

variable "root_directory" {
  description = "Root directory of the app inside the repo (null = repo root)"
  type        = string
  default     = null
}

# ─────────────────────────────────────────────
# Domain
# ─────────────────────────────────────────────
variable "domain_name" {
  description = "Custom domain to attach to the project (empty string = skip)"
  type        = string
  default     = ""
}
