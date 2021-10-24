import * as React from "react";
import {
  LocationIcon,
  LockIcon,
  EditIcon,
  TrashCanIcon,
} from "@fluentui/react-icons-northstar";
import {
  Text,
  Avatar,
  Flex,
  Loader,
  Button,
  Divider,
  Alert
} from "@fluentui/react-northstar";
import { IUserProfile } from "../../../../../../common/models/api/IUserProfile";

import UserService from "../../../services/UserService";
import CustomFieldService from "../../../services/CustomFieldsService";
import { IDBCustomField } from "../../../../../../common/models/db/IDBCustomField";
import {
  userDetailsDisplayFields,
  userWelcomeText,
} from "../../../labels/UserProfileFields";
import { useClasses } from "./MyProfilePage.styles";
import { IUserDetailsFormProps, UserDetailsForm } from "../../controls/UserProfile/UserDetailsForm";
import { CustomFieldForm, ICustomFieldFormProps } from "../../controls/UserProfile/CustomFieldForm";
import { useErrorHandling } from "../../controls/ErrorBoundary/ErrorBoundary";
import { useContextGetters, useContextSetters } from "../../../state";
import { IDBUserProfileInternal } from "../../../../../../common";
import { CustomAvatar } from "../../controls/CustomAvatar/CustomAvatar";

