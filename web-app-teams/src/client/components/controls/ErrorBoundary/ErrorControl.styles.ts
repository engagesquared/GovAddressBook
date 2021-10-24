import { useMemo } from "react";
import { mergeStyleSets } from "@fluentui/merge-styles";

export const useClasses = () => {
    return useMemo(
        () =>
            mergeStyleSets({
                errorControlContainer: {
                    position: "fixed",
                    top: "45px",
                    right: "0",
                    zIndex: 9999
                },
                hide: {
                    display: "none"
                },
                errorCardContainer: {
                    "&.ui-card": {
                        background: "#f55d6f !important",
                        borderRadius: "4px",
                        boxShadow: "0px 0.3px 0.9px rgb(0 0 0 / 10%), 0px 1.6px 3.6px rgb(0 0 0 / 14%) !important",
                        marginBottom: "15px"
                    }
                }
            }),
        []
    );
};
