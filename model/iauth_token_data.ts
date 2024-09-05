export interface IAuthTokenData {
    user_id: number;
    email: string;
    login_permission: boolean;
    // further permissions, e.g. for specific sites or APIs, are added here
}
