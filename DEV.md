# Introduction 
Teams will provide GovAddressBook staff with a central point to search, find and discover other employees their organisation is connected to, to better foster collaboration and efficiency. Users will be able to search using limited contact information they may have – such as a phone number – and then narrow their results, filtering by properties such as department or role.

Each organisation will host their own instance of the solution and integrate with partner government agencies to allow discoverability of their respective users. Key user profile data will stay current and up-to-date by synchronising select fields (Role, Organisation Name, Department, Email address, Mobile Number, Desk Number) with each hosting organisation’s Azure Active Directory instance. Users can manually update certain fields (Name, Preferred Pronoun, Location) and also extend their profile with custom fields.

---

# Initial Azure Resources Deployment (using *Azure Account*)

## Create Azure Resources
1. Edit the appropriate environment's **main.tf** file in **azureResources** and make sure all values are set properly
2. Make sure the resource group is available in Azure is set correctly
3. Install the Azure CLI and Terraform CLI:
   - Windows Subsystem for Linux (WSL) or OSX, using Brew, in terminal:
   ```bash
   brew update && brew install azure-cli && brew install hashicorp/tap/terraform
   ```
   - Windows
      - [Install or Update Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows?tabs=azure-powershell)
      - [Install Terraform](https://www.terraform.io/downloads.html)
4. In terminal: navigate to **azure-resources** folder
5. In terminal: run below command to login to Azure of target environment (dev/test/uat/prod)
   ```bash
   az login --tenant <tenant-id>
   ```
6. In terminal: cd to the target environment (dev/test/uat/prod) folder & run below command to review all changes:
    ```bash
    terraform init
    ```
7. In terminal: cd to the target environment (dev/test/uat/prod) folder & run below command to apply all changes:
    ```bash
    terraform plan
    ```
8. In terminal: cd to the target environment (dev/test/uat/prod) folder & run below command to apply all changes:
    ```bash
    terraform apply
    ```

## Post Creation Manual Steps
1. Navigate to key vault
2. Go to Certificates
3. Download .CER file of certificate *{{company-name}}-{{environment}}-directorypem-certificate*
4. create new registered application *{{company-name}}-{{environment}}-directory-app*
5. set Authentication
6. set expose an API
7. set API permissions
8. upload .CER certificate file downloaded from key-vault
9. update `func-app-refresh`, `web-app-external`, `web-app-teams` configuration tokens:
- REG_APP_TENANTID - registration app directory (tenant id)
- REG_APP_ID - registration app id
- REG_APP_CERT_THUMBPRINT - registration app certificate thumbprint
- REG_APP_ID_URI - uri from step `set expose an API`
10. turn on rule `Allow Azure services and resources to access this server` in `Firewalls and virtual networks` on SQL Server

## Create Database Schema
1. Open script file `dbTables.sql` under *db-scripts* folder
2. Run script
---

## Build, Debug & Deployment
See:
- **[func-app-refresh documentation](func-app-refresh/README.md)**
- **[web-app-external documentation](web-app-external/README.md)**
- **[web-app-teams documentation](web-app-teams/README.md)**
---

# Usefull Links
- [Terraform on Azure documentation](https://docs.microsoft.com/en-us/azure/developer/terraform/)