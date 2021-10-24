import * as React from "react";
import { AddIcon, Alert, Button, ExclamationTriangleIcon, Flex, Text } from "@fluentui/react-northstar";
import { IDBPartnerOutgoingConnection } from "../../../../../../common/models/db/IDBPartnerOutgoingConnection";
import ConnectionService from "../../../services/ConnectionService";
import { useTeams } from "msteams-react-base-component";
import UserService from "../../../services/UserService";
import { useErrorHandling } from "../../controls/ErrorBoundary/ErrorBoundary";
import { LOCAL_STORAGE } from "../../../constants";
import { getCacheKey } from "../../../services/CacheService";
import { OutConnectionsList } from "../../controls/Connections/OutConnectionsList";
import { IOutConnectFormProps, OutConnectionForm } from "../../controls/Connections/OutConnectionForm";
import { useContextGetters } from "../../../state";

// endpoints provided for us
export const PartnerConnectionsPage = () => {
  const triggerError = useErrorHandling();
  const [{ context }] = useTeams();
  const { getMeIsAdmin } = useContextGetters();
  const meIsAdmin = getMeIsAdmin();

  const [inProgress, setInProgress] = React.useState<boolean>(false);
  const [dialogInProgress, setDialogInProgress] = React.useState<boolean>(false);
  const [outConnections, setOutConnections] = React.useState<IDBPartnerOutgoingConnection[] | undefined>(undefined);
  const [formOutConnectProps, setFormOutConnectProps] = React.useState<IOutConnectFormProps | undefined>(undefined);
  const [serverPublicIp, setServerPublicIp] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (meIsAdmin) {
      (async () => {
        try {
          setInProgress(true);
          const [allOutConnections, publicIp] = await Promise.all([
            ConnectionService.getAllOutgoing(),
            ConnectionService.getServerPublicIp()
          ]);
          setOutConnections(allOutConnections);
          setServerPublicIp(publicIp);
        } catch (e) {
          triggerError(e);
        } finally {
          setInProgress(false);
        }
      })();
    }
  }, [meIsAdmin]);

  const onCreateOutConnection = () => {
    return setFormOutConnectProps({
      onSubmit: async (connection) => {
        try {
          setDialogInProgress(true);
          const newConnection: IDBPartnerOutgoingConnection | undefined =
            await ConnectionService.addOutgoing(connection);
          if (newConnection) {
            return setOutConnections([
              ...((outConnections as IDBPartnerOutgoingConnection[]) || []),
              newConnection,
            ]);
          }
        } catch (error) {
          triggerError(error);
        } finally {
          setDialogInProgress(false);
        }
      },
      onCancel: () => setFormOutConnectProps(undefined),
      formTitle: "Create a connection",
      confirmLabel: "Save",
    });
  };

  const onEditOutConnection = (connection: IDBPartnerOutgoingConnection) => {
    return setFormOutConnectProps({
      onSubmit: async (updatedConnection) => {
        try {
          setDialogInProgress(true);
          await ConnectionService.updateOutgoing(
            updatedConnection as IDBPartnerOutgoingConnection
          );
          const connections: IDBPartnerOutgoingConnection[] = [
            ...(outConnections || []),
          ];
          const idx: number = connections.findIndex(
            (c) => c.Id === updatedConnection.Id
          );
          if (idx > -1) {
            connections.splice(idx, 1, {
              ...connections[idx],
              ...updatedConnection,
            });
          }
          return setOutConnections(connections);
        } catch (error) {
          triggerError(error);
        } finally {
          setDialogInProgress(false);
        }
      },
      onCancel: () => setFormOutConnectProps(undefined),
      formTitle: "Edit a connection",
      confirmLabel: "Edit",
      connection: connection,
    });
  };

  const onDeleteOutConnection = (connection: IDBPartnerOutgoingConnection) => {
    return setFormOutConnectProps({
      onSubmit: async (removedConnection) => {
        try {
          setDialogInProgress(true);
          if (removedConnection.Id) {
            await ConnectionService.deleteOutgoing(removedConnection.Id);
            const connections: IDBPartnerOutgoingConnection[] = [
              ...(outConnections || []),
            ];
            const idx: number = connections.findIndex(
              (c) => c.Id === removedConnection.Id
            );
            if (idx > -1) {
              connections.splice(idx, 1);
            }
            return setOutConnections(connections);
          }
        } catch (error) {
          triggerError(error);
        } finally {
          setDialogInProgress(false);
        }
      },
      onCancel: () => setFormOutConnectProps(undefined),
      formTitle: "Delete a connection",
      confirmLabel: "Delete",
      connection: connection,
      isDeleteDialog: true,
    });
  };

  return meIsAdmin ? (
    <Flex column gap={"gap.small"} fill>
      <Flex space="between">
        <Button
          icon={<AddIcon />}
          onClick={onCreateOutConnection}
          disabled={inProgress}
          text
          content="Connect to new partner"
        />
        <Text
          size="large"
          weight="semibold"
          content={`Your App IP Address: ${serverPublicIp || "..."}`}
        />
      </Flex>
      {outConnections && (
        <OutConnectionsList
          connections={outConnections}
          onEdit={onEditOutConnection}
          onDelete={onDeleteOutConnection}
        />
      )}
      {formOutConnectProps && (
        <OutConnectionForm
          {...formOutConnectProps}
          inProgress={dialogInProgress}
        />
      )}
    </Flex>
  ) : <Alert icon={<ExclamationTriangleIcon />} content="Sorry, you don't have the required permissions to access this tab." />;
};
