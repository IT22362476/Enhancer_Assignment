-- ============================================================
-- Purchase Bill Application - Database Schema
-- SQL Server Script
-- ============================================================
-- Run this script against your Azure SQL Database (or local SQL Server)
-- to create the required tables.
-- ============================================================

-- Create Database (if not exists)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'PurchaseBillDB')
BEGIN
    CREATE DATABASE [PurchaseBillDB];
END
GO

USE [PurchaseBillDB];
GO

-- ──────────────────────────────────────────────
-- Table: Location_Details
-- Stores user locations from login response
-- ──────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Location_Details')
BEGIN
    CREATE TABLE [dbo].[Location_Details] (
        [Id]             INT            IDENTITY(1,1) NOT NULL,
        [Location_Code]  NVARCHAR(MAX)  NOT NULL,
        [Location_Name]  NVARCHAR(MAX)  NOT NULL,
        CONSTRAINT [PK_Location_Details] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

-- ──────────────────────────────────────────────
-- Table: Purchase_Items
-- Stores purchase bill line items
-- ──────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Purchase_Items')
BEGIN
    CREATE TABLE [dbo].[Purchase_Items] (
        [Id]             INT             IDENTITY(1,1) NOT NULL,
        [Item]           NVARCHAR(MAX)   NOT NULL,
        [Batch]          NVARCHAR(MAX)   NOT NULL,
        [StandardCost]   DECIMAL(18,2)   NOT NULL,
        [StandardPrice]  DECIMAL(18,2)   NOT NULL,
        [Quantity]       DECIMAL(18,2)   NOT NULL,
        [Discount]       DECIMAL(18,2)   NOT NULL,
        [TotalCost]      DECIMAL(18,2)   NOT NULL,
        [TotalSelling]   DECIMAL(18,2)   NOT NULL,
        CONSTRAINT [PK_Purchase_Items] PRIMARY KEY CLUSTERED ([Id] ASC)
    );
END
GO

-- ============================================================
-- Verify Tables
-- ============================================================
SELECT 
    TABLE_NAME, 
    TABLE_TYPE 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'dbo';
GO
