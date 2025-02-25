export interface ITokenResponse {
    accessToken: string;
}

export interface IAuthPayload {
    id: string;
    role: string;
}

export enum TokenType {
    ACCESS_TOKEN = 'AccessToken',
}
