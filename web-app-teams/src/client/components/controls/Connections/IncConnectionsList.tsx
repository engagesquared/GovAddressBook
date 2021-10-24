import * as React from "react";
import {
  Flex,
  Text,
  Table,
  EditIcon,
  TrashCanIcon,
  MoreIcon,
  MenuButton,
  Alert,
  ShorthandCollection,
  TableRowProps,
} from "@fluentui/react-northstar";
import { IDBPartnerIncomingConnection } from "../../../../../../common";

interface IIncConnectionsListProps {
  connections: Array<IDBPartnerIncomingConnection>;
  onEdit: (connection: IDBPartnerIncomingConnection) => void;
  onDelete: (connection: IDBPartnerIncomingConnection) => void;
}

export const IncConnectionsList = ({ connections, onEdit, onDelete }: IIncConnectionsListProps) => {
  const tableHeader = React.useMemo(() => {
    return [
      <Text key="header_title" content="Organisation Name" />,
      <Text key="header_ipKey" content="Whitelisted App IP Address" />,
      <Text key="header_apiKey" content="API Key" />,
      <div></div>
    ]
  }, []);

  const connectionsData: ShorthandCollection<TableRowProps, Record<string, {}>> | undefined = React.useMemo(() => {
    return connections.map((connectionItem, idx) => {
      const items = [
        <Text key={`titleConnect_${idx}`} content={connectionItem.Name} />,
        <Text key={`titleIpKey_${idx}`} content={connectionItem.WhitelistIPAddress} />,
        <Text key={`titleApiKey_${idx}`} content={connectionItem.APIKey} />,
        <MenuButton
          key={`more_${idx}`}
          trigger={<MoreIcon outline />}
          menu={[
            {
              key: "edit",
              content: <Text>Edit connection</Text>,
              icon: <EditIcon />,
              onClick: () => onEdit(connectionItem),
            },
            {
              key: "delete",
              content: <Text>Delete connection</Text>,
              icon: <TrashCanIcon />,
              onClick: () => onDelete(connectionItem),
            },
          ]}
        />
      ];
      return { key: idx, items };
    });
  }, [connections, onEdit, onDelete]);

  return (
    <Flex column gap="gap.medium">
      {!!connectionsData.length ? (
        <Table header={tableHeader} rows={connectionsData} />
      ) : (
        <Alert content="No connections ..." info />
      )}
    </Flex>
  );
};
