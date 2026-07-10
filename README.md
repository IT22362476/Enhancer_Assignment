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
