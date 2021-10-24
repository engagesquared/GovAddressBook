import * as React from "react";
import { Dialog, Flex, Input, Text } from "@fluentui/react-northstar";
import { IException, IUserProfile } from "../../../../../../common";
import { userDetailsEditFields } from "../../../labels/UserProfileFields";
import { useClasses } from "./UserDetailsForm.styles";
import { IFormProps } from "../Common/IFormProps";
import { useContextGetters } from "../../../state";
export interface IUserDetailsFormProps extends IFormProps {
  onSubmit: (user: IUserProfile) => Promise<void>;
  user: IUserProfile;
  isMobile: boolean;
  isAdminEdit: boolean;
}

export const UserDetailsForm = (props: IUserDetailsFormProps) => {
  const classes = useClasses();
  const { getEnv } = useContextGetters();
  const env = getEnv();
  const [userDetailsData, setUserDetailsData] = React.useState<IUserProfile | undefined>();
  const [exception, setException] = React.useState<IException | undefined>();

  React.useEffect(() => {
    if (props.user) {
      setUserDetailsData(props.user);
    }
  }, [props.user]);

  const onConfirm = async () => {
    try {
      if (userDetailsData) {
        setException(undefined);
        await props.onSubmit(userDetailsData);
        props.onCancel();
      }
    } catch (ex) {
      setException(ex);
    }
  };

  const isManualMode: boolean = !!env.MANUAL_MODE;

  return (
    <Dialog
      open={true}
      backdrop={true}
      onConfirm={onConfirm}
      onCancel={props.onCancel}
      header={props.formTitle}
      className={props.isMobile ? classes.dialogUserDetailsMobile : classes.dialogUserDetails}
      cancelButton={{
        content: userDetailsEditFields.buttonCancelDialog,
        disabled: props.inProgress,
      }}
      confirmButton={{
        content: props.confirmLabel,
        disabled: props.inProgress,
      }}
      content={
        <>
          <Flex
            column
            gap="gap.medium"
            styles={{ overflow: "scroll", maxHeight: "500px" }}
          >
            <Input
              disabled={props.inProgress}
              fluid
              
              label={userDetailsEditFields.fieldLabelDisplayName}
              placeholder={userDetailsEditFields.fieldLabelDisplayName}
              value={userDetailsData?.DisplayName}
              onChange={(ev, newValue) => {
                setUserDetailsData({
                  ...(userDetailsData as IUserProfile),
                  DisplayName: newValue ? newValue.value : "",
                });
              }}
            />
            {isManualMode ? 
            <>
              <Input
                disabled={props.inProgress}
                fluid
                
                label={userDetailsEditFields.fieldLabelGivenName}
                placeholder={userDetailsEditFields.fieldLabelGivenName}
                value={userDetailsData?.GivenName}
                onChange={(ev, newValue) => {
                  setUserDetailsData({
                    ...(userDetailsData as IUserProfile),
                    GivenName: newValue ? newValue.value : "",
                  });
                }}
              />
              <Input
                disabled={props.inProgress}
                fluid
                
                label={userDetailsEditFields.fieldLabelSurName}
                placeholder={userDetailsEditFields.fieldLabelSurName}
                value={userDetailsData?.SurName}
                onChange={(ev, newValue) => {
                  setUserDetailsData({
                    ...(userDetailsData as IUserProfile),
                    SurName: newValue ? newValue.value : "",
                  });
                }}
              />
            </> : null}
            <Input
              disabled={props.inProgress}
              fluid
              
              label={userDetailsEditFields.fieldLabelPreferredPronoun}
              placeholder={userDetailsEditFields.fieldLabelPreferredPronoun}
              value={userDetailsData?.PreferredPronoun}
              onChange={(ev, newValue) => {
                setUserDetailsData({
                  ...(userDetailsData as IUserProfile),
                  PreferredPronoun: newValue ? newValue.value : "",
                });
              }}
            />
            {isManualMode ?
            <>
              <Input
                disabled={props.inProgress}
                fluid
                
                label={userDetailsEditFields.fieldLabelMailNickname}
                placeholder={userDetailsEditFields.fieldLabelMailNickname}
                value={userDetailsData?.MailNickname}
                onChange={(ev, newValue) => {
                  setUserDetailsData({
                    ...(userDetailsData as IUserProfile),
                    MailNickname: newValue ? newValue.value : "",
                  });
                }}
              />
              <Input
                disabled={props.inProgress}
                fluid
                
                label={userDetailsEditFields.fieldLabelUserPrincipalName}
                placeholder={userDetailsEditFields.fieldLabelUserPrincipalName}
                value={userDetailsData?.UserPrincipalName}
                onChange={(ev, newValue) => {
                  setUserDetailsData({
                    ...(userDetailsData as IUserProfile),
                    UserPrincipalName: newValue ? newValue.value : "",
                  });
                }}
              />
              <Input
                disabled={props.inProgress}
                fluid
                
                label={userDetailsEditFields.fieldLabelJobTitle}
                placeholder={userDetailsEditFields.fieldLabelJobTitle}
                value={userDetailsData?.JobTitle}
                onChange={(ev, newValue) => {
                  setUserDetailsData({
                    ...(userDetailsData as IUserProfile),
                    JobTitle: newValue ? newValue.value : "",
                  });
                }}
              />
              <Input
                disabled={props.inProgress}
                fluid
                
                label={userDetailsEditFields.fieldLabelDepartmentName}
                placeholder={userDetailsEditFields.fieldLabelDepartmentName}
                value={userDetailsData?.DepartmentName}
                onChange={(ev, newValue) => {
                  setUserDetailsData({
                    ...(userDetailsData as IUserProfile),
                    DepartmentName: newValue ? newValue.value : "",
                  });
                }}
              />
            </> : null}
            <Input
              disabled={props.inProgress}
              fluid
              
              label={userDetailsEditFields.fieldLabelOfficeLocation}
              placeholder={userDetailsEditFields.fieldLabelOfficeLocation}
              value={userDetailsData?.OfficeLocation}
              onChange={(ev, newValue) => {
                setUserDetailsData({
                  ...(userDetailsData as IUserProfile),
                  OfficeLocation: newValue ? newValue.value : "",
                });
              }}
            />
            {isManualMode ?
            <>
              <Input
                disabled={props.inProgress}
                fluid
                
                label={userDetailsEditFields.fieldLabelEMail}
                placeholder={userDetailsEditFields.fieldLabelEMail}
                value={userDetailsData?.Mail}
                onChange={(ev, newValue) => {
                  setUserDetailsData({
                    ...(userDetailsData as IUserProfile),
                    Mail: newValue ? newValue.value : "",
                  });
                }}
              />
              <Input
                disabled={props.inProgress}
                fluid
                
                label={userDetailsEditFields.fieldLabelMobilePhone}
                placeholder={userDetailsEditFields.fieldLabelMobilePhone}
                value={userDetailsData?.MobilePhone}
                onChange={(ev, newValue) => {
                  setUserDetailsData({
                    ...(userDetailsData as IUserProfile),
                    MobilePhone: newValue ? newValue.value : "",
                  });
                }}
              />
              <Input
                disabled={props.inProgress}
                fluid
                
                label={userDetailsEditFields.fieldLabelOfficePhone}
                placeholder={userDetailsEditFields.fieldLabelOfficePhone}
                value={userDetailsData?.OfficePhone}
                onChange={(ev, newValue) => {
                  setUserDetailsData({
                    ...(userDetailsData as IUserProfile),
                    OfficePhone: newValue ? newValue.value : "",
                  });
                }}
              />
            </> : null}
          </Flex>
          {exception && <Text error>{exception.message}</Text>}
        </>
      }
    />
  );
};
