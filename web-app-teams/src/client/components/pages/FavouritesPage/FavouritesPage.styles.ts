import { useMemo } from "react";
import { mergeStyleSets } from "@fluentui/merge-styles";

export const useClasses = () => {
    return useMemo(
        () =>
            mergeStyleSets({
                favouritesContainer: {
                    width: "650px",
                },
                favouritesContainerMobile: {
                    width: "100%",
                },
                searchContainer: {
                    width: "350px"
                },
                searchContainerMobile: {
                    width: "100%",
                },
            }),
        []
    );
};
