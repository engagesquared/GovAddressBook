export interface IMailboxSettings {
    automaticRepliesSetting: {
        status: "disabled" | "alwaysEnabled" | "scheduled";
        externalAudience: "none" | "contactsOnly" | "all";
        internalReplyMessage: string;
        externalReplyMessage: string;
        scheduledStartDateTime: {
            dateTime: string;
            timeZone: string;
        };
        scheduledEndDateTime: {
            dateTime: string;
            timeZone: string;
        };
    }
}