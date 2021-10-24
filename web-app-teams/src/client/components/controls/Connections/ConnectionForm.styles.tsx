import { useMemo } from "react";
import { mergeStyleSets } from "@fluentui/merge-styles";

export const useClasses = () => {
  return useMemo(
    () =>
      mergeStyleSets({
        dialogCustomField: {
          width: "700px !important"
        },
        apiKey: {
          display: "none !important"
        }
      }),
    []
  );
};