export const MyProfilePage = () => {
  const { getIsMobile, getCurrentUser } = useContextGetters();
  const { setCurrentUser } = useContextSetters();
  const classes = useClasses();
  const triggerError = useErrorHandling();
  const currentUser = getCurrentUser() as IDBUserProfileInternal; // current user retrieved on root
  const isMobile = getIsMobile();

  const [customFields, setCustomFields] = React.useState<IDBCustomField[] | undefined>(undefined);
  const [customFieldsinProgress, setCustomFieldsInProgress] = React.useState<boolean>(false);
  const [dialogInProgress, setDialogInProgress] = React.useState<boolean>(false);
  const [publichProfileInProgress, setPublichProfileInProgress] = React.useState<boolean>(false);

  const [formEditUserDetailsProps, setFormEditUserDetailsProps] = React.useState<IUserDetailsFormProps | undefined>(undefined);
  const [formCustomFieldProps, setFormCustomFieldProps] = React.useState<ICustomFieldFormProps | undefined>(undefined);
  const [publishSuccess, setPublishSuccess] = React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      try {
        setCustomFieldsInProgress(true);
        const customFieldsCurrentUser: IDBCustomField[] | undefined = await CustomFieldService.getAll();
        setCustomFields(customFieldsCurrentUser);
      } catch (e) {
        triggerError(e);
      } finally {
        setCustomFieldsInProgress(false);
      }
    })();
  }, []);

  const onEditUserDetails = () => {
    if (currentUser) {
      return setFormEditUserDetailsProps({
        onSubmit: async (user: IUserProfile) => {
          try {
            setDialogInProgress(true);
            await UserService.updateMyProfile(user);
            setCurrentUser(user);
          } catch (error) {
            triggerError(error);
          } finally {
            setDialogInProgress(false);
          }
        },
        onCancel: () => setFormEditUserDetailsProps(undefined),
          formTitle: "Edit user details",
          confirmLabel: "Save",
          user: currentUser as IUserProfile,
          isMobile: isMobile,
          isAdminEdit: false
      });
    }
  };

  const onCreateCustomField = () => {
    return setFormCustomFieldProps({
      onSubmit: async (customField: IDBCustomField) => {
        try {
          setDialogInProgress(true);
          const createdCustomField = await CustomFieldService.add(customField);
          if (createdCustomField) {
            setCustomFields([
              ...(customFields as IDBCustomField[]),
              createdCustomField,
            ]);
          }
        } catch (error) {
          triggerError(error);
        } finally {
          setDialogInProgress(false);
        }
      },
      onCancel: () => setFormCustomFieldProps(undefined),
      formTitle: "Add new custom field",
      confirmLabel: "Add",
      isDeleteDialog: false,
      isMobile: isMobile,
    });
  };

  const onEditCustomField = (customField: IDBCustomField) => {
    return setFormCustomFieldProps({
      onSubmit: async (updatedCustomField: IDBCustomField) => {
        try {
          setDialogInProgress(true);
          await CustomFieldService.update(updatedCustomField);
          const fields: IDBCustomField[] = [...(customFields || [])];
          const idx: number = fields.findIndex(
            (c) => c.Id === updatedCustomField.Id
          );
          if (idx > -1) {
            fields.splice(idx, 1, {
              ...fields[idx],
              ...updatedCustomField,
            });
          }
          return setCustomFields(fields);
        } catch (error) {
          triggerError(error);
        } finally {
          setDialogInProgress(false);
        }
      },
      onCancel: () => setFormCustomFieldProps(undefined),
      formTitle: "Edit custom field",
      confirmLabel: "Save",
      isDeleteDialog: false,
      isMobile: isMobile,
      customField: customField,
    });
  };

  const onDeleteCustomField = (customField: IDBCustomField) => {
    return setFormCustomFieldProps({
      onSubmit: async (removedCustomField: IDBCustomField) => {
        try {
          setDialogInProgress(true);
          if (removedCustomField.Id) {
            await CustomFieldService.delete(removedCustomField.Id);
            const fields: IDBCustomField[] = [...(customFields || [])];
            const idx: number = fields.findIndex(
              (c) => c.Id === removedCustomField.Id
            );
            if (idx > -1) {
              fields.splice(idx, 1);
            }
            return setCustomFields(fields);
          }
        } catch (error) {
          triggerError(error);
        } finally {
          setDialogInProgress(false);
        }
      },
      onCancel: () => setFormCustomFieldProps(undefined),
      formTitle: "Remove custom field",
      confirmLabel: "Remove",
      isDeleteDialog: true,
      isMobile: isMobile,
      customField: customField,
    });
  };

  const onPublishProfile = async () => {
    try {
      if(currentUser){
        setPublichProfileInProgress(true);
        await UserService.publishMyProfile();
        setCurrentUser({...currentUser, Published: true});
        setPublishSuccess(true);
      }
    } catch (error) {
      triggerError(error);
    } finally {
      setPublichProfileInProgress(false);
    }
  };

  return (
    <>        
      <Flex>
        {/* {exception && <Alert danger content={exception.message} />} */}
        <Flex column gap="gap.medium">
          {!currentUser.Published && (
            <>
              <Flex gap="gap.large">
                <Text
                  className={classes.welcomeText}
                  size={"larger"}
                  weight="semibold"
                >{`${userWelcomeText.welcomeText}${currentUser.GivenName}${userWelcomeText.welcomeSuffix}`}</Text>
              </Flex>
              <Flex gap="gap.large">
                <Text size={"medium"} className={classes.welcomeText}>
                  {userWelcomeText.welcomeBlurb}
                </Text>
              </Flex>
              <Divider />
            </>
          )}
          <Flex gap="gap.large">
            <CustomAvatar aadId={currentUser.UserAadId} name={currentUser.DisplayName} size={"largest"} />
            <Flex column gap="gap.smaller">
              <div className={classes.nameAndPronounContiner}>
                <Text
                  content={currentUser.DisplayName}
                  size={"largest"}
                  weight="bold"
                />
                {currentUser.PreferredPronoun && (
                  <Text
                    className={classes.textPronouns}
                    content={currentUser.PreferredPronoun}
                    size={"small"}
                    weight="light"
                  />
                )}
              </div>
              {currentUser.JobTitle && (
                <Text
                  content={currentUser.JobTitle}
                  size={"larger"}
                  weight="semibold"
                />
              )}
              {currentUser.DepartmentName && (
                <Text
                  size="medium"
                  content={currentUser.DepartmentName}
                />
              )}
              {currentUser.OfficeLocation && (
                <Flex gap="gap.smaller">
                  <LocationIcon />
                  <Text content={currentUser.OfficeLocation} />
                  {/* <PresenceAvailableIcon
                  outline
                  size={"smaller"}
                  color={"green"}
                /> */}
                </Flex>
              )}
              <Button
                text
                primary
                content={userDetailsDisplayFields.buttonLabelEditDetails}
                className={classes.buttonEditUserDetails}
                onClick={onEditUserDetails}
                disabled={publichProfileInProgress}
              />
            </Flex>
          </Flex>
          <Flex
            className={
              isMobile
                ? classes.bodyContainerMobile
                : classes.bodyContainer
            }
            column
            gap="gap.medium"
          >
            {currentUser.Mail && (
              <Flex column>
                <Text
                  content={userDetailsDisplayFields.emailAddressLabelField}
                  weight="bold"
                />
                <Text content={currentUser.Mail} />
              </Flex>
            )}
            {currentUser.MobilePhone && (
              <Flex column>
                <Text
                  content={userDetailsDisplayFields.mobileNumberLabelField}
                  weight="bold"
                />
                <Text content={currentUser.MobilePhone} />
              </Flex>
            )}
            {currentUser.OfficePhone && (
              <Flex column>
                <Text
                  content={userDetailsDisplayFields.deskNumberLabelField}
                  weight="bold"
                />
                <Text content={currentUser.OfficePhone} />
              </Flex>
            )}
            {customFieldsinProgress && <Loader />}
            {customFields && customFields?.length ? (
              <Flex column gap="gap.medium">
                {customFields.map((customFieldItem) => {
                  return (
                    <Flex column>
                      <Flex gap="gap.smaller">
                        <Text
                          className={classes.customFieldDisplayName}
                          content={customFieldItem.DisplayName}
                          weight="bold"
                        />
                        <Text
                          content={"(custom)"}
                          weight="bold"
                          className={classes.customText}
                        />
                      </Flex>
                      <Flex gap="gap.smaller">
                        {!customFieldItem.Visibility ? (
                          <LockIcon className={classes.lockIcon} />
                        ) : undefined}
                        <Text
                          className={classes.customFieldValue}
                          content={customFieldItem.Value}
                        />
                        <Flex
                          className={classes.editAndDeleteContainer}
                          gap="gap.smaller"
                        >
                          <Button
                            text
                            primary
                            icon={<EditIcon />}
                            iconOnly
                            className={classes.buttonEditAndRemoveCustomField}
                            onClick={() => onEditCustomField(customFieldItem)}
                            disabled={publichProfileInProgress}
                          />
                          <Button
                            text
                            primary
                            icon={<TrashCanIcon />}
                            iconOnly
                            className={classes.buttonEditAndRemoveCustomField}
                            onClick={() =>
                              onDeleteCustomField(customFieldItem)
                            }
                            disabled={publichProfileInProgress}
                          />
                          {/* TODO add in length validation check error here e.g. name is too long / cant be empty*/}
                        </Flex>
                      </Flex>
                    </Flex>
                  );
                })}
              </Flex>
            ) : null}
            <Button
              content={userDetailsDisplayFields.addNewInfoButtonLabel}
              secondary
              disabled={customFieldsinProgress || publichProfileInProgress}
              className={classes.buttonAddNewInfo}
              onClick={onCreateCustomField}
            />
            {/* This button is hidden, because Teams Message Extension will not be implemented at this time */}
            {/* <Button
              icon={<ShareGenericIcon size={"smaller"} />}
            <Button
              icon={<ShareGenericIcon />}
              disabled={inProgress}
              iconPosition="after"
              text
              content={userDetailsDisplayFields.shareProfileButtonLabel}
              className={classes.buttonShareProfile}
            /> */}
          </Flex>
          {!currentUser.Published && (
            <>
              <Divider />
              <Flex gap="gap.medium">
                <Button
                  content={userWelcomeText.publishProfileButton}
                  primary
                  onClick={() => {
                    onPublishProfile();
                  }}
                  disabled={publichProfileInProgress}
                />
                <Button
                  content={userWelcomeText.remindMeLaterButton}
                  secondary
                  disabled={publichProfileInProgress}
                />
              </Flex>
            </>
            )}
            {publishSuccess && (
              <Alert success dismissible content="Thankyou, you have succesfully published your profile. Users using this app can now find you!" />
            )}
        </Flex>
      </Flex>
      
      {formEditUserDetailsProps && (
        <UserDetailsForm
          {...formEditUserDetailsProps}
          inProgress={dialogInProgress}
        />
      )}
      {formCustomFieldProps && (
        <CustomFieldForm
          {...formCustomFieldProps}
          inProgress={dialogInProgress}
          isMobile={isMobile}
        />
      )}
    </>
  );
};
