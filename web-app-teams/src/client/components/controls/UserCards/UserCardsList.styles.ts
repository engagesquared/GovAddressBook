import { useMemo } from "react";
import { mergeStyleSets } from "@fluentui/merge-styles";

export const useClasses = () => {
    return useMemo(
        () =>
            mergeStyleSets({
                gridCardsContainer: {
                    "&.ui-grid": {
                        gridGap: "10px"
                    }
                },
                userCardsContainer: {
                    maxWidth: "650px"
                }
            }),
        []
    );
};
