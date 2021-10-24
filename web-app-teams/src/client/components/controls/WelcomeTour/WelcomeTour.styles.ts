import { useMemo } from "react";
import { mergeStyleSets } from "@fluentui/merge-styles";

export const useClasses = () => {
    return useMemo(
        () =>
            mergeStyleSets({
                carousel: {
                    "> div": {
                        width: "100%"
                    }
                },
                commonContainer: {
                    margin: "10px 40px",
                    width: "calc(100% - 80px)",
                },
                commonContainerMobile: {
                    padding: "20px",
                },
                divider: {
                    width: "calc(100% - 80px)",
                    margin: "auto"
                },
                navButtons: {
                    width: "40px",
                    margin: "5px"
                },
                carouselItem: {
                    width: "100%",
                    maxWidth: "926px"
                },
                carouselImage: {
                    height: "294px",
                    width: "35vw",
                    backgroundPosition: "center",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat"
                }
            }),
        []
    );
};
