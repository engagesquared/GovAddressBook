import * as React from "react";
import { useLocation, withRouter } from "react-router-dom";
import {
  EmailIcon,
  ChatIcon,
  CallIcon,
  CallVideoIcon,
  LocationIcon,
  TrashCanIcon,
  MoreIcon,
  ShareGenericIcon,
  ArrowLeftIcon,
  EditIcon,
  LockIcon,
  PresenceStrokeIcon,
  AddIcon,
  CloseIcon,
} from "@fluentui/react-icons-northstar";
import {
  Loader,
  Button,
  MenuButton,
  Text,
  Avatar,
  Flex,
  PresenceAvailableIcon,
  SplitButton,
  CalendarIcon,
  Tooltip,
} from "@fluentui/react-northstar";
import { useClasses } from "./DetailedUserPage.styles";
import { IDBCustomField, IUserProfile } from "../../../../../../common";
import { userDetailsDisplayFields } from "../../../labels/UserProfileFields";
import { useHistory } from "react-router-dom";
import UserService from "../../../services/UserService";
import { useErrorHandling } from "../../controls/ErrorBoundary/ErrorBoundary";
import { useTeams } from "msteams-react-base-component";
import { TEAMS_TAB } from "../../../constants";
import CustomFieldService from "../../../services/CustomFieldsService";
import { useContextGetters } from "../../../state";
import DeepLinkService, { IDetailedUserPageDeepLink } from "../../../../../../common/services/DeepLinkService";
import { UserDetailsForm, IUserDetailsFormProps } from "../../controls/UserProfile/UserDetailsForm";
import { UserDeleteConfirmation, IUserDeleteConfirmationProps } from "../../controls/UserProfile/UserDeleteConfirmation";
import * as copyToClipboard from 'copy-to-clipboard';
import executeDeepLink from "../../../utilities/deepLinkExe";
import { CustomFieldForm, ICustomFieldFormProps } from "../../controls/UserProfile/CustomFieldForm";
import { CustomAvatar } from "../../controls/CustomAvatar/CustomAvatar";


export interface IDetailedUserPageConfig extends IDetailedUserPageDeepLink {}

