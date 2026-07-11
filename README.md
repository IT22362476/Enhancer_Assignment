# Full Stack Developer Assignment - Purchase Bill Application

## Technologies Used
- **Frontend:** Angular (Latest), HTML5, CSS3, TypeScript
- **Backend:** .NET Core 8, C#, Entity Framework Core, SQL Server

## Project Structure
```
Enhancer_Assignment/
├── frontend/                 # Angular application
│   └── src/app/
│       ├── login/            # Login page component
│       ├── purchase-bill/    # Purchase Bill form component
│       ├── services/         # Auth & Purchase API services
│       ├── auth.guard.ts     # Route guard for authentication
│       ├── app.module.ts     # Main module
│       ├── app-routing.module.ts  # Routes
│       └── app.component.ts  # Root component
├── backend/                  # .NET Core Web API
│   ├── Controllers/
│   │   ├── AuthController.cs      # Login API
│   │   └── PurchaseController.cs   # Purchase Bill API
│   ├── Models/
│   │   ├── LocationDetail.cs
│   │   ├── LoginRequest.cs
│   │   └── PurchaseItem.cs
│   ├── Data/
│   │   └── AppDbContext.cs
│   └── Program.cs
└── README.md
```

## How to Run

### 0. Prerequisites: Start SQL Server (Docker)
```bash
docker run -e 'ACCEPT_EULA=Y' \
  -e 'MSSQL_SA_PASSWORD=Pa$$w0rd1' \
  -p 1433:1433 \
  --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest
```
> **Note:** Install mssql-tools in the container for debugging:
> ```bash
> docker exec -u 0 sqlserver apt-get update -qq && docker exec -u 0 sqlserver apt-get install -y -qq mssql-tools
> ```

The database `PurchaseBillDB` is auto-created on first run.

### 1. Start the Backend (.NET Core API)
```bash
cd backend
dotnet run
```
The API will start at: **http://localhost:5078**
- Swagger UI: http://localhost:5078/swagger
- Auth endpoint: POST http://localhost:5078/api/auth/login
- Purchase endpoints: GET/POST http://localhost:5078/api/purchase/...

### 2. Start the Frontend (Angular)
```bash
cd frontend
npx ng serve
```
The app will be available at: **http://localhost:4200**

## Features Implemented

### Task 1: Login Page
- Beautiful login form with email and password fields
- Calls external API: `https://ez-staging-api.azurewebsites.net/api/External_Api/POS_Api/Invoke`
- On success: Saves `User_Locations` to SQLite `Location_Details` table
- On failure: Shows error message
- Route guard prevents access to purchase bill without login

### Task 2: Purchase Bill Form (Post-Login)
- **Item Field:** Autocomplete with fruits list (Mango, Apple, Banana, Orange, Grapes, Kiwi, Strawberry)
- **Batch Dropdown:** Dynamically populated from `Location_Details` table
- **Calculations:**
  - Total Cost = (Standard Cost × Quantity) – Discount%
  - Total Selling = Standard Price × Quantity
- **Add to Table:** Items are saved to backend and displayed in a table
- **Summary Section:** Shows Total Items and Total Quantity

### Login Credentials (for testing)
Use the company credentials as mentioned in the assignment:
- Email: `info@enhanzer.com`
- Password: `Welcome#3`

### SQL Server Credentials (Docker)
- Server: `localhost,1433`
- Username: `sa`
- Password: `Pa$$w0rd1`
- Database: `PurchaseBillDB` (auto-created)

---

## ☁️ Deployment to Azure (CI/CD Pipeline)

The project uses a **two-step approach**:
1. **Terraform locally** — provision infrastructure (works with `az login`, no Azure AD restrictions)
2. **GitHub Actions** — build & deploy code (uses publish profiles, no service principal needed)

### Architecture
```
Local Machine                 GitHub Actions (on push to main)
─────────────                 ────────────────────────────────
az login (no AD req.)         
     │                              
     ▼                              
Terraform apply               1. Validate secrets
  ─► Resource Group            2. Database: run init.sql
  ─► App Service               3. Backend: dotnet publish
  ─► Static Web App               + deploy via publish profile
  ─► Azure SQL DB               4. Frontend: ng build --prod
     │                             + deploy via SWA token
     ▼                              
Copy outputs into             
GitHub Secrets & Variables    
```

### Step 1: Provision Infrastructure (Run Once)
```bash
# Login to Azure (works with student subscriptions!)
az login

# Set your subscription
az account set --subscription "<YOUR_SUBSCRIPTION_ID>"

# Go to terraform directory
cd terraform

# Copy and fill in your values
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your unique names

# Initialize and apply
terraform init
terraform apply
```

After `terraform apply` completes, note these outputs:
- `backend_url` → e.g., `https://purchasebill-api-yourname.azurewebsites.net`
- `frontend_url` → e.g., `https://<swa-name>.azureedge.net`
- `sql_server_fqdn` → your SQL Server address
- `sql_database_name` → `PurchaseBillDB`

### Step 2: Get Publish Profile (Portal)
1. Go to **Azure Portal** → **App Service** (`purchasebill-api-xxx`)
2. Go to **Deployment** → **Deployment Center** → **Get publish profile**
3. Download the `.PublishSettings` file — the full XML content is your secret

### Step 3: Get Static Web Apps Deployment Token (Portal)
1. Go to **Azure Portal** → **Static Web App** (`swa-purchasebill`)
2. Go to **Settings** → **Deployment tokens**
3. Copy the token value

### Step 4: Build SQL Connection String
Format:
```
Server=tcp:<SQL_SERVER_FQDN>,1433;Initial Catalog=PurchaseBillDB;Persist Security Info=False;User ID=<SQL_USER>;Password=<SQL_PASS>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

### 🔐 Required GitHub Secrets
Go to GitHub → **Settings** → **Secrets and variables** → **Actions**:

| Secret Name | Description | How to Get |
|---|---|---|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Full XML from downloaded `.PublishSettings` file | App Service → Deployment Center → Get publish profile |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Deployment token hash | Static Web App → Deployment tokens |
| `SQL_CONNECTION_STRING` | Full SQL connection string | Build from Terraform outputs (see above) |

### ⚙️ Required GitHub Variables
| Variable Name | Description |
|---|---|
| `BACKEND_URL` | Backend URL from Terraform output (e.g., `https://purchasebill-api-yourname.azurewebsites.net`) |
| `SWA_NAME` | Static Web App name (e.g., `swa-purchasebill`) |

### 🚀 Deploy
Push to `main` branch — the pipeline runs automatically:
```bash
git add .
git commit -m "Deploy to Azure"
git push origin main
```

Or trigger manually: GitHub → **Actions** → **Deploy Purchase Bill App** → **Run workflow**.

### 📍 Live Demo URL
After deployment, your app will be live at:
- **Frontend:** `https://<swa-name>.azureedge.net`
- **Backend API:** `https://<app-service-name>.azurewebsites.net`
- **Swagger:** `https://<app-service-name>.azurewebsites.net/swagger`

### 🧹 Clean Up Resources
To avoid ongoing costs:
```bash
cd terraform
terraform destroy
```
Or delete the resource group in Azure Portal.
