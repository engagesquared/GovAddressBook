# Variables: START
variable "resourceGroup" {
  type = map
  default = {
    "name" = "{{company-name}}-{{environment}}-directory-rg"
    "location" = "australiaeast"
  }
}

variable "refreshAzureFunction" {
  type = map
  default = {
    "name" = "{{company-name}}-{{environment}}-directory-refresh"
    "storageAccountName" = "{{company-name}}-{{environment}}directoryrefres"
    "servicePlanName" = "{{company-name}}-{{environment}}-directory-refresh-service-plan"
    "appInsightsName" = "{{company-name}}-{{environment}}-directory-refresh-appinsights"
  }
}

variable "teamsAzureApp" {
  type = map
  default = {
    "name" = "{{company-name}}-{{environment}}-directory-teams"
    "servicePlanName" = "{{company-name}}-{{environment}}-directory-teams-service-plan"
    "appInsightsName" = "{{company-name}}-{{environment}}-directory-teams-appinsights"
  }
}

variable "externalAzureApp" {
  type = map
  default = {
    "name" = "{{company-name}}-{{environment}}-directory-external"
    "servicePlanName" = "{{company-name}}-{{environment}}-directory-external-service-plan"
    "appInsightsName" = "{{company-name}}-{{environment}}-directory-external-appinsights"
  }
}

variable "database" {
  type = map
  default = {
    "serverName" = "{{company-name}}-{{environment}}-directory-server",
    "databaseName" = "{{company-name}}-{{environment}}-directory-db",
    "adminName" = "{{db-user}}",
    "adminPassword" = "{{db-password}}"
  }
}

variable "keyVault" {
  type = map
  default = {
    "name" = "{{company-name}}-{{environment}}-directory-kv",
    "certificateName" = "{{company-name}}-{{environment}}-directorypem-certificate"
  }
}

variable "azSearch" {
  type = map
  default = {
    name = "{{company-name}}-{{environment}}-directory-srch"
  }
}

variable "env" {
  type = map
  default = {
    "regAppAuthUrl" = "https://login.microsoftonline.com",
    "regAppTenantId" = "{{reg-app-tenant-id}}",
    "regAppId" = "{{reg-app-id}}",
    "regAppScopes" = "User.Read,User.Read.All,Directory.Read.All",
    "regAppScopesDef" = ".default",
    "regAppIdUri" = "api://{{company-name}}-{{environment}}-directory-teams.azurewebsites.net/{{reg-app-id}}",

    "teamsPackageId" = "bbadf894-f86a-4941-ab9a-9ca047730ecf",
    "teamsPackageTitle" = "GovAddressBook",
    "teamsTabIdSearch" = "a3c8e653-77dd-46a7-b9fc-5e352655450d",
    "teamsTabIdMyProfile" = "839c5a75-6562-4a3b-89d0-781300ebd71f",
    "teamsTabIdFavourites" = "bea915d4-86f3-4e98-96b9-ba68c34f9850",
    "teamsTabIdPartnerConnections" = "d45cdc0c-4d19-435b-a8f0-76dbf912646b",
    "teamsTabIdApikeys" = "1572e3ec-09e1-4d96-8145-75395d497204",

    "graphApiUrl" = "https://graph.microsoft.com/v1.0",
    "manualMode" = "False",

    "port" = "8080",

    "selfExternalApiKey" = "2ab85335-f867-48e9-aa51-378c6d648c7f"
  }
}
# Variables: END

# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = ">= 2.26"
    }
  }
}

data "azurerm_client_config" "current" {}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = false
    }
  }
}


# keyVault : START
resource "azurerm_key_vault" "govaddressbook-key-vault" {
  name                        = var.keyVault["name"]
  location            = var.resourceGroup["location"]
  resource_group_name = var.resourceGroup["name"]
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false
  sku_name = "standard"
}

resource "azurerm_key_vault_access_policy" "externalAzureApp-access-policy" {
  key_vault_id = azurerm_key_vault.govaddressbook-key-vault.id
  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = azurerm_app_service.externalAzureApp-app.identity[0].principal_id
  
  certificate_permissions = [
    "Get","List"
  ]
  secret_permissions = [
    "Get"
  ]
}

resource "azurerm_key_vault_access_policy" "teamsAzureApp-access-policy" {
  key_vault_id = azurerm_key_vault.govaddressbook-key-vault.id
  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = azurerm_app_service.teamsAzureApp-app.identity[0].principal_id
  certificate_permissions = [
    "Get","List"
  ]

  secret_permissions = [
    "Get"
  ]
}

