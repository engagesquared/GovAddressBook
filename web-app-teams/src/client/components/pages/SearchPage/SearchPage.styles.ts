import { useMemo } from "react";
import { mergeStyleSets } from "@fluentui/merge-styles";
import { useContextGetters } from "../../../state";

export const useClasses = () => {
    const { getTeamsTheme } = useContextGetters();
    const theme = getTeamsTheme();

    return useMemo(
        () =>
            mergeStyleSets({
                searchContainerMobile: {
                    width: "100%",
                    marginBottom: "20px",
                },
                leftColumn: {
                    minWidth: "650px",
                    marginBottom: "20px",
                },
                rightColumn: {
                    minWidth: "400px",
                    marginBottom: "20px",
                },
                searchBoxContainer: {
                    width: "100%",
                    position: "relative",
                    marginRight: "10px",
                    fontSize: "16px"
                },
                historySearchContainer: {
                    selectors: {
                        "&.ui-list": {
                            borderRadius: "5px",
                            border: "1px solid #ebebeb",
                            boxShadow: "0px 0.3px 0.9px rgb(0 0 0 / 10%), 0px 1.6px 3.6px rgb(0 0 0 / 14%)"
                        },
                        ".ui-list__item": {
                            borderBottom: "1px solid #ebebeb"
                        },
                        ".ui-list__item:last-child": {
                            borderBottom: "0"
                        }
                    }
                },
                searchBar: {
                    paddingRight: "10px",
                    display: "inline !important",
                },
                resultCount: {
                    marginLeft: "auto",
                },
                profileContainer: {
                    marginLeft: "auto",
                },
                profileItem: {
                    marginLeft: "auto",
                    marginBottom: "2px !important",
                    textAlign: "end",
                },
                profileAvatar: {
                    marginLeft: "5px"
                },
                filterContainer: {
                    backgroundColor: theme.default.background1,
                    borderRadius: "10px",
                    padding: "10px"
                },
                filterTitle: {
                    marginTop: "10px",
                },
                filterButton: {
                    marginTop: "10px",
                    maxWidth: "130px !important"
                },
                popupRefinerContainer: {
                    width: "100%"
                },
                buttonPagination: {
                    margin: "20px auto",
                    width: "250px"
                }
            }),
        [theme]
    );
};
