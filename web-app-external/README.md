# Introduction

An External Web App which will be used by other organisations to connect to current tenant’s directory in order to search its user database.  

To connect to another organisation, admins will need an API Key from that organisation, as well as their IP Address/API Endpoint URL. Admins can generate API keys and white label IP addresses (using firewall rules), as well as administer their connections to other Hosts using the Admin UI. 

This App Service will perform actions: 
1. Search users in current tenant for other partners/tenant to read (External Index Search Service) 
2. Get user profile for users in other partners/tenants 

# Build & Deployment
## Environment
node v12.22.5
npm  v6.14.14

## Pre build/run actions
1. Install npm packages:
``` bash
npm i
```
For development:
- Configure environment file `.env`, use `example.env` as template.

## Build the app
``` bash
npm run build
```

## Run locally (dev purposes)
``` bash
npm run start
```

## Run locally with debug (dev purposes)
``` bash
npm run watch
npm run debug
```
`use two console windows for that`

## Prepare web app for deployment
1. Install npm packages for `web-app-external` and `common` projects
2. Build the app
3. Run prune

``` bash
npm prune --production
```
4. Archive `dist`, `node_modules`, `package.json` as zip

## Deployment
1. run below command to login to target azure portal
   ```cmd
   az login --tenant <your tenant id>
   ```
2. using zip from `Prepare web app for deployment` step, run below command to deploy **web-app-external**
   ```cmd
   az webapp deployment source config-zip -g {{company-name}}-{{environment}}-directory-rg -n {{company-name}}-{{environment}}-directory-external --src <replace by full local path of .zip package>
   ```
---

**[Back to root README.md](../README.md)**
---