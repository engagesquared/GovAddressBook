import * as React from "react";
import { Flex, Text } from "@fluentui/react-northstar";

export interface INoResultsProps {
    isStartView: boolean;
}

export const NoResults = ({ isStartView }: INoResultsProps) => {
    return (<Flex column>
        {isStartView 
            ? <>
                <Text size="medium" content={"You can find someone by searching for their:"} />
                <ul>
                    <li>
                        <Text size="medium" content="Full name" />
                    </li>
                    <li>
                        <Text size="medium" content="Role" />
                    </li>
                    <li>
                        <Text size="medium" content="Phone Number" />
                    </li>
                    <li>
                        <Text size="medium" content="Email Address" />
                    </li>
                </ul>
            </>
            : <Text size="medium" content={"Nothing to show ..."} />
        }
        
    </Flex>);
}