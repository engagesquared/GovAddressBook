import * as React from "react";
import { ErrorControl } from "./ErrorControl";
import { IError } from "./IError";

const ErrorBoundaryContext = React.createContext((error: IError) => {});
export const useErrorHandling = () => {
  return React.useContext(ErrorBoundaryContext);
};

export const ErrorBoundary = ({ children }) => {
  const [errorNotifications, setErrorNotifications] = React.useState<
    IError[] | undefined
  >(undefined);

  const triggerError = (errorData: IError) => {
    if (errorNotifications && !!errorNotifications.length) {
      setErrorNotifications([...errorNotifications, errorData]);
    } else {
      setErrorNotifications([errorData]);
    }
  };

  const removeErrorNotification = (errorIndex: number) => {
    const errorNotificationsData = [...(errorNotifications || [])];
    errorNotificationsData.splice(errorIndex, 1);
    setErrorNotifications(errorNotificationsData);
  };

  return (
    <ErrorBoundaryContext.Provider value={triggerError}>
      {errorNotifications && !!errorNotifications.length ? (
        <ErrorControl
          errorNotifications={errorNotifications}
          onRemoveErrorNotif={removeErrorNotification}
        />
      ) : null}
      {children}
    </ErrorBoundaryContext.Provider>
  );
};
