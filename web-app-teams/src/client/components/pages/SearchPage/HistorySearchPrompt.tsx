import * as React from "react";
import { List } from "@fluentui/react-northstar/dist/es/components/List/List";
import { useClasses } from "./SearchPage.styles";

interface IHistorySearchPromptProps {
    onSelect: (newValue: string) => void;
    searchHistory: Array<string>;
}

export const HistorySearchPrompt = ({ onSelect, searchHistory }: IHistorySearchPromptProps) => {
    const classes = useClasses();
    const [historyItems, setHistoryItems] = React.useState<Array<{ key: string; header: string, onClick: (selectedItem: any) => void }>>([]);

    React.useEffect(() => {
        setHistoryItems(searchHistory.map((historyItem) => ({ key: historyItem, header: historyItem, onClick: () => onSelect(historyItem) })));
    }, [searchHistory]);

    return historyItems.length ? (
        <List className={classes.historySearchContainer} navigable items={historyItems} />
    ) : null;
}