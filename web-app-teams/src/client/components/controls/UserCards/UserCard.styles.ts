import { useMemo } from "react";
import { mergeStyleSets } from "@fluentui/merge-styles";
import { useContextGetters } from "../../../state";

export const useClasses = () => {
    const { getTeamsTheme } = useContextGetters();
    const theme = getTeamsTheme();

    return useMemo(
        () =>
            mergeStyleSets({
                userCardContainer: {
                    "&.ui-card": {
                        width: "auto",
                        background: "#FFFFFF",
                        borderRadius: "4px",
                        padding: "0px",
                        minWidth: "320px",
                        boxShadow: "0px 0.3px 0.9px rgb(0 0 0 / 10%), 0px 1.6px 3.6px rgb(0 0 0 / 14%)",
                        color: "#000000"
                    },
                    "&.ui-card:hover div div button": {
                        visibility: "visible",
                    },
                },
                userCardContainerMobile: {
                    "&.ui-card": {
                        width: "100%",
                        minWidth: "320px",
                        background: "#FFFFFF",
                        borderRadius: "4px",
                        padding: "0px",
                        boxShadow: "0px 0.3px 0.9px rgb(0 0 0 / 10%), 0px 1.6px 3.6px rgb(0 0 0 / 14%)",
                        color: "#000000"
                    },
                    "&.ui-card div div button": {
                        visibility: "visible",
                    },
                },
                contentContainer: {
                    "&.ui-flex": {
                        padding: "16px",
                        minHeight: "64px",
                        minWidth: "256px",
                        cursor: "pointer"
                    },
                },
                cardText: {
                        whiteSpace: "nowrap",
                        width: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: "#000000"
                       
                },
                buttonIconOutlineOnHover: {
                    color : theme.default.foregroundDisabled,
                    minHeight: "100%",
                    minWidth: "64px !important",
                    cursor: "pointer",
                    visibility: "hidden",
                    "&.ui-button .ui-icon__filled": {
                        display: "block"
                    },
                    "&.ui-button .ui-icon__outline": {
                        display: "none"
                    },
                    "&.ui-button:hover .ui-icon__filled": {
                        display: "block"
                    },
                    "&.ui-button:hover .ui-icon__outline": {
                        display: "none"
                    },
                },
                buttonIconOutlineOnHoverIsFavourite: {
                    color : theme.brand.foreground + "!important",
                    minHeight: "100%",
                    minWidth: "64px !important",
                    cursor: "pointer",
                    "&.ui-button .ui-icon__filled": {
                        display: "block"
                    },
                    "&.ui-button .ui-icon__outline": {
                        display: "none"
                    },
                    "&.ui-button:hover .ui-icon__filled": {
                        display: "block"
                    },
                    "&.ui-button:hover .ui-icon__outline": {
                        display: "none"
                    },
                }

            }),
        [theme]
    );
};
