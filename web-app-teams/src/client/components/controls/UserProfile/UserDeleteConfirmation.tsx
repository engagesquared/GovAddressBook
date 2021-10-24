import * as React from "react";
import { Checkbox, Dialog, Flex, Input, Text } from "@fluentui/react-northstar";
import { IDBCustomField, IException, IUserProfile } from "../../../../../../common";
import { IFormProps } from "../Common/IFormProps";
import { useClasses } from "./UserDetailsForm.styles";

export interface IUserDeleteConfirmationProps extends IFormProps {
  onSubmit: (user: IUserProfile) => Promise<void>;
  user: IUserProfile;
}

export const UserDeleteConfirmation = (props: IUserDeleteConfirmationProps) => {
  const classes = useClasses();
  const [userDetailsData, setUserDetailsData] = React.useState<IUserProfile | undefined>();
  const [exception, setException] = React.useState<IException | undefined>();

  React.useEffect(() => {
    if (props.user) {
      setUserDetailsData(props.user);
    }
  }, [props.user]);

  const onConfirm = async () => {
    try {
      if (userDetailsData) {
        setException(undefined);
        await props.onSubmit(userDetailsData);
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
      className={classes.dialogUserDetails}
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
          <Text>Are you sure you want to delete this user?</Text>
          {exception && <Text error>{exception.message}</Text>}
        </>
      }
    />
  );
};
