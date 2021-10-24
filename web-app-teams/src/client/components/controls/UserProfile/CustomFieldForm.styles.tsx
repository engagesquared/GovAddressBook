import { useMemo } from "react";
import { mergeStyleSets } from "@fluentui/merge-styles";

export const useClasses = () => {
  return useMemo(
    () =>
      mergeStyleSets({
        dialogCustomField: {
          width: "700px !important"
        },
        dialogCustomFieldMobile: {
          width: "100% !important"
        },
        checkBoxShowToExternalUsers: {
          display: "block !important",
          width: "200px",
          marginTop: "-5px",
          "& .ui-checkbox__label": {
            marginBottom: "5px",
          }
        },
        checkBoxShowToExternalUsersMobile: {
          display: "block !important",
          width: "140px",
          marginTop: "-5px",
          "& .ui-checkbox__label": {
            marginBottom: "5px",
          }
        },
      }),
    []
  );
};
