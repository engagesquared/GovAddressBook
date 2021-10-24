import * as React from "react";
import { Button, Popup, Checkbox, Flex, Grid, Text } from "@fluentui/react-northstar";
import { useClasses } from "./SearchPage.styles";
import { FacetResult } from "@azure/search-documents";
import { IAzSearchUserProfile } from "../../../../../../common";
import { FilterIcon } from "@fluentui/react-icons-northstar";
import { splitString } from "../../../utilities/stringUtils";

export type IRefinerSet = {
    [key in keyof Partial<IAzSearchUserProfile>]: FacetResult[];
};

export type ISelectedRefiners = {
    [key in keyof Partial<IAzSearchUserProfile>]: string[];
};

export interface IRefinerProps {
    refiners: IRefinerSet;
    selected: ISelectedRefiners;
    isStartView: boolean;
    isMobile: boolean;
    onChange: (val: ISelectedRefiners) => void;
}

export const SearchRefiner = ({ refiners, selected, isStartView, isMobile, onChange }: IRefinerProps) => {
    const classes = useClasses();

    const onCheckboxClick = React.useCallback((refinerKey: string, value: string, isSelected: boolean) => {
        var result = { ...selected };
        if (isSelected) {
            result[refinerKey] = [...(result[refinerKey] || []), value];
        } else {
            result[refinerKey] = (result[refinerKey] || []).filter(v => v !== value);
        }
        onChange(result);
    }, [selected, onChange]);

    const isSelected = (refinerKey: string, optionVal: string): boolean => {
        const result = (selected[refinerKey] || []).find(v => v === optionVal) !== undefined;
        return result;
    };

    const hideRefiner: boolean = React.useMemo(() => {
        let result = isStartView || !Object.keys(refiners).length;
        if (!result) {
            for (const k of Object.keys(refiners)) {
                result = result || !refiners[k].length;
            }
        }
        return result;
    }, [isStartView, refiners]);

    const refinerContent =
        <Flex column gap="gap.smaller">
            <div className={classes.filterContainer}>
                <Text className={classes.filterTitle} weight="bold" size="large" content={"Filter Results"} />
                {Object.keys(refiners).map((refinerKey) =>
                    <Flex column gap="gap.smaller">
                        <Text className={classes.filterTitle} size="medium" content={splitString(refinerKey)} />
                        <Grid columns="1">
                            {refiners[refinerKey]?.length ? (refiners[refinerKey]).map((option, idx) =>
                                <Checkbox
                                    key={idx}
                                    checked={isSelected(refinerKey, option.value)}
                                    label={option.value || "(not set)"}
                                    onChange={(e, data) => onCheckboxClick(refinerKey, option.value, !!data?.checked)}
                                />
                            ) : <Text temporary size={"medium"}>N/A</Text>}
                        </Grid>
                    </Flex>
                )}
            </div>
        </Flex>

    const mobileRefinerContent =
        <Popup
            align="start" className={classes.popupRefinerContainer} pointing position="below" content={ refinerContent }
            trigger={
                <Button
                    className={classes.filterButton}
                    icon={<FilterIcon />}
                    text
                    content="Filter Results"
                />}
        />

    const refiner =
        <>
            {isMobile ? mobileRefinerContent : refinerContent}
        </>

    return (
        <>
            {!hideRefiner ?
                refiner
                : null}
        </>
    );



}