import * as React from "react";
import { Dialog, Flex, Input, Text } from "@fluentui/react-northstar";
import { IException, IDBPartnerOutgoingConnection } from "../../../../../../common";
import { useClasses } from "./ConnectionForm.styles";
import { IFormProps } from "../Common/IFormProps";

export interface IOutConnectFormProps extends IFormProps {
  onSubmit: (connection: IDBPartnerOutgoingConnection) => Promise<void>;
  connection?: IDBPartnerOutgoingConnection;
  isDeleteDialog?: boolean;
}

export const OutConnectionForm = (props: IOutConnectFormProps) => {
  const [connectionData, setConnectionData] = React.useState<IDBPartnerOutgoingConnection | undefined>(props.connection);
  const [exception, setException] = React.useState<IException | undefined>();
  const classes = useClasses();

  const onConfirm = async () => {
    try {
      if (connectionData) {
        setException(undefined);
        await props.onSubmit(connectionData);
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
      className={classes.dialogCustomField}
      onCancel={props.onCancel}
      header={props.formTitle}
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
            <Text>Are you sure you want to remove this connection?</Text>
          ) : (
            <Flex column gap="gap.medium">
              <Text content="Establish a connection to another instance of GovAddressBook so your users can search for people within other organisations. You will need the API Key and Endpoint URL provided by the other organisation" />
              <Input
                disabled={props.inProgress}
                fluid
                label="Organisation Name"
                value={connectionData?.Name}
                onChange={(ev, newValue) => {
                  setConnectionData({
                    ...(connectionData as IDBPartnerOutgoingConnection),
                    Name: newValue ? newValue.value : "",
                  });
                }}
              />
              <Input
                disabled={props.inProgress}
                fluid
                label="API Key"
                value={connectionData?.APIKey}
                onChange={(ev, newValue) => {
                  setConnectionData({
                    ...(connectionData as IDBPartnerOutgoingConnection),
                    APIKey: newValue ? newValue.value : "",
                  });
                }}
              />
              <Input
                disabled={props.inProgress}
                fluid
                label="Endpoint URL"
                value={(connectionData)?.EndpointURLOrIPAddress}
                onChange={(ev, newValue) => {
                    setConnectionData({
                        ...(connectionData as IDBPartnerOutgoingConnection),
                        EndpointURLOrIPAddress: newValue ? newValue.value : "",
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