resource "azurerm_key_vault_access_policy" "refreshAzureFunction-access-policy" {
  key_vault_id = azurerm_key_vault.govaddressbook-key-vault.id
  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = azurerm_function_app.refreshAzureFunction-app.identity[0].principal_id
  
  certificate_permissions = [
    "Get","List"
  ]
  secret_permissions = [
    "Get"
  ]
}

resource "azurerm_key_vault_access_policy" "current-user-access-policy" {
  key_vault_id = azurerm_key_vault.govaddressbook-key-vault.id
  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = data.azurerm_client_config.current.object_id
  certificate_permissions = [
    "Get","List","Import", "Delete", "Purge", "Restore", "Create"
  ]

  secret_permissions = [
    "Get","List"
  ]

  key_permissions = [
    "Get","List"
  ]
}

resource "azurerm_key_vault_certificate" "govaddressbook-pem-certificate" {
  name         = var.keyVault["certificateName"]
  key_vault_id = azurerm_key_vault.govaddressbook-key-vault.id
  // added depends_on module to fix permission error
  depends_on   = [azurerm_key_vault_access_policy.current-user-access-policy]

  certificate_policy {
    issuer_parameters {
      name = "Self"
    }

    key_properties {
      exportable = true
      key_size   = 2048
      key_type   = "RSA"
      reuse_key  = true
    }

    lifetime_action {
      action {
        action_type = "AutoRenew"
      }

      trigger {
        lifetime_percentage = 80
      }
    }

    secret_properties {
      content_type = "application/x-pem-file"
    }

    x509_certificate_properties {
      # Server Authentication = 1.3.6.1.5.5.7.3.1
      # Client Authentication = 1.3.6.1.5.5.7.3.2
      extended_key_usage = ["1.3.6.1.5.5.7.3.1"]

      key_usage = [
        "cRLSign",
        "dataEncipherment",
        "digitalSignature",
        "keyAgreement",
        "keyCertSign",
        "keyEncipherment",
      ]

      subject            = "CN=govaddressbook-pem-certificate"
      validity_in_months = 12
    }
  }
}
# keyVault : END


# refreshAzureFunction : START
resource "azurerm_storage_account" "refreshAzureFunction-storage" {
  name                     = var.refreshAzureFunction["storageAccountName"]
  resource_group_name = var.resourceGroup["name"]
  location            = var.resourceGroup["location"]
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_app_service_plan" "refreshAzureFunction-service-plan" {
  name                = var.refreshAzureFunction["servicePlanName"]
  location            = var.resourceGroup["location"]
  resource_group_name = var.resourceGroup["name"]
  kind                = "FunctionApp"

  sku {
      tier = "Dynamic"
      size = "Y1"
    }
}

resource "azurerm_application_insights" "refreshAzureFunction-app-insights" {
  name                = var.refreshAzureFunction["appInsightsName"]
  location            = var.resourceGroup["location"]
  resource_group_name = var.resourceGroup["name"]
  application_type    = "web"
}

