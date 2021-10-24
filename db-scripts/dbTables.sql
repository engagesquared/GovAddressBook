--DROP TABLE [dbo].[PartnerIncomingConnection]
--DROP TABLE [dbo].[FavoriteInternal]
--DROP TABLE [dbo].[FavoriteExternal]
--DROP TABLE [dbo].[CustomField]
--DROP TABLE [dbo].[PartnerOutgoingConnection]
--DROP TABLE [dbo].[UserProfileInternal]
--DROP TABLE [dbo].[UserProfileExternal]


CREATE TABLE [dbo].[UserProfileInternal] (
    [UserProfileInternalId] INT PRIMARY KEY IDENTITY (1, 1),

    [UserAadId] NVARCHAR (50) NOT NULL,
    [DisplayName] NVARCHAR (50) NOT NULL,
    [GivenName] NVARCHAR (50) NOT NULL,
    [SurName] NVARCHAR (50) NOT NULL,
    [PreferredPronoun] NVARCHAR (50) NULL,
    [UserPrincipalName] NVARCHAR (255) NOT NULL,
    [MailNickname] NVARCHAR (255) NOT NULL,
    [Mail]  NVARCHAR (255) NULL,
    [OfficePhone] NVARCHAR (50) NULL,
    [MobilePhone] NVARCHAR (50) NULL,
    [JobTitle] NVARCHAR (50) NULL,
    [DepartmentName] NVARCHAR (50) NULL,
    [OfficeLocation] NVARCHAR (50) NULL,
    [OutOfOffice] BIT NULL DEFAULT 0,
    [WelcomeTourCompleted] BIT NULL DEFAULT 0,
    [Published] BIT NULL DEFAULT 0
);
GO

CREATE TABLE [dbo].[PartnerIncomingConnection] (
    [PartnerIncomingConnectionId] INT PRIMARY KEY IDENTITY (1, 1),

    [Name]  NVARCHAR (50) NOT NULL,
    [APIKey] NVARCHAR (50) NOT NULL,
    [WhitelistIPAddress] NVARCHAR (255) NOT NULL,
);
GO

CREATE TABLE [dbo].[PartnerOutgoingConnection] (
    [PartnerOutgoingConnectionId] INT PRIMARY KEY IDENTITY (1, 1),

    [Name]  NVARCHAR (50) NOT NULL,
    [APIKey] NVARCHAR (50) NOT NULL,
    [EndpointURLOrIPAddress] NVARCHAR (255) NOT NULL,
);
GO

CREATE TABLE [dbo].[UserProfileExternal] (
    [UserProfileExternalId] INT PRIMARY KEY IDENTITY (1, 1),

    [UserAadId] NVARCHAR (50) NOT NULL,
    [UserPrincipalName] NVARCHAR (255) NOT NULL,
    [DisplayName] NVARCHAR (50) NOT NULL,
    [GivenName]  NVARCHAR (50) NOT NULL,
    [SurName] NVARCHAR (50) NOT NULL,
    [JobTitle] NVARCHAR (50) NULL,
    [PartnerOutgoingConnectionId] INT NOT NULL,
	
	CONSTRAINT FK_UserProfileExternal_To_PartnerOutgoingConnection FOREIGN KEY (PartnerOutgoingConnectionId) REFERENCES PartnerOutgoingConnection (PartnerOutgoingConnectionId) ON DELETE CASCADE
);
GO

CREATE TABLE [dbo].[FavoriteInternal] (
	[UserProfileInternalId]  INT NOT NULL,
    [UserProfileInternalFavoriteId]  INT NOT NULL,
	
	CONSTRAINT FavoriteInternalId PRIMARY KEY (UserProfileInternalId, UserProfileInternalFavoriteId),
	CONSTRAINT FK_FavoriteInternal_To_UserProfileInternal FOREIGN KEY (UserProfileInternalId) REFERENCES UserProfileInternal (UserProfileInternalId) ON DELETE CASCADE,
	CONSTRAINT FK_FavoriteInternal_To_UserProfileInternalFavorite FOREIGN KEY (UserProfileInternalFavoriteId) REFERENCES UserProfileInternal (UserProfileInternalId) ON DELETE NO ACTION
);
GO

CREATE TABLE [dbo].[FavoriteExternal] (
    [UserProfileInternalId]  INT NOT NULL,
	[UserProfileExternalFavoriteId]  INT NOT NULL,
	
	CONSTRAINT FavoriteExternalId PRIMARY KEY (UserProfileInternalId, UserProfileExternalFavoriteId),
	CONSTRAINT FK_FavoriteExternal_To_UserProfileInternal FOREIGN KEY (UserProfileInternalId) REFERENCES UserProfileInternal (UserProfileInternalId) ON DELETE CASCADE,
	CONSTRAINT FK_FavoriteExternal_To_UserProfileExternalFavorite FOREIGN KEY (UserProfileExternalFavoriteId) REFERENCES UserProfileExternal (UserProfileExternalId) ON DELETE CASCADE
);
GO

CREATE TABLE [dbo].[CustomField] (
    [CustomFieldId] INT PRIMARY KEY IDENTITY (1, 1),

    [Code]  NVARCHAR (50) NOT NULL,
    [DisplayName] NVARCHAR (50) NOT NULL,
    [Value]  NVARCHAR (255) NOT NULL,
    [Visibility]  BIT NULL DEFAULT 0,
    [UserProfileInternalId]  INT NULL
	
	CONSTRAINT FK_CustomField_To_UserProfileInternal FOREIGN KEY (UserProfileInternalId) REFERENCES UserProfileInternal (UserProfileInternalId) ON DELETE CASCADE
);
GO