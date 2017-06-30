import * as querystring from 'querystring';
import { RequestUtil } from './requestutil';

export class ServiceNowAuth {
    token: IServiceNowOAuthToken;
    tokenObtained: Date;
    token_expires: number;

    constructor(public uri: string, private clientId: string, private clientSecret: string, private userName: string, private password: string){
    }

    public async auth(): Promise<IServiceNowOAuthToken> {
        if (this.hasValidToken()) {
            return this.token;
        }

        let body: string;
        if (this.token) {
            body = querystring.stringify({
                grant_type: 'refresh_token',
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token: this.token.refresh_token
            });
        }
        else {
            body = querystring.stringify({
                grant_type: 'password',
                client_id: this.clientId,
                client_secret: this.clientSecret,
                username: this.userName,
                password: this.password
            });
        }

        try {
            let tokenBody = await RequestUtil.post(`${this.uri}/oauth_token.do`, body, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            this.token = JSON.parse(tokenBody.body);
            this.token_expires = (new Date()).setSeconds(this.token.expires_in);
            return this.token;            
        }
        catch (e) {
            console.error('failed to get oauth token from servicenow: ' + e);
            throw e;
        }
    }

    public hasValidToken(): boolean {
        if (!this.token || (new Date()).setSeconds(300) > this.token_expires) return false;

        return true;
    }
}

export interface IServiceNowOAuthToken {
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    expires_in: number;
}