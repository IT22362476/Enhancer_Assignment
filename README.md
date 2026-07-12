# Purchase Bill Application

A full-stack purchase bill management application built with Angular and .NET Core.

## Architecture

**3-Tier Architecture with REST API**

| Tier | Technology | Purpose |
|---|---|---|
| **Client** | Angular 16, TypeScript, CSS3 | Single-page application with login and purchase bill form |
| **Application** | .NET 8 Web API, C#, Entity Framework Core | REST API handling authentication and purchase operations |
| **Data** | SQL Server (local via Docker / Azure SQL) | Stores user locations and purchase items |

## Technologies Used

| Technology | Usage |
|---|---|
| **Angular 16** | Frontend SPA with component-based architecture, routing, form validation, and HTTP services |
| **TypeScript** | Type-safe frontend code with interfaces and strong typing |
| **.NET 8 Web API** | Backend REST API with controller-based endpoints |
| **C#** | Backend business logic and data access |
| **Entity Framework Core** | ORM for database operations with code-first approach |
| **SQL Server** | Relational database for persisting location details and purchase items |
| **Terraform** | Infrastructure as Code for provisioning Azure resources |
| **GitHub Actions** | CI/CD pipeline for automated build and deployment |
| **Azure App Service** | Hosting for the backend .NET API |
| **Azure Static Web Apps** | Hosting for the frontend Angular application |
| **Azure SQL** | Managed SQL Server database in the cloud |

## Features

### Task 1: Login Page
- Email and password authentication form
- Calls external POS API for credential validation
- On success: retrieves `User_Locations` and saves to `Location_Details` table
- On failure: displays error message from API
- Route guard prevents unauthorized access to purchase bill page
- Field-level validation with error messages

### Task 2: Purchase Bill Form
- **Item Field:** Autocomplete with fruit list (Mango, Apple, Banana, Orange, Grapes, Kiwi, Strawberry)
- **Batch Dropdown:** Populated from saved `Location_Details` table
- **Auto-calculated fields:**
  - Margin = Standard Price − Standard Cost
  - Total Cost = (Standard Cost × Quantity) − Discount%
  - Total Selling = Standard Price × Quantity
- **Items Table:** Displays all added items with calculated values
- **Summary:** Total Items count and Total Quantity

## How to Run Locally

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Angular CLI](https://angular.io/cli)

### 1. Start SQL Server (Docker)
```bash
docker run -e 'ACCEPT_EULA=Y' \
  -e 'MSSQL_SA_PASSWORD=Pa$$w0rd1' \
  -p 1433:1433 \
  --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

### 2. Start Backend
```bash
cd backend
dotnet run
```
API runs at **http://localhost:5078**
- Swagger UI: http://localhost:5078/swagger
- Auth: POST /api/auth/login
- Purchase: GET/POST /api/purchase/items, GET /api/purchase/locations

### 3. Start Frontend
```bash
cd frontend
npx ng serve
```
App runs at **http://localhost:4200**

### Test Credentials
- Email: `info@enhanzer.com`
- Password: `Welcome#3`

## Project Structure
```
Enhancer_Assignment/
├── frontend/                  # Angular application
│   └── src/app/
│       ├── login/             # Login page component
│       ├── purchase-bill/     # Purchase Bill form + table component
│       ├── services/          # AuthService, PurchaseService
│       ├── auth.guard.ts      # Route guard
│       ├── app.module.ts      # Root module
│       └── app-routing.module.ts
├── backend/                   # .NET 8 Web API
│   ├── Controllers/           # AuthController, PurchaseController
│   ├── Models/                # LoginRequest, LocationDetail, PurchaseItem
│   ├── Data/                  # AppDbContext
│   └── Program.cs
├── database/
│   └── init.sql               # SQL Server schema script
└── README.md
```
