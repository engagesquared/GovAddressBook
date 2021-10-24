import * as React from "react";
import { AddIcon, Alert, Button, ExclamationTriangleIcon, Flex, Text } from "@fluentui/react-northstar";
import { IDBPartnerIncomingConnection } from "../../../../../../common/models/db/IDBPartnerIncomingConnection";
import ConnectionService from "../../../services/ConnectionService";
import { useTeams } from "msteams-react-base-component";
import { useErrorHandling } from "../../controls/ErrorBoundary/ErrorBoundary";
import { IncConnectionsList } from "../../controls/Connections/IncConnectionsList";
import { IIncConnectFormProps, IncConnectionForm } from "../../controls/Connections/IncConnectionForm";
import { useContextGetters } from "../../../state";

// our endpoint shared for
export const ApiKeysPage = () => {
  const triggerError = useErrorHandling();
  const [{ context }] = useTeams();
  const { getMeIsAdmin } = useContextGetters();
  const meIsAdmin = getMeIsAdmin();

  const [inProgress, setInProgress] = React.useState<boolean>(false);
  const [dialogInProgress, setDialogInProgress] = React.useState<boolean>(false);
  const [incConnections, setIncConnections] = React.useState<IDBPartnerIncomingConnection[] | undefined>(undefined);
  const [formIncConnectProps, setFormIncConnectProps] = React.useState<IIncConnectFormProps | undefined>(undefined);

  React.useEffect(() => {
    if (meIsAdmin) {
      (async () => {
        try {
          setInProgress(true);
          const allIncConnections = await ConnectionService.getAllIncoming();
          setIncConnections(allIncConnections);
        } catch (e) {
          triggerError(e);
        } finally {
          setInProgress(false);
        }
      })();
    }
  }, [meIsAdmin]);

  const onCreateIncConnection = () => {
    return setFormIncConnectProps({
      onSubmit: async (connection) => {
        try {
          setDialogInProgress(true);
          const newConnection: IDBPartnerIncomingConnection | undefined =
            await ConnectionService.addIncoming(connection);
          if (newConnection) {
            return setIncConnections([
              ...((incConnections as IDBPartnerIncomingConnection[]) || []),
              newConnection,
            ]);
          }
        } catch (error) {
          triggerError(error);
        } finally {
          setDialogInProgress(false);
        }
      },
      onCancel: () => setFormIncConnectProps(undefined),
      formTitle: "Generate an API Key",
      confirmLabel: "Save",
    });
  };

  const onEditIncConnection = (connection: IDBPartnerIncomingConnection) => {
    return setFormIncConnectProps({
      onSubmit: async (updatedConnection) => {
        try {
          setDialogInProgress(true);
          await ConnectionService.updateIncoming(
            updatedConnection as IDBPartnerIncomingConnection
          );
          const connections: IDBPartnerIncomingConnection[] = [
            ...(incConnections || []),
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
          return setIncConnections(connections);
        } catch (error) {
          triggerError(error);
        } finally {
          setDialogInProgress(false);
        }
      },
      onCancel: () => setFormIncConnectProps(undefined),
      formTitle: "Edit an API Key",
      confirmLabel: "Save",
      connection: connection,
    });
  };

  const onDeleteIncConnection = (connection: IDBPartnerIncomingConnection) => {
    return setFormIncConnectProps({
      onSubmit: async (removedConnection) => {
        try {
          setDialogInProgress(true);
          if (removedConnection.Id) {
            await ConnectionService.deleteIncoming(removedConnection.Id);
            const connections: IDBPartnerIncomingConnection[] = [
              ...(incConnections || []),
            ];
            const idx: number = connections.findIndex(
              (c) => c.Id === removedConnection.Id
            );
            if (idx > -1) {
              connections.splice(idx, 1);
            }
            return setIncConnections(connections);
          }
        } catch (error) {
          triggerError(error);
        } finally {
          setDialogInProgress(false);
        }
      },
      onCancel: () => setFormIncConnectProps(undefined),
      formTitle: "Delete an API Key",
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
          onClick={onCreateIncConnection}
          disabled={inProgress}
          text
          content="Generate new API Key"
        />
      </Flex>
      {incConnections && (
        <IncConnectionsList
          connections={incConnections}
          onEdit={onEditIncConnection}
          onDelete={onDeleteIncConnection}
        />
      )}
      {formIncConnectProps && (
        <IncConnectionForm
          {...formIncConnectProps}
          inProgress={dialogInProgress}
        />
      )}
    </Flex>
  ) : <Alert icon={<ExclamationTriangleIcon />} content="Sorry, you don't have the required permissions to access this tab." />;
};