const DetailedUserPage = () => {
  const { getIsMobile, getEnv, getCurrentUser, getMeIsAdmin, getMeHasTeamsCalling } = useContextGetters();
  const { state } = useLocation<IDetailedUserPageConfig>();
  const [{ context }] = useTeams();
  const history = useHistory();
  const classes = useClasses();
  const triggerError = useErrorHandling();
  const isMobile = getIsMobile();
  const env = getEnv();
  const me = getCurrentUser();
  const meIsAdmin = getMeIsAdmin();
  const meHasTeamsCalling = getMeHasTeamsCalling();

  //const [openMenu, setOpenMenu] = React.useState(false);
  const [TooltipOpen, setTooltipOpen] = React.useState<boolean>(false);
  const [inProgress, setInProgress] = React.useState<boolean>(false);
  const [userDetails, setUserDetails] = React.useState<IUserProfile | undefined>(undefined);
  const [customFields, setCustomFields] = React.useState<IDBCustomField[] | undefined>(undefined);
  const [formEditUserDetailsProps, setFormEditUserDetailsProps] = React.useState<IUserDetailsFormProps | undefined>(undefined);
  const [formDeleteUserProps, setFormDeleteUserProps] = React.useState<IUserDeleteConfirmationProps | undefined>(undefined);
  const [dialogInProgress, setDialogInProgress] = React.useState<boolean>(false);
  const [formCustomFieldProps, setFormCustomFieldProps] = React.useState<ICustomFieldFormProps | undefined>(undefined);

  React.useEffect(() => {
    if (state?.aadId && !userDetails && me) {
      (async () => {
        try {
          setInProgress(true);
          let userData: IUserProfile | undefined;
          let customFieldsData: IDBCustomField[] | undefined;
          if (state.connectionId !== undefined) {
            [userData, customFieldsData] = await Promise.all([
              UserService.getUserByAadIdExt(Number(state.connectionId), state.aadId),
              CustomFieldService.getAllExt(Number(state.connectionId), state.aadId)
            ]);
          } else {
            [userData, customFieldsData] = await Promise.all([
              UserService.getUserById(state.aadId),
              CustomFieldService.getByUserId(state.aadId)
            ]);
          }
          setUserDetails(userData);
          setCustomFields(customFieldsData);
        } catch (error) {
          triggerError(error);
        } finally {
          setInProgress(false);
        }
      })();
    }
  }, [state, userDetails]);

  const copyUserProfile = () => {

    setTooltipOpen(true);
    setTimeout(() => {
      setTooltipOpen(false);
    }, 5000);

    if (userDetails) {
      var detailsToCopy = "";
      if (userDetails.GivenName && userDetails.SurName) {
        detailsToCopy += `Name: ${userDetails.GivenName} ${userDetails.SurName}\n`;
      }
      if (userDetails.DepartmentName) {
        detailsToCopy += `Organisation: ${userDetails.DepartmentName}\n`;
      }
      if (userDetails.JobTitle) {
        detailsToCopy += `Role: ${userDetails.JobTitle}\n`;
      }
      if (userDetails.OfficeLocation) {
        detailsToCopy += `Location: ${userDetails.OfficeLocation}\n`;
      }
      if (userDetails.Mail) {
        detailsToCopy += `Email Address: ${userDetails.Mail}\n`;
      }
      if (userDetails.MobilePhone) {
        detailsToCopy += `Mobile Phone: ${userDetails.MobilePhone}\n`;
      }
      if (userDetails.OfficePhone) {
        detailsToCopy += `Office Phone: ${userDetails.OfficePhone}\n`;
      }
      const deepLink =
        DeepLinkService.deepLinkToTab(
          env.TEAMS_APP_ID,
          env.TEAMS_TAB_ID_SEARCH,
          TEAMS_TAB.SEARCH.NAME,
          TEAMS_TAB.SEARCH.URL,
          { 
            aadId: userDetails.UserAadId, 
            connectionId: userDetails.PartnerOutgoingConnectionId 
          }
        );
      detailsToCopy += "\n" + deepLink;
      copyToClipboard(detailsToCopy, {
        format: "text/plain",
      });
    }
  };

  const onEditUserDetails = () => {
    if (userDetails) {
      return setFormEditUserDetailsProps({
        onSubmit: async (user: IUserProfile) => {
          try {
            setDialogInProgress(true);
            await UserService.updateUser(user);
            setUserDetails(user);
          } catch (error) {
            triggerError(error);
          } finally {
            setDialogInProgress(false);
          }
        },
        onCancel: () => setFormEditUserDetailsProps(undefined),
        formTitle: "Edit user details",
        confirmLabel: "Save",
        user: userDetails as IUserProfile,
        isMobile: isMobile,
        isAdminEdit: true
      });
    }
  };

  const onDeleteUser = () => {
    if (userDetails) {
      return setFormDeleteUserProps({
        onSubmit: async (user: IUserProfile) => {
          try {
            setDialogInProgress(true);
            if (user.Id) {
              await UserService.deleteUser(user.Id);
              history.goBack();
            }
            setUserDetails(user);
          } catch (error) {
            triggerError(error);
          } finally {
            setDialogInProgress(false);
          }
        },
        onCancel: () => setFormDeleteUserProps(undefined),
        formTitle: "Delete User",
        confirmLabel: "Delete",
        user: userDetails as IUserProfile
      });
    }
  };

  const onCreateCustomField = () => {
    return setFormCustomFieldProps({
      onSubmit: async (customField: IDBCustomField) => {
        try {
          setDialogInProgress(true);
          if (userDetails?.Id) {
            const createdCustomField = await CustomFieldService.addWithUserId(
              userDetails.Id,
              customField
            );
            if (createdCustomField) {
              setCustomFields([
                ...(customFields as IDBCustomField[]),
                createdCustomField,
              ]);
            }
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
          if (userDetails?.Id) {
            await CustomFieldService.updateWithUserId(
              userDetails.Id,
              updatedCustomField
            );
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
          }
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

  const getSpliButtonOptions = (upn: string, phoneNumber: string) => {
    const options: Array<{
      key: string;
      content: string;
      onClick: () => void;
    }> = [
        {
          key: "callUsingPhone",
          content: "Call using Phone",
          onClick: () => window.open(`tel:${phoneNumber}`),
        },
      ];
    if (meHasTeamsCalling && isMobile) {
      options.push({
        key: "callUsingTeamsVoice",
        content: "Call using Teams Voice",
        onClick: () => {
          const link = DeepLinkService.deepLinkTeamsCalling(phoneNumber);
          executeDeepLink(link);
        },
      });
    }
    return options;
  };

  return (
    <>
      {inProgress ? (
        <Flex hAlign={"center"} style={{ width: "100%" }}>
          <Loader />
        </Flex>
      ) : userDetails ? (
        <Flex column gap="gap.smaller">
          <Flex gap="gap.medium">
            <Button className={classes.buttonBack} iconPosition="before" icon={<ArrowLeftIcon />} text content="Back" onClick={() => history.goBack()} />
            {meIsAdmin && !state.connectionId ? (
              <MenuButton
                className={classes.buttonAdminControl}
                trigger={<Button iconOnly text icon={<MoreIcon />} title="Admin options" />}
                menu={[
                  {
                    icon: <EditIcon />,
                    content: userDetailsDisplayFields.buttonLabelEditDetails,
                    onClick: onEditUserDetails
                  },
                  {
                    icon: <TrashCanIcon />,
                    content: userDetailsDisplayFields.buttonLabelDeleteUser,
                    onClick: onDeleteUser
                  },
                  {
                    icon: <AddIcon />,
                    content: userDetailsDisplayFields.addNewInfoButtonLabel,
                    onClick: onCreateCustomField
                  }
                ]}
              />
            ) : null}
          </Flex>
          <Flex column gap="gap.medium">
            <Flex gap="gap.large">
              <Flex className={classes.avatarContainer}>
              <CustomAvatar aadId={state.aadId} connectionId={state.connectionId} name={userDetails.DisplayName} size={"largest"}/>
              {false ? ( // TODO - change to out of office check
              <PresenceStrokeIcon className={classes.presenceIcon}/>
              ) : null}
              </Flex>
              <Flex column gap="gap.smaller">
                <div className={classes.nameAndPronounContiner}>
                  <Text
                    content={userDetails.DisplayName}
                    size={"largest"}
                    weight="bold"
                  />
                  {userDetails.PreferredPronoun && (
                    <Text
                      content={userDetails.PreferredPronoun}
                      className={classes.textPronouns}
                      size={"small"}
                      weight="light"
                    />
                  )}
                </div>
                {userDetails.JobTitle && (
                  <Text
                    content={userDetails.JobTitle}
                    size={"larger"}
                    weight="semibold"
                  />
                )}
                {userDetails.DepartmentName && (
                  <Text content={userDetails.DepartmentName} />
                )}
                {userDetails.OfficeLocation && (
                  <Flex gap="gap.smaller">
                    <LocationIcon />
                    <Text content={userDetails.OfficeLocation} />
                    {/* <PresenceAvailableIcon
                        outline
                        size={"smaller"}
                        color={"green"}
                      /> */}
                  </Flex>
                )}
              </Flex>
            </Flex>

            <Flex className={isMobile ? classes.bodyContainerMobile : classes.bodyContainer} column gap="gap.medium">
              <Flex className={isMobile ? classes.actionContainerMobile : classes.actionContainer} gap="gap.small">
                <Button
                  icon={<CallVideoIcon />}
                  className={classes.buttonAction}
                  primary
                  content="Video"
                  onClick={() => {
                    const link = DeepLinkService.deepLinkVideoWithUser(userDetails.UserPrincipalName);
                    executeDeepLink(link);
                  }}
                />
                <Button
                  icon={<CallIcon />}
                  className={classes.buttonAction}
                  primary
                  content="Call"
                  onClick={() => {
                    const link = DeepLinkService.deepLinkCallTeamsWithUser(userDetails.UserPrincipalName);
                    executeDeepLink(link);
                  }}
                />
                <Button
                  icon={<ChatIcon />}
                  className={classes.buttonAction}
                  primary
                  content="Chat"
                  onClick={() => {
                    const link = DeepLinkService.deepLinkChatWithUser(userDetails.UserPrincipalName);
                    executeDeepLink(link);
                  }}
                />
                <Button
                  icon={<CalendarIcon />}
                  className={classes.buttonAction}
                  primary
                  content="Meet"
                  onClick={() => {
                    const link = DeepLinkService.deepLinkMeetingDialog(userDetails.UserPrincipalName)
                    executeDeepLink(link);
                  }}
                />
              </Flex>
              {userDetails.Mail && (
                <Flex gap="gap.large">
                  <Flex column>
                    <Text
                      content={userDetailsDisplayFields.emailAddressLabelField}
                      weight="bold"
                    />
                    <Text content={userDetails.Mail} />
                  </Flex>
                  {/* <Button
                    icon={<EmailIcon outline />}
                    content="Email"
                    onClick={() => window.open(`mailto:${userDetails.Mail}`)}
                  /> */}
                </Flex>
              )}
              {userDetails.MobilePhone && (
                <Flex gap="gap.large">
                  <Flex column>
                    <Text
                      content={userDetailsDisplayFields.mobileNumberLabelField}
                      weight="bold"
                    />
                    <Text content={userDetails.MobilePhone} />
                  </Flex>
                  {isMobile ? (
                    <SplitButton
                      className={classes.splitButtonCall}
                      primary
                      menu={getSpliButtonOptions(
                        userDetails.UserPrincipalName,
                        userDetails.MobilePhone
                      )}
                      align="end"
                      button={{
                        content: "Call",
                        onClick: () => {
                          const link = DeepLinkService.deepLinkTeamsCalling(userDetails.MobilePhone);
                          executeDeepLink(link);
                        },
                        icon: <CallIcon outline />
                      }}
                    />
                    // TODO implement teams calling logic here - hasUserTeamsCallingLicense
                  ) : true ? (
                    <Button
                      icon={<CallIcon outline />}
                      primary
                      className={classes.desktopButtonCall}
                      content="Call"
                      onClick={() => {
                        const link = DeepLinkService.deepLinkTeamsCalling(userDetails.MobilePhone)
                        executeDeepLink(link);
                      }}
                    />
                  ) : null}

                </Flex>
              )}
              {userDetails.OfficePhone && (
                <Flex gap="gap.large">
                  <Flex column>
                    <Text
                      content={userDetailsDisplayFields.deskNumberLabelField}
                      weight="bold"
                    />
                    <Text content={userDetails.OfficePhone} />
                  </Flex>
                  {isMobile ? (

                    <SplitButton
                      className={classes.splitButtonCall}
                      primary
                      menu={getSpliButtonOptions(
                        userDetails.UserPrincipalName,
                        userDetails.OfficePhone
                      )}
                      align="end"
                      button={{
                        content: "Call",
                        onClick: () => {
                          const link = DeepLinkService.deepLinkTeamsCalling(userDetails.OfficePhone);
                          executeDeepLink(link);
                        },
                        icon: <CallIcon outline />
                      }}
                    />
                  // TODO implement teams calling logic here - hasUserTeamsCallingLicense
                  ) : true ? (
                    <Button
                      icon={<CallIcon outline />}
                      primary
                      className={classes.desktopButtonCall}
                      content="Call"
                      onClick={() => {
                        const link = DeepLinkService.deepLinkTeamsCalling(userDetails.OfficePhone)
                        executeDeepLink(link);
                      }}
                    />
                  ) : null}

                </Flex>
              )}

              {customFields && customFields?.length ? (
                <>
                  {meIsAdmin ? (
                    <>
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
                                  disabled={inProgress}
                                  className={classes.buttonEditAndRemoveCustomField}
                                  onClick={() => onEditCustomField(customFieldItem)}
                                />
                                <Button
                                  text
                                  primary
                                  icon={<TrashCanIcon />}
                                  iconOnly
                                  disabled={inProgress}
                                  className={classes.buttonEditAndRemoveCustomField}
                                  onClick={() =>
                                    onDeleteCustomField(customFieldItem)
                                  }
                                />
                                {/* TODO add in length validation check error here e.g. name is too long / cant be empty*/}
                              </Flex>
                            </Flex>
                          </Flex>
                        );
                      })}
                    </>
                  ) : (
                    <>
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
                              <Text className={classes.customFieldValue} content={customFieldItem.Value} />
                            </Flex>
                          </Flex>
                        );
                      })}
                    </>
                  )}
                </>
              ) : null}
              {/* This button is hidden, because Teams Message Extension will not be implemented at this time */}
              <Tooltip
                open={TooltipOpen}
                pointing
                content={
                  <Flex gap="gap.smaller">
                    <Text> Profile details have been copied to your clipboard </Text>
                    <Button
                      icon={<CloseIcon size={"medium"} />}
                      text
                      iconOnly
                      onClick={() => setTooltipOpen(false)}
                      className={classes.buttonAdminControl}
                    />
                  </Flex>
                }
                trigger={
                  <Button
                    icon={<ShareGenericIcon size={"medium"} />}
                    disabled={inProgress}
                    text
                    onClick={copyUserProfile}
                    content={userDetailsDisplayFields.shareProfileButtonLabel}
                    className={classes.buttonShareProfile}
                  />
                } />
            </Flex>
          </Flex>
        </Flex>
      ) : null
      }
      {formEditUserDetailsProps && (
        <UserDetailsForm
          {...formEditUserDetailsProps}
          inProgress={dialogInProgress}
        />
      )}
      {formDeleteUserProps && (
        <UserDeleteConfirmation
          {...formDeleteUserProps}
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


export default withRouter(DetailedUserPage);