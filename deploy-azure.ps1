# deploy-azure.ps1
# Script Deployment Restaurant Management System ("resto-bigboy") ke Azure Container Apps
# Menggunakan local Docker untuk build & push (mendukung akun Azure for Students)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Mulai Deployment 'resto-bigboy' ke Azure Container Apps" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Login Azure
Write-Host "`n[Langkah 1/9] Melakukan autentikasi ke Azure..." -ForegroundColor Yellow
az login

# Mengatur subskripsi aktif secara eksplisit
$subId = (az account show --query "id" --output tsv)
Write-Host "Menggunakan Subskripsi: $subId" -ForegroundColor Green
az account set --subscription $subId

# 2. Pendaftaran Providers & Ekstensi Azure CLI
Write-Host "`n[Langkah 2/9] Memastikan ekstensi dan provider Azure terdaftar..." -ForegroundColor Yellow
az extension add --name containerapp --upgrade --yes
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights

# 3. Inisialisasi Nama Resource Unik
$uniqueId = Get-Random -Minimum 10000 -Maximum 99999
$rgName = "rg-resto-bigboy"
$location = "southeastasia"
$acrName = "acrrestobigboy$uniqueId"
$storageAccountName = "sarestobigboy$uniqueId"
$postgresServerName = "pg-resto-bigboy-$uniqueId"
$postgresDbName = "resto_bigboy_db"
$postgresAdminUser = "pgadminuser"

# Pembuatan Password Kuat
$postgresAdminPassword = "PgPass" + (New-Guid).ToString().Substring(0, 12) + "!"
$accessTokenSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Minimum 0 -Maximum 255) }))
$refreshTokenSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Minimum 0 -Maximum 255) }))
$initialPasswordOwner = "Owner" + (New-Guid).ToString().Substring(0, 8) + "!"

Write-Host "`n=== RESOURCE NAME CONFIGURATION ===" -ForegroundColor Green
Write-Host "Resource Group  : $rgName"
Write-Host "Location        : $location"
Write-Host "ACR Name        : $acrName"
Write-Host "Storage Account : $storageAccountName"
Write-Host "PostgreSQL Host : $postgresServerName.postgres.database.azure.com"
Write-Host "Owner Admin PW  : $initialPasswordOwner"
Write-Host "====================================" -ForegroundColor Green

# 4. Membuat Resource Group
Write-Host "`n[Langkah 3/9] Membuat Resource Group..." -ForegroundColor Yellow
az group create --name $rgName --location $location

# 5. Membuat Database PostgreSQL Flexible Server
Write-Host "`n[Langkah 4/9] Membuat PostgreSQL Flexible Server (ini mungkin memakan waktu 2-3 menit)..." -ForegroundColor Yellow
az postgres flexible-server create `
  --resource-group $rgName `
  --name $postgresServerName `
  --location $location `
  --admin-user $postgresAdminUser `
  --admin-password $postgresAdminPassword `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --public-access 0.0.0.0 `
  --yes

# Membuat Database di dalam server (Syntax CLI terbaru 2026)
Write-Host "Membuat database '$postgresDbName' di dalam server PostgreSQL..." -ForegroundColor Yellow
az postgres flexible-server db create `
  --resource-group $rgName `
  --server-name $postgresServerName `
  --name $postgresDbName

# Konfigurasi Firewall untuk semua IP internal Azure
Write-Host "Menambahkan aturan firewall untuk layanan Azure..." -ForegroundColor Yellow
az postgres flexible-server firewall-rule create `
  --resource-group $rgName `
  --name $postgresServerName `
  --rule-name AllowAllAzureIPs `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0

