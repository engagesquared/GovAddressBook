import * as React from "react";
import { Dialog, Flex, Input, Text } from "@fluentui/react-northstar";
import { IException, IDBPartnerIncomingConnection } from "../../../../../../common";
import { useClasses } from "./ConnectionForm.styles";
import { IFormProps } from "../Common/IFormProps";
import { v4 as uuidv4 } from 'uuid';

export interface IIncConnectFormProps extends IFormProps {
  onSubmit: (connection: IDBPartnerIncomingConnection) => Promise<void>;
  connection?: IDBPartnerIncomingConnection;
  isDeleteDialog?: boolean;
}

export const IncConnectionForm = (props: IIncConnectFormProps) => {
  const [connectionData, setConnectionData] = React.useState<IDBPartnerIncomingConnection | undefined>(
    props.connection || { Name: "", WhitelistIPAddress: "", APIKey: uuidv4() });
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
              <Text content="Allow other organisations to read from your address book by providing them with an API Key." />
              <Input
                disabled={props.inProgress}
                fluid
                label="Organisation Name"
                value={connectionData?.Name}
                onChange={(ev, newValue) => {
                  setConnectionData({
                    ...(connectionData as IDBPartnerIncomingConnection),
                    Name: newValue ? newValue.value : "",
                  });
                }}
              />
              <Input
                disabled={props.inProgress}
                fluid
                className={classes.apiKey}
                label="API Key"
                value={connectionData?.APIKey}
                onChange={(ev, newValue) => {
                  setConnectionData({
                    ...(connectionData as IDBPartnerIncomingConnection),
                    APIKey: newValue ? newValue.value : "",
                  });
                }}
              />
              <Input
                disabled={props.inProgress}
                fluid
                label="App IP address"
                value={(connectionData)?.WhitelistIPAddress}
                onChange={(ev, newValue) => {
                  setConnectionData({
                    ...(connectionData as IDBPartnerIncomingConnection),
                    WhitelistIPAddress: newValue ? newValue.value : "",
                  });
                }}
              />
                <Text content="You can whitelist an IP address to further secure your data. Partner organisations can their retrieve App IP address from the Partner Connections tab" />
            </Flex>
          )}
          {exception && <Text error>{exception.message}</Text>}
        </>
      }
    />
  );
};
