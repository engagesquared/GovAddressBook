import { useMemo } from "react";
import { mergeStyleSets } from "@fluentui/merge-styles";

export const useClasses = () => {
  return useMemo(
    () =>
      mergeStyleSets({
        dialogUserDetails: {
          width: "700px !important"
        },
        dialogUserDetailsMobile: {
          width: "100% !important"
        },
      }),
    []
  );
};