# Dapatkan IP Lokal Developer dan daftarkan ke firewall agar bisa running prisma migration
$myIp = (Invoke-RestMethod -Uri "https://api.ipify.org").Trim()
Write-Host "Menambahkan IP Publik Anda ($myIp) ke firewall PostgreSQL untuk menjalankan migrasi skema..." -ForegroundColor Yellow
az postgres flexible-server firewall-rule create `
  --resource-group $rgName `
  --name $postgresServerName `
  --rule-name AllowDeveloperIP `
  --start-ip-address $myIp `
  --end-ip-address $myIp

# 6. Membuat Storage Account & File Share
Write-Host "`n[Langkah 5/9] Membuat Storage Account dan File Share untuk media uploads..." -ForegroundColor Yellow
az storage account create `
  --name $storageAccountName `
  --resource-group $rgName `
  --location $location `
  --sku Standard_LRS `
  --kind StorageV2

$storageKey = (az storage account keys list `
  --resource-group $rgName `
  --account-name $storageAccountName `
  --query "[0].value" `
  --output tsv)

az storage share create `
  --name uploads-share `
  --account-name $storageAccountName `
  --account-key $storageKey

# 7. Membuat Azure Container Registry (ACR)
Write-Host "`n[Langkah 6/9] Membuat Azure Container Registry..." -ForegroundColor Yellow
az acr create `
  --resource-group $rgName `
  --name $acrName `
  --sku Basic `
  --admin-enabled true

# 8. Membuat ACA Environment & Placeholder Apps untuk reservasi domain FQDN
Write-Host "`n[Langkah 7/9] Membuat Container Apps Environment..." -ForegroundColor Yellow
az containerapp env create `
  --name cae-resto-bigboy `
  --resource-group $rgName `
  --location $location

# Daftarkan storage volume di ACA Env (Menggunakan parameter terbaru yang valid)
az containerapp env storage set `
  --name cae-resto-bigboy `
  --resource-group $rgName `
  --storage-name uploads-volume `
  --azure-file-account-name $storageAccountName `
  --azure-file-account-key $storageKey `
  --azure-file-share-name uploads-share `
  --access-mode ReadWrite

$envId = (az containerapp env show `
  --name cae-resto-bigboy `
  --resource-group $rgName `
  --query "id" `
  --output tsv)

Write-Host "Membuat placeholder container apps untuk reservasi FQDN..." -ForegroundColor Yellow
az containerapp create `
  --name ca-resto-bigboy-server `
  --resource-group $rgName `
  --environment cae-resto-bigboy `
  --image mcr.microsoft.com/azuredocs/aci-helloworld:latest `
  --target-port 4000 `
  --ingress external

az containerapp create `
  --name ca-resto-bigboy-client `
  --resource-group $rgName `
  --environment cae-resto-bigboy `
  --image mcr.microsoft.com/azuredocs/aci-helloworld:latest `
  --target-port 3000 `
  --ingress external

# Ambil FQDN domain yang tereservasi
$serverFqdn = (az containerapp show --name ca-resto-bigboy-server --resource-group $rgName --query "properties.configuration.ingress.fqdn" --output tsv)
$clientFqdn = (az containerapp show --name ca-resto-bigboy-client --resource-group $rgName --query "properties.configuration.ingress.fqdn" --output tsv)

Write-Host "Reserved Server FQDN: https://$serverFqdn" -ForegroundColor Green
Write-Host "Reserved Client FQDN: https://$clientFqdn" -ForegroundColor Green

# Assign Managed Identity agar Container Apps bisa menarik image dari ACR tanpa password
Write-Host "Mengonfigurasi Managed Identity untuk pull image dari ACR..." -ForegroundColor Yellow
$serverIdentity = (az containerapp identity assign --name ca-resto-bigboy-server --resource-group $rgName --system-assigned --query "principalId" --output tsv)
$clientIdentity = (az containerapp identity assign --name ca-resto-bigboy-client --resource-group $rgName --system-assigned --query "principalId" --output tsv)
$acrId = (az acr show --name $acrName --resource-group $rgName --query "id" --output tsv)

# Coba berikan role assignment (beri delay beberapa detik untuk propagasi identitas)
Start-Sleep -Seconds 10
az role assignment create --assignee $serverIdentity --role AcrPull --scope $acrId
az role assignment create --assignee $clientIdentity --role AcrPull --scope $acrId

# 9. Local Build & Push Menggunakan Docker Daemon Lokal (Solusi Pembatasan ACR Tasks)
Write-Host "`n[Langkah 8/9] Memulai login dan build Docker Image secara lokal..." -ForegroundColor Yellow
az acr login --name $acrName

