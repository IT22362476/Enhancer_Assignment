# ── Azure Deployment Variables ──────────────────

# Azure region
location = "Southeast Asia"
static_web_app_location = "East Asia"

# Globally unique names (using your name to ensure uniqueness)
app_service_name = "purchasebill-api-denuwan"
sql_server_name  = "sql-purchasebill-denuwan"

# SQL Admin credentials
sql_admin_username = "sqladmin"
sql_admin_password = "P@ssw0rd1234!"

# Backend URL (used for frontend build - update after first terraform apply)
backend_url = "https://purchasebill-api-denuwan.azurewebsites.net"
