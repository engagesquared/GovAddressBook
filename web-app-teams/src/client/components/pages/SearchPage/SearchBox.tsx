import { Dropdown, Flex, Input, Text } from "@fluentui/react-northstar";
import * as React from "react";
import { ISearchConnection } from "../../../../../../common";
import { useClasses } from "./SearchPage.styles";
import { SearchIcon } from "@fluentui/react-icons-northstar";
import { HistorySearchPrompt } from "./HistorySearchPrompt";


export interface ISerachBox {
    disabled: boolean;
    searchVal: string | undefined;
    connectionVal: ISearchConnection | undefined;
    connections: ISearchConnection[];
    onSearchChange: (val: string | undefined) => void;
    onConnectionChange: (val: ISearchConnection | undefined) => void;
    searchHistory?: Array<string>;
}

export interface IConnectionOption {
    key: string;
    value: string;
    header: string;
}

export const SearchBox = ({ disabled, searchVal, connectionVal, connections, onSearchChange, onConnectionChange, searchHistory }: ISerachBox) => {
    const classes = useClasses();
    const [showHistoryList, setShowHistoryList] = React.useState<boolean>(false);

    const onInputChange = React.useCallback((ev, newValue) => {
        onSearchChange(newValue?.value);
    }, [onSearchChange]);

    const onDropDownChange = React.useCallback((ev, newValue) => {
        if (newValue.value) {
            const result = connections.find(c => `${c.Id}` == newValue.value.key);
            onConnectionChange(result);
        }
    }, [onConnectionChange, connections]);

    const onHistorySearchChange = React.useCallback((newValue: string) => {
        onSearchChange(newValue);
        setShowHistoryList(false);
    }, [onSearchChange, setShowHistoryList]);

    const options: IConnectionOption[] = React.useMemo(() => {
        let result: IConnectionOption[] = [{
            key: "internal",
            value: "internal",
            header: "Internal"
        }];
        if (connections && connections?.length) {
            connections.forEach((connection) => {
                const keyItem = `${connection.Id}` || "";
                result.push({ key: keyItem, value: keyItem, header: connection.Name });
            });
        }
        return result;
    }, [connections]);

    const selectedOption: IConnectionOption | undefined = React.useMemo(() => {
        let result = options[0];
        if (connectionVal) {
            result = options.find(o => o.key === `${connectionVal.Id}`) || options[0];
        }
        return result;
    }, [options, connectionVal]);

    return (<Flex column>
        <Text
            className={classes.filterTitle}
            size="large"
            content={"Who are you looking for?"}
        />
        <Flex>
            <Flex column className={classes.searchBoxContainer} onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as any)) {
                    setShowHistoryList(false)
                }
            }}>
                <Input
                    clearable
                    placeholder="Search"
                    icon={<SearchIcon />}
                    iconPosition="start"
                    fluid
                    value={searchVal}
                    onChange={onInputChange}
                    onFocus={() => setShowHistoryList(true)}
                    autoComplete={"off"}
                />
                {showHistoryList && searchHistory && <HistorySearchPrompt searchHistory={searchHistory} onSelect={onHistorySearchChange} />}
            </Flex>
            <Dropdown
                disabled={disabled}
                fluid
                defaultValue={selectedOption}
                value={selectedOption}
                items={options}
                onChange={onDropDownChange}
            />
        </Flex>
    </Flex>);
}