resource "azurerm_function_app" "refreshAzureFunction-app" {
  name                       = var.refreshAzureFunction["name"]
  location            = var.resourceGroup["location"]
  resource_group_name = var.resourceGroup["name"]
  app_service_plan_id        = azurerm_app_service_plan.refreshAzureFunction-service-plan.id
  identity {
    type = "SystemAssigned"
  }
  storage_account_name       = azurerm_storage_account.refreshAzureFunction-storage.name
  storage_account_access_key = azurerm_storage_account.refreshAzureFunction-storage.primary_access_key
  
  app_settings      = {
    "FUNCTIONS_WORKER_RUNTIME" = "node",

    "KEY_VAULT_URL" = "https://${var.keyVault["name"]}.vault.azure.net/",
    "KEY_VAULT_SECRET_NAME" = var.keyVault["certificateName"],

    "REG_APP_AUTHORITYHOSTURL" = var.env["regAppAuthUrl"],
    "REG_APP_TENANTID" = var.env["regAppTenantId"],
    "REG_APP_ID" = var.env["regAppId"],
    "REG_APP_SCOPES" = var.env["regAppScopesDef"],
    "REG_APP_CERT_THUMBPRINT" = azurerm_key_vault_certificate.govaddressbook-pem-certificate.thumbprint,

    "DATABASE_USER" = var.database["adminName"],
    "DATABASE_PASSWORD" = var.database["adminPassword"],
    "DATABASE_SERVER" = "${var.database["serverName"]}.database.windows.net",
    "DATABASE_NAME" = var.database["databaseName"],

    "AzureWebJobsStorage" = azurerm_storage_account.refreshAzureFunction-storage.primary_connection_string,

    "GRAPH_API_URL" = var.env["graphApiUrl"],
    
    "AZURE_SEARCH_URL" = "https://${var.azSearch["name"]}.search.windows.net",
    "AZURE_SEARCH_KEY" = azurerm_search_service.govaddressbook-srch.primary_key,

    "TEAMS_APP_ID" = var.env["teamsPackageId"],
    "TEAMS_APP_TITLE" = var.env["teamsPackageTitle"],
    "TEAMS_TAB_ID_MYPROFILE" = var.env["teamsTabIdMyProfile"],

    "WEBSITE_NODE_DEFAULT_VERSION" = "~14", 
    "FUNCTIONS_EXTENSION_VERSION":"~3",
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.refreshAzureFunction-app-insights.instrumentation_key
  }

  connection_string {
    name  = var.database["databaseName"]
    type  = "SQLServer"
    value = "Server=tcp:${azurerm_sql_server.govaddressbook-sql-server.fully_qualified_domain_name},1433;Initial Catalog=${azurerm_sql_database.govaddressbook-sql-database.name};Persist Security Info=False;User ID=${azurerm_sql_server.govaddressbook-sql-server.administrator_login};Password=${azurerm_sql_server.govaddressbook-sql-server.administrator_login_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
  version = "~3"
}
# refreshAzureFunction : END

# teamsAzureApp : START
resource "azurerm_app_service_plan" "teamsAzureApp-service-plan" {
  name                = var.teamsAzureApp["servicePlanName"]
  location            = var.resourceGroup["location"]
  resource_group_name = var.resourceGroup["name"]
  kind                = "linux"
  reserved            = true
  sku {
    tier = "Basic"
    size = "B1"
  }
}

resource "azurerm_application_insights" "teamsAzureApp-app-insights" {
  name                = var.teamsAzureApp["appInsightsName"]
  location            = var.resourceGroup["location"]
  resource_group_name = var.resourceGroup["name"]
  application_type    = "web"
}

resource "azurerm_app_service" "teamsAzureApp-app" {
  name                = var.teamsAzureApp["name"]
  location            = var.resourceGroup["location"]
  resource_group_name = var.resourceGroup["name"]
  app_service_plan_id        = azurerm_app_service_plan.teamsAzureApp-service-plan.id
  identity {
    type = "SystemAssigned"
  }

  site_config {
      linux_fx_version            = "NODE|14-lts" 
      min_tls_version             = "1.2"
      scm_type                    = "VSTSRM"
      use_32_bit_worker_process   = true 
      websockets_enabled          = false
  }

  app_settings      = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "6.9.1",

    "TEAMS_APP_ID" = var.env["teamsPackageId"],
    "TEAMS_TAB_ID_SEARCH" = var.env["teamsTabIdSearch"],
    "TEAMS_TAB_ID_MYPROFILE" = var.env["teamsTabIdMyProfile"],
    "TEAMS_TAB_ID_FAVOURITES" = var.env["teamsTabIdFavourites"],
    "TEAMS_TAB_ID_PARTNERCONNECTIONS" = var.env["teamsTabIdPartnerConnections"],
    "TEAMS_TAB_ID_APIKEYS" = var.env["teamsTabIdApikeys"],
    "TEAMS_APP_TITLE" = var.env["teamsPackageTitle"],
    "PORT" = var.env["port"],

    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.teamsAzureApp-app-insights.instrumentation_key,

    "KEY_VAULT_URL" = "https://${var.keyVault["name"]}.vault.azure.net/",
    "KEY_VAULT_SECRET_NAME" = var.keyVault["certificateName"],

    "REG_APP_AUTHORITYHOSTURL" = var.env["regAppAuthUrl"],
    "REG_APP_TENANTID" = var.env["regAppTenantId"],
    "REG_APP_ID" = var.env["regAppId"],
    "REG_APP_CERT_THUMBPRINT" = azurerm_key_vault_certificate.govaddressbook-pem-certificate.thumbprint,
    "REG_APP_SCOPES" = var.env["regAppScopes"],
    "REG_APP_ID_URI" = var.env["regAppIdUri"],

    "DATABASE_USER" = var.database["adminName"],
    "DATABASE_PASSWORD" = var.database["adminPassword"],
    "DATABASE_SERVER" = "${var.database["serverName"]}.database.windows.net",
    "DATABASE_NAME" = var.database["databaseName"],

    "GRAPH_API_URL" = var.env["graphApiUrl"],

    "AZURE_SEARCH_URL" = "https://${var.azSearch["name"]}.search.windows.net"
    "AZURE_SEARCH_KEY" = azurerm_search_service.govaddressbook-srch.primary_key,

    "MANUAL_MODE" = var.env["manualMode"],

    "SELF_EXTERNAL_API_URL" = "https://${var.externalAzureApp["name"]}.azurewebsites.net",
    "SELF_EXTERNAL_API_KEY" = var.env["selfExternalApiKey"]
  }
}
# teamsAzureApp : END

