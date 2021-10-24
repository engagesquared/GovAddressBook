# Introduction

Azure functions App with several schedule triggered functions to perform below actions: 
1. Calling the Graph API to update user information in SQL tables and Search (funcUserInfoSync)
2. Calling the Graph API to update out-of-office status in SQL tables and Search (funcUpdateUserOOF)
3. Calling the Graph API to remove disabled/deleted users from SQL tables and Search (funcDeleteUser)
4. Calling the Graph API to send activity notification in Teams for not published profiles (funcCompleteUserProfileNotification)
5. Calling the Graph API to make full migration from AAD to DB and Search, created for dev purposes (funcUserInfoFullMigration)
---

# Build & Deployment
## Environment
node v12.22.5
npm  v6.14.14

## Pre build/run actions
1. Install npm packages:
``` bash
npm i
```
(do same for `common` project)

For development:
- Configure environment file `local.settings.json`, use `example.settings.json` as template.
- Use http trigger instead of scheduled (`copy config from http_function.json and paste it in function.json`)

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

## Prepare func app for deployment
1. Install npm packages for `web-app-refresh` and `common` projects
2. Build the app
3. Run prune

``` bash
npm prune --production
```
4. Archive files and folders:
`dist`,
`node_modules`,
`funcCompleteUserProfileNotification`,
`funcDeleteUser`,
`funcUpdateUserOOF`,
`funcUserInfoFullMigration`,
`funcUserInfoSync`,
`proxies.json`,
`host.json`,
`package.json`
## Deployment
1. run below command to login to target azure portal
   ```cmd
   az login --tenant <your tenant id>
   ```
2. using zip from `Prepare func app for deployment` step, run below command to deploy **func-app-refresh**
   ```cmd
   az functionapp deployment source config-zip -g {{company-name}}-{{environment}}-directory-rg -n {{company-name}}-{{environment}}-directory-refresh --src <replace by full local path of .zip package>
   ```
---

**[Back to root README.md](../README.md)**
---