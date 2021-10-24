import * as React from "react";
import { Checkbox, Dialog, Flex, Input, Text } from "@fluentui/react-northstar";
import { IDBCustomField, IException } from "../../../../../../common";
import { useClasses } from "./CustomFieldForm.styles";
import { IFormProps } from "../Common/IFormProps";

export interface ICustomFieldFormProps extends IFormProps {
  onSubmit: (customField: IDBCustomField) => Promise<void>;
  isDeleteDialog: boolean;
  customField?: IDBCustomField;
  isMobile: boolean;
}

export const CustomFieldForm = (props: ICustomFieldFormProps) => {
  const classes = useClasses();
  const [customFieldData, setCustomFieldData] = React.useState<IDBCustomField | undefined>();
  const [exception, setException] = React.useState<IException | undefined>();

  React.useEffect(() => {
    if (props.customField) {
      setCustomFieldData(props.customField);
    }
  }, [props.customField]);

  const onConfirm = async () => {
    try {
      if (customFieldData) {
        setException(undefined);
        await props.onSubmit({
          ...customFieldData,
          Visibility: customFieldData.Visibility || false,
        });
        props.onCancel();
      }
    } catch (ex) {
      setException(ex);
    }
  };

  return (
    <Dialog
      open={true}
      backdrop={true}
      onConfirm={onConfirm}
      onCancel={props.onCancel}
      header={props.formTitle}
      className={props.isMobile ? classes.dialogCustomFieldMobile : classes.dialogCustomField}
      cancelButton={{
        content: "Cancel",
        disabled: props.inProgress,
      }}
      confirmButton={{
        content: props.confirmLabel,
        disabled: props.inProgress,
      }}
      content={
        <>
          {props.isDeleteDialog ? (
            <Text>Are you sure you want to remove this custom field?</Text>
          ) : (
            <Flex column gap="gap.medium">
              <Flex gap="gap.small">
                <Input
                  disabled={props.inProgress}
                  fluid
                  label={"Custom Field Name"}
                  placeholder={"e.g.: Out of Office"}
                  value={customFieldData?.DisplayName}
                  onChange={(ev, newValue) => {
                    setCustomFieldData({
                      ...(customFieldData as IDBCustomField),
                      DisplayName: newValue ? newValue.value : "",
                    });
                  }}
                />
                <Checkbox
                  disabled={props.inProgress}
                  label="Show to external users"
                  labelPosition="start"
                  toggle
                  className={props.isMobile ? classes.checkBoxShowToExternalUsersMobile : classes.checkBoxShowToExternalUsers}
                  checked={customFieldData?.Visibility}
                  onChange={(ev, data) => {
                    setCustomFieldData({
                      ...(customFieldData as IDBCustomField),
                      Visibility: data?.checked || false,
                    });
                  }}
                />
              </Flex>
              <Input
                disabled={props.inProgress}
                fluid
                label={"Custom Field Contents"}
                placeholder={"e.g.: Please contact John Doe in my absence!"}
                value={customFieldData?.Value}
                onChange={(ev, newValue) => {
                  setCustomFieldData({
                    ...(customFieldData as IDBCustomField),
                    Value: newValue ? newValue.value : "",
                  });
                }}
              />
            </Flex>
          )}
          {exception && <Text error>{exception.message}</Text>}
        </>
      }
    />
  );
};