# externalAzureApp : START
resource "azurerm_app_service_plan" "externalAzureApp-service-plan" {
  name                = var.externalAzureApp["servicePlanName"]
  location            = var.resourceGroup["location"]
  resource_group_name = var.resourceGroup["name"]
  kind                = "linux"
  reserved            = true
  sku {
      tier = "Basic"
      size = "B1"
  }
}

resource "azurerm_application_insights" "externalAzureApp-app-insights" {
  name                = var.externalAzureApp["appInsightsName"]
  location            = var.resourceGroup["location"]
  resource_group_name = var.resourceGroup["name"]
  application_type    = "web"
}

resource "azurerm_app_service" "externalAzureApp-app" {
  name                = var.externalAzureApp["name"]
  location            = var.resourceGroup["location"]
  resource_group_name = var.resourceGroup["name"]
  app_service_plan_id = azurerm_app_service_plan.externalAzureApp-service-plan.id
  identity {
    type = "SystemAssigned"
  }
  
  site_config {
      linux_fx_version            = "NODE|14-lts" 
      min_tls_version             = "1.2"
      scm_type                    = "VSTSRM"
      use_32_bit_worker_process   = true 
      websockets_enabled          = false  
  }

  app_settings      = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "6.9.1", 
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.externalAzureApp-app-insights.instrumentation_key,

    "KEY_VAULT_URL" = "https://${var.keyVault["name"]}.vault.azure.net/",
    "KEY_VAULT_SECRET_NAME" = var.keyVault["certificateName"],

    "REG_APP_AUTHORITYHOSTURL" = var.env["regAppAuthUrl"],
    "REG_APP_TENANTID" = var.env["regAppTenantId"],
    "REG_APP_ID" = var.env["regAppId"],
    "REG_APP_SCOPES" = var.env["regAppScopesDef"],
    "REG_APP_CERT_THUMBPRINT" = azurerm_key_vault_certificate.govaddressbook-pem-certificate.thumbprint,

    "DATABASE_USER" = var.database["adminName"],
    "DATABASE_PASSWORD" = var.database["adminPassword"],
    "DATABASE_SERVER" = "${var.database["serverName"]}.database.windows.net",
    "DATABASE_NAME" = var.database["databaseName"],

    "GRAPH_API_URL" = var.env["graphApiUrl"],

    "AZURE_SEARCH_URL" = "https://${var.azSearch["name"]}.search.windows.net"
    "AZURE_SEARCH_KEY" = azurerm_search_service.govaddressbook-srch.primary_key,

    "PORT" = var.env["port"],

    "SELF_EXTERNAL_API_KEY" = var.env["selfExternalApiKey"]
  }
}
# externalAzureApp : END


# database: START
resource "azurerm_sql_server" "govaddressbook-sql-server" {
  name                         = var.database["serverName"]
  resource_group_name          = var.resourceGroup["name"]
  location                     = var.resourceGroup["location"]
  version                      = "12.0"
  administrator_login          = var.database["adminName"]
  administrator_login_password = var.database["adminPassword"]
}

# resource "azurerm_sql_firewall_rule" "allow_access_for_azure_services_and_resources" {
#   name                = "allow_access_for_azure_services_and_resources"
#   resource_group_name = var.resourceGroup["name"]
#   server_name         = var.database["serverName"]
#   start_ip_address    = "0.0.0.0"
#   end_ip_address      = "0.0.0.0"
# }

resource "azurerm_sql_database" "govaddressbook-sql-database" {
  name                = var.database["databaseName"]
  resource_group_name = var.resourceGroup["name"]
  location            = var.resourceGroup["location"]
  server_name         = azurerm_sql_server.govaddressbook-sql-server.name
}
# database: END

# azSearch: START
resource "azurerm_search_service" "govaddressbook-srch" {
  name                = var.azSearch["name"]
  resource_group_name = var.resourceGroup["name"]
  location            = var.resourceGroup["location"]
  sku                 = "basic"
  public_network_access_enabled = false
}
# azSearch: END
