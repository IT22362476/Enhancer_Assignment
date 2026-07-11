output "backend_url" {
  description = "URL of the deployed backend API"
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "frontend_url" {
  description = "URL of the deployed frontend application"
  value       = azurerm_static_web_app.frontend.default_host_name
}

output "sql_server_fqdn" {
  description = "Fully qualified domain name of the SQL Server"
  value       = azurerm_mssql_server.main.fully_qualified_domain_name
}

output "sql_database_name" {
  description = "Name of the SQL Database"
  value       = azurerm_mssql_database.main.name
}

output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}
