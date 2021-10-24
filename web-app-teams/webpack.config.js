// Copyright (c) Wictor Wilén. All rights reserved. 
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");

const path = require("path");
const fs = require("fs");
const argv = require("yargs").argv;

const debug = argv.debug !== undefined;
const lint = !(argv["no-linting"] || argv.l === true);

const config = [{
    entry: {
        server: [
            path.join(__dirname, "/src/server/server.ts")
        ]
    },
    mode: debug ? "development" : "production",
    output: {
        path: path.join(__dirname, "/dist"),
        filename: "[name].js",
        devtoolModuleFilenameTemplate: debug ? "[absolute-resource-path]" : "[]"
    },
    externals: [nodeExternals()],
    devtool: debug ? "source-map" : "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {}
    },
    target: "node",
    node: {
        __dirname: false,
        __filename: false
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: ["ts-loader"]
        }]
    },
    plugins: []
},
{
    entry: {
        client: [
            path.join(__dirname, "/src/client/client.ts")
        ]
    },
    mode: debug ? "development" : "production",
    output: {
        path: path.join(__dirname, "/dist/web/scripts"),
        filename: "[name].js",
        libraryTarget: "umd",
        library: "GovAddressBook",
        publicPath: "/scripts/"
    },
    externals: {},
    devtool: debug ? "source-map" : "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js"],
        alias: {}
    },
    target: "web",
    module: {
        rules: [{
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: ["ts-loader"]
        }]
    },
    // plugins: [
    //     new webpack.EnvironmentPlugin({ 
    //         APPLICATION_ID: null,
    //         AUTH_APP_URI: null,
    //         STATIC_TAB_ID_SEARCH: null,
    //         STATIC_TAB_ID_MYPROFILE: null,
    //         STATIC_TAB_ID_FAVOURITES: null,
    //         STATIC_TAB_ID_PARTNERCONNECTIONS: null,
    //         STATIC_TAB_ID_APIKEYS: null,
    //         MANUAL_MODE: null
    //     })
    // ]
}
];

module.exports = config;
