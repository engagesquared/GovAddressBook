import { useMemo } from "react";
import { mergeStyleSets } from "@fluentui/merge-styles";
import { useContextGetters } from "../../../state";

export const useClasses = () => {
    const { getTeamsTheme } = useContextGetters();
    const theme = getTeamsTheme();

    return useMemo(
        () =>
            mergeStyleSets({
                commonContainer: {
                    padding: "16px",
                    margin: "0px auto",
                    maxWidth: "1100px",
                    minHeight: "800px",
                    selectors: {
                        ":global(body)": {
                            backgroundColor: theme.default.background
                        }
                    }
                },
                commonContainerMobile: {
                    padding: "16px",
                    selectors: {
                        ":global(body)": {
                            backgroundColor: theme.default.background
                        }
                    }
                },
            }),
        []
    );
};
