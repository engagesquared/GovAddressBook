import { useMemo } from "react";
import { mergeStyleSets } from "@fluentui/merge-styles";
import { useContextGetters } from "../../../state";

export const useClasses = () => {
    const { getTeamsTheme } = useContextGetters();
    const theme = getTeamsTheme();
    return useMemo(
        () =>
            mergeStyleSets({
                buttonEditUserDetails: {
                    "&.ui-button": {
                        maxWidth: "140px",
                        marginLeft: "-12px",
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
                        marginLeft: "-18px",
                    }
                },
                buttonEditAndRemoveCustomField: {
                    "&.ui-button": {
                        padding: "0",
                        minWidth: "30px",
                        maxWidth: "60px",
                        height: "20px",
                    }
                },
                bodyContainer: {
                    marginLeft: "126px"
                },
                bodyContainerMobile: {
                    marginLeft: "16px"
                },
                textPronouns: {
                    marginLeft: "5px",
                    color: theme.default.foregroundDisabled
                },
                nameAndPronounContiner: {
                    marginBottom: "0px !important"
                },
                editAndDeleteContainer: {
                    marginLeft: "auto"
                },
                customFieldDisplayName: {
                    maxWidth: "500px"
                },
                customFieldValue: {
                    maxWidth: "500px"
                },
                customText: {
                    color: theme.default.foregroundDisabled
                },
                lockIcon: {
                    marginLeft: "-25px",
                    marginRight: "10px !important"
                },
                welcomeText: {
                    width: "100%"
                }
            }),
        [theme]
    );
};
