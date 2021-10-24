import { useMemo } from "react";
import { mergeStyleSets } from "@fluentui/merge-styles";
import { useContextGetters } from "../../../state";

export const useClasses = () => {
    const { getTeamsTheme } = useContextGetters();
    const theme = getTeamsTheme();

    return useMemo(
        () =>
            mergeStyleSets({
                buttonBack: {
                    "&.ui-button": {
                        maxWidth: "60px"
                    }
                },
                buttonAdminControl: {
                    marginLeft: "auto"
                },
                buttonEditUserDetails: {
                    "&.ui-button": {
                        maxWidth: "60px"
                    }
                },
                buttonAction: {
                    "&.ui-button": {
                        minWidth: "60px",
                        padding: "10px"
                    }
                },
                splitButtonCall: {
                    marginLeft: "auto",
                    "&.ui-splitbutton .ui-menubutton .ui-button": {
                        backgroundColor: theme.green.background,
                    },
                    "&.ui-splitbutton .ui-menubutton .ui-button:hover": {
                        backgroundColor: theme.green.foreground,
                    },
                    "&.ui-splitbutton .ui-menubutton .ui-button:active": {
                        backgroundColor: theme.green.foreground,
                    },
                    "&.ui-splitbutton .ui-splitbutton__toggle": {
                        backgroundColor: theme.green.background,
                    },
                    "&.ui-splitbutton .ui-splitbutton__toggle:hover": {
                        backgroundColor: theme.green.foreground,
                    },
                    "&.ui-splitbutton .ui-splitbutton__toggle:active": {
                        backgroundColor: theme.green.foreground,
                    }
                },
                desktopButtonCall: {
                    marginLeft: "auto",
                    "&.ui-button": {
                        backgroundColor: theme.green.background,
                    },
                    "&.ui-button:hover": {
                        backgroundColor: theme.green.foreground,
                    },
                    "&.ui-button:active": {
                        backgroundColor: theme.green.foreground,
                    }
                },
                buttonAddNewInfo: {
                    "&.ui-button": {
                        maxWidth: "200px"
                    }
                },
                buttonShareProfile: {
                    "&.ui-button": {
                        maxWidth: "140px",

                    }
                },
                buttonEditAndRemoveCustomField: {
                    "&.ui-button": {
                        padding: "0",
                        minWidth: "30px",
                        maxWidth: "60px"
                    }
                },
                textPronouns: {
                    marginLeft: "5px"
                },
                bodyContainer: {
                    marginLeft: "126px"
                },
                bodyContainerMobile: {
                    marginLeft: "16px"
                },
                actionContainer: {
                    margin: "0px auto"
                },
                actionContainerMobile: {
                    justifyContent: "space-between"
                },
                nameAndPronounContiner: {
                    marginBottom: "0px !important"
                },
                customFieldDisplayName: {
                    maxWidth: "500px"
                },
                customFieldValue: {
                    maxWidth: "500px"
                },
                customText: {
                    color: "#afafaf"
                },
                lockIcon: {
                    marginLeft: "-25px",
                    marginRight: "10px !important"
                },
                editAndDeleteContainer: {
                    marginLeft: "auto"
                },
                presenceIcon: {
                    color: "#B4009E",
                    position: "absolute",
                    left: "0px",
                    bottom: "0px"
                },
                avatarContainer: {
                    position: "relative",
                    height: "fit-content"
                }
            }),
        []
    );
};