Write-Host "Building & Pushing Backend Server..." -ForegroundColor Cyan
docker build -t "$acrName.azurecr.io/resto-bigboy-server:latest" ./server
docker push "$acrName.azurecr.io/resto-bigboy-server:latest"

Write-Host "Building & Pushing Frontend Client (dengan API Endpoint FQDN)..." -ForegroundColor Cyan
docker build -t "$acrName.azurecr.io/resto-bigboy-client:latest" `
  --build-arg NEXT_PUBLIC_API_ENDPOINT="https://$serverFqdn" `
  --build-arg NEXT_PUBLIC_URL="https://$clientFqdn" `
  --build-arg DOCKER_PUBLIC_API_ENDPOINT="https://$serverFqdn" `
  ./client
docker push "$acrName.azurecr.io/resto-bigboy-client:latest"

# 10. Jalankan Migrasi Database Prisma secara Lokal menggunakan Local Dependencies
Write-Host "`n[Langkah 9/9] Menjalankan Prisma Database Migration secara lokal ke cloud DB..." -ForegroundColor Yellow
$dbUrl = "postgresql://${postgresAdminUser}:${postgresAdminPassword}@${postgresServerName}.postgres.database.azure.com:5432/${postgresDbName}?sslmode=require"
$origDbUrl = $env:DATABASE_URL

try {
  $env:DATABASE_URL = $dbUrl
  Set-Location -Path "server"
  
  Write-Host "Menginstal local dependencies server untuk memastikan ketersediaan prisma CLI..."
  npm install
  
  Write-Host "Mengeksekusi prisma generate..."
  npm run prisma:generate
  
  Write-Host "Mengeksekusi prisma migrate deploy..."
  npm run migrate:deploy
}
finally {
  Set-Location -Path ".."
  if ($origDbUrl) {
    $env:DATABASE_URL = $origDbUrl
  } else {
    Remove-Item env:DATABASE_URL -ErrorAction SilentlyContinue
  }
}

# 11. Mengganti Konfigurasi dengan File YAML Final
Write-Host "`nMemperbarui Container Apps dengan konfigurasi final..." -ForegroundColor Yellow

# Replace server template
(Get-Content server-containerapp.yaml) `
  -replace "__MANAGED_ENV_ID__", $envId `
  -replace "__ACR_NAME__", $acrName `
  -replace "__DATABASE_URL__", $dbUrl `
  -replace "__ACCESS_TOKEN_SECRET__", $accessTokenSecret `
  -replace "__REFRESH_TOKEN_SECRET__", $refreshTokenSecret `
  -replace "__INITIAL_PASSWORD_OWNER__", $initialPasswordOwner `
  -replace "__SERVER_DOMAIN__", $serverFqdn `
  -replace "__CLIENT_DOMAIN__", $clientFqdn `
  | Set-Content temp-server.yaml

# Replace client template
(Get-Content client-containerapp.yaml) `
  -replace "__MANAGED_ENV_ID__", $envId `
  -replace "__ACR_NAME__", $acrName `
  | Set-Content temp-client.yaml

# Terapkan update
az containerapp update --name ca-resto-bigboy-server --resource-group $rgName --yaml temp-server.yaml
az containerapp update --name ca-resto-bigboy-client --resource-group $rgName --yaml temp-client.yaml

# Bersihkan file sementara
Remove-Item temp-server.yaml -Force
Remove-Item temp-client.yaml -Force

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  PROSES DEPLOYMENT SELESAI DENGAN SUKSES!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Berikut detail endpoint dan kredensial Anda:" -ForegroundColor Green
Write-Host "Frontend URL     : https://$clientFqdn"
Write-Host "Backend URL      : https://$serverFqdn"
Write-Host "PostgreSQL Host  : $postgresServerName.postgres.database.azure.com"
Write-Host "DB Admin User    : $postgresAdminUser"
Write-Host "DB Admin Pass    : $postgresAdminPassword"
Write-Host "Admin Email      : admin@order.com"
Write-Host "Admin Password   : $initialPasswordOwner"
Write-Host "Resource Group   : $rgName"
Write-Host "==========================================================" -ForegroundColor Green
