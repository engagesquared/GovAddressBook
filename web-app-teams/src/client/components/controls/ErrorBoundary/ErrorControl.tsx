import * as React from "react";
import { Button, Card, CloseIcon, Flex, Text } from "@fluentui/react-northstar";
import { useClasses } from "./ErrorControl.styles";
import { IError } from "./IError";

interface IErrorControlProps {
  errorNotifications: IError[];
  onRemoveErrorNotif: (index: number) => void;
}

export const ErrorControl = ({
  errorNotifications,
  onRemoveErrorNotif,
}: IErrorControlProps) => {
  const classes = useClasses();
  return (
    <div className={classes.errorControlContainer}>
      {errorNotifications.map((errorNotifItem, index) => {
        return (
          <Card key={index} selected className={classes.errorCardContainer}>
            <Card.Header fitted>
              <Flex space="between">
                <Text content={errorNotifItem.message} />
                <Button
                  icon={<CloseIcon />}
                  text
                  iconOnly
                  title="Remove notification"
                  onClick={() => onRemoveErrorNotif(index)}
                />
              </Flex>
            </Card.Header>
          </Card>
        );
      })}
    </div>
  );
};
