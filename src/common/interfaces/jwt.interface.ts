export interface IJwtService {
    verifyAsync(token: string): Promise<unknown>;
}
