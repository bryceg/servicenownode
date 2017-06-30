import * as request from 'request';

export class RequestUtil {

    public static post(uri: string, body: any, options?: request.CoreOptions): Promise<IRequestResponse> {
        options = RequestUtil.setOptions(options);
        options.body = body;

        return new Promise<IRequestResponse>((resolve, reject) => {
            request.post(uri, options,
                (err, response, b) => {
                    if (err || response.statusCode >= 400) {
                        reject(err);
                    }
                    else {
                        resolve({
                            response: response,
                            body: b
                        });
                    }
                });
        });
    }

    public static get(uri: string, options?: request.CoreOptions): Promise<IRequestResponse> {
        options = RequestUtil.setOptions(options);

        return new Promise<IRequestResponse>((resolve, reject) => {
            request.get(uri, options,
                (err, response, body) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve({
                            response: response,
                            body: body
                        });
                    }
                });
        });
    }

    static setOptions(options?: request.CoreOptions): request.CoreOptions {
        let o = options;
        const defaultHeaders = { 'Accept': 'application/json' };

        if (options) {
            o.headers = {
                ...options.headers,
                ...defaultHeaders
            }
        }
        else {
            o = {
                headers: defaultHeaders
            };
        }

        return o;
    }
}

export interface IRequestResponse {
    response: request.RequestResponse;
    body: string;
}