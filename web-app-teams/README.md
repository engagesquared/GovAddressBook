## Introduction

This is the main entry point for users to interact with the solution. The app service will contain the web app functionality described in the solution user stories to perform below actions: 
1. Show user profile for logged-in user 
2. Allow logged-in user to add/edit his/her user profile with/without custom fields 
3. Allow logged-in user to search/filter for users in current tenant (Internal Index Search Service) 
4. Allow logged-in user to search/filter for users in other partners/tenants (External API) 
5. Allow logged-in user to see full user profile of any user found in search. 
6. Allow logged-in user to email, voice/video call, chat & meet with other users (External users must be enabled for teams features to work) 
7. Allow logged-in user to add/edit internal/external favourites. (Note: external user details will be retrieved from other tenants once, they won’t be updated if changed in other tenants) 
8. Save recent search results in user localstorage to display when user open search page 
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

2. Install gulp
``` bash
npm i -g gulp-cli
```

For development:
- Configure environment file `.env`, use `example.env` as template.

## Build the app
``` bash
gulp build
```
## Create Teams package
``` bash
gulp manifest
```
package will be created in 'package' folder.
make sure, that tokens which used in `manifest.json` file are set in `.env` file:
- TEAMS_APP_ID
- TEAMS_PACKAGE_NAME
- PUBLIC_HOSTNAME
- TEAMS_APP_TITLE
- TEAMS_TAB_ID_SEARCH
- TEAMS_TAB_ID_MYPROFILE
- TEAMS_TAB_ID_FAVOURITES
- TEAMS_TAB_ID_PARTNERCONNECTIONS
- TEAMS_TAB_ID_APIKEYS
- REG_APP_ID
- REG_APP_ID_URI

`or you can fill them manually after package would be created`

## Deploying the manifest

Using the `yoteams-deploy` plugin, automatically added to the project, deployment of the manifest to the Teams App store can be done manually using `gulp tenant:deploy` or by passing the `--publish` flag to any of the `serve` tasks.


## Debug and test locally
To debug and test the solution locally you use the `serve` Gulp task. This will first build the app and then start a local web server on port 3007, where you can test your Tabs, Bots or other extensions. Also this command will rebuild the App if you change any file in the `/src` directory.

``` bash
gulp serve
```

To debug the code you can append the argument `debug` to the `serve` command as follows. This allows you to step through your code using your preferred code editor.

``` bash
gulp serve --debug
```

You can use particular `.env` file with commands *gulp manifest*, *gulp serve*:
- for exaple if you have `dev.env` file, you can run *gulp serve --debug --env dev.env*.

## Prepare web app for deployment
1. Install npm packages for `web-app-teams` and `common` projects
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
2. using zip from `Prepare web app for deployment` step, run below command to deploy **web-app-teams**
   ```cmd
   az webapp deployment source config-zip -g {{company-name}}-{{environment}}-directory-rg -n {{company-name}}-{{environment}}-directory-teams --src <replace by full local path of .zip package>
   ```
---

**[Back to root README.md](../README.md)**
---