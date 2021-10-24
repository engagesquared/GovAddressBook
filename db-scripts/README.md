# Introduction

This will be used as the structured data storage layer for user profiles. The following tables are proposed: 
1. UserProfileInternal - users info from current tenant, who uses app.
2. UserProfileExternal - users info from other tenants, which was added to favourites.
3. FavoriteInternal - junction table for UserProfileInternal (many-to-many).
4. FavoriteExternal - junction table for UserProfileInternal and UserProfileExternal (many-to-many).
5. PartnerIncomingConnection - stores API Keys and URL Endpoints for other partners/tenants to read user profiles from current tenant.
6. PartnerOutgoingConnection - stores API Keys and URL Endpoints for current tenant to read user profiles from other partners.
7. CustomFields – allows user to extend their profile with more custom fields that are not returned from Graph API.
