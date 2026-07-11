terraform {
  required_version = ">= 1.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
  # Uncomment and configure for team/remote state:
  # backend "azurerm" {
  #   resource_group_name  = "rg-terraform-state"
  #   storage_account_name = "sttfstatepurchasebill"
  #   container_name       = "tfstate"
  #   key                  = "purchasebill.terraform.tfstate"
  # }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

# ──────────────────────────────────────────────
# Resource Group
# ──────────────────────────────────────────────
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

# ──────────────────────────────────────────────
# App Service Plan (Linux, B1)
# ──────────────────────────────────────────────
resource "azurerm_service_plan" "main" {
  name                = var.app_service_plan_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "B1"
  tags                = var.tags
}

# ──────────────────────────────────────────────
# App Service (Backend API - .NET 8)
# ──────────────────────────────────────────────
resource "azurerm_linux_web_app" "backend" {
  name                = var.app_service_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    application_stack {
      dotnet_version = "8.0"
    }
    cors {
      allowed_origins = ["*"]
    }
    always_on = false
  }

  app_settings = {
    "ASPNETCORE_ENVIRONMENT"              = "Production"
    "ConnectionStrings__DefaultConnection" = local.sql_connection_string
    "SCM_DO_BUILD_DURING_DEPLOYMENT"      = "true"
  }

  tags = var.tags
}

# ──────────────────────────────────────────────
# Static Web App (Frontend - Angular)
# ──────────────────────────────────────────────
resource "azurerm_static_web_app" "frontend" {
  name                = var.static_web_app_name
  location            = var.static_web_app_location
  resource_group_name = azurerm_resource_group.main.name
  tags                = var.tags
}

# ──────────────────────────────────────────────
# Azure SQL Server
# ──────────────────────────────────────────────
resource "azurerm_mssql_server" "main" {
  name                         = var.sql_server_name
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_username
  administrator_login_password = var.sql_admin_password
  tags                         = var.tags
}

# Allow Azure services to access the SQL server
resource "azurerm_mssql_firewall_rule" "allow_azure" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# ──────────────────────────────────────────────
# Azure SQL Database (Serverless)
# ──────────────────────────────────────────────
resource "azurerm_mssql_database" "main" {
  name           = var.sql_database_name
  server_id      = azurerm_mssql_server.main.id
  collation      = "SQL_Latin1_General_CP1_CI_AS"
  license_type   = "BasePrice"
  sku_name       = "S0"  # Standard S0 (10 DTU) - low cost tier
  max_size_gb    = 10
  tags           = var.tags
}

# ──────────────────────────────────────────────
# Connection string for the backend
# ──────────────────────────────────────────────
locals {
  sql_connection_string = "Server=tcp:${azurerm_mssql_server.main.fully_qualified_domain_name},1433;Initial Catalog=${azurerm_mssql_database.main.name};Persist Security Info=False;User ID=${var.sql_admin_username};Password=${var.sql_admin_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
}
