// Default entry point for client scripts
// Automatically generated
// Please avoid from modifying to much...
import * as ReactDOM from "react-dom";
import * as React from "react";
import * as microsoftTeams from "@microsoft/teams-js";

export const render = (type: any, element: HTMLElement) => {
    microsoftTeams.initialize(() => {
        ReactDOM.render(React.createElement(type, {}), element);
        microsoftTeams.appInitialization.notifySuccess();
    });
};
// Automatically added for the tab
export * from "./tab/Tab";