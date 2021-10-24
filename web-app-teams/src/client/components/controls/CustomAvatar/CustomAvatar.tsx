import * as React from "react"
import { Avatar, AvatarProps, Button } from "@fluentui/react-northstar";
import UserService from "../../../services/UserService";
import { useErrorHandling } from "../ErrorBoundary/ErrorBoundary";

export interface ICustomAvatarProps extends AvatarProps {
    aadId: string;
    connectionId?: number | undefined;
}

const userPhotoPromises = {};
export const CustomAvatar = (props: ICustomAvatarProps) => {
    const triggerError = useErrorHandling();
    const [ photo, setPhoto ] = React.useState<string | undefined>();

    React.useEffect(() => {
        (async () => {
            try {
                if(!userPhotoPromises[props.aadId]){
                    if(props.connectionId !== undefined){
                        userPhotoPromises[props.aadId] = UserService.getUserPhotoByAadIdExt(props.connectionId, props.aadId);
                    } else {
                        userPhotoPromises[props.aadId] = UserService.getUserPhoto(props.aadId);
                    }
                }
                const blob = await userPhotoPromises[props.aadId] as (Blob | undefined);
                if(blob && blob.size){
                    const userPhoto = URL.createObjectURL(blob);
                    setPhoto(userPhoto);
                }
            } catch (e) {
                triggerError(e);
            }
        })();
    },[props.aadId, props.connectionId]);

    return (<Avatar {...props} image={photo || undefined} />)
}