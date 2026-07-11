variable "resource_group_name" {
  description = "Name of the Azure Resource Group"
  type        = string
  default     = "rg-purchasebill"
}

variable "location" {
  description = "Azure region for most resources"
  type        = string
  default     = "Southeast Asia"
}

variable "static_web_app_location" {
  description = "Azure region for Static Web App (limited regions: centralus, eastus2, westus2, westeurope, eastasia)"
  type        = string
  default     = "East Asia"
}

variable "app_service_plan_name" {
  description = "Name of the App Service Plan"
  type        = string
  default     = "asp-purchasebill"
}

variable "app_service_name" {
  description = "Name of the App Service (backend API)"
  type        = string
}

variable "static_web_app_name" {
  description = "Name of the Static Web App (frontend)"
  type        = string
  default     = "swa-purchasebill"
}

variable "sql_server_name" {
  description = "Name of the Azure SQL Server"
  type        = string
}

variable "sql_database_name" {
  description = "Name of the Azure SQL Database"
  type        = string
  default     = "PurchaseBillDB"
}

variable "sql_admin_username" {
  description = "SQL Server admin username"
  type        = string
  sensitive   = true
}

variable "sql_admin_password" {
  description = "SQL Server admin password"
  type        = string
  sensitive   = true
}

variable "backend_url" {
  description = "URL of the deployed backend API (used for frontend build)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    Environment = "Production"
    Project     = "PurchaseBillApp"
    ManagedBy   = "Terraform"
  }
}
