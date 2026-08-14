# ARM64 BASED PROCESSOR (e.g., Apple Silicon, ARM Windows / Linux)
FROM mcr.microsoft.com/azure-sql-edge:latest

# Non-ARM64 BASED PROCESSOR (e.g., x86_64 / AMD64 / Intel)
# FROM mcr.microsoft.com/mssql/server:2022-latest

# Environment variables for SQL Server setup
ENV ACCEPT_EULA=Y
ENV MSSQL_SA_PASSWORD=DevServer@123!

# Expose SQL Server default port
EXPOSE 1433
