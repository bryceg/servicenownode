import { ServiceNowAuth } from './auth';
import { RequestUtil } from './requestutil';

export class ServiceNowQuery {
    query: string;
    page: number;
    limit: number;
    orderByField: string;
    orderByDescSet: boolean;
    uri: string;

    constructor(private table: string, private auth: ServiceNowAuth) {
        this.uri = auth.uri;
    }

    public setTable(name: string): ServiceNowQuery {
        this.table = name;
        return this;
    }

    public and(field: string, value: string, operator?: string): ServiceNowQuery {
        if (!this.query) {
            this.query = '';
        }
        else {
            this.query += '^';
        }

        this.query += `${field}${operator || '='}${value}`;
        return this;
    }

    public or(field: string, value: string, operator?: string): ServiceNowQuery {
        this.query += `^OR${field}${operator || '='}${value}`;
        return this;
    }

    public setLimit(limit: number): ServiceNowQuery {
        this.limit = limit;
        return this;
    }

    public setPage(page: number): ServiceNowQuery {
        this.page = page;
        return this;
    }

    public orderBy(field: string): ServiceNowQuery {
        this.orderByField = field;
        this.orderByDescSet = false;
        return this;
    }

    public orderByDesc(field: string): ServiceNowQuery {
        this.orderByField = field;
        this.orderByDescSet = true;
        return this;
    }

    public execute<T>(): Promise<IQueryResult<T>> {
        return this.queryEntities<T>(this.table, this.query, this.orderByField, this.orderByDescSet, this.limit, this.page);
    }
    
    public async queryEntities<T>(
        table: string, 
        query?: string,
        orderBy?: string, 
        orderDescending?: boolean,
        limit?: number, 
        page?: number): Promise<IQueryResult<T>> {

        let token = await this.auth.auth();

        if(!token){
            throw 'Invalid Token for ServiceNow';
        }

        let uri = `${this.uri}/api/now/table/${table}?sysparm_display_value=all`;

        if (limit) {
            uri += `&sysparm_limit=${limit}`;
        }

        if (page != undefined) {
            if (page < 0) {
                page = 0;
            }
            uri += `&sysparm_offset=${(page) * limit}`;
        }

        if (orderBy) {
            query += `^${orderDescending ? 'ORDERBYDESC' : 'ORDERBY'}${orderBy}`;
        }

        if (query) {
            uri += `&sysparm_query=${encodeURIComponent(query)}`;
        }

        return RequestUtil.get(uri, {auth: {bearer: token.access_token}})
            .then(r => {
                if (r.response.statusCode < 400) {
                    let result: IQueryResult<T> = {
                        result: (JSON.parse(r.body)).result,
                        total: parseInt(r.response.headers['x-total-count'] as string),
                        page: page,
                        limit: limit
                    }
                    return result;
                }
                else {
                    throw JSON.stringify(r.body);
                }
            })
    }

    public async getEntity<T>(sys_id: string): Promise<T> {
        let token = await this.auth.auth();

        let uri = `${this.uri}/api/now/table/${this.table}/${sys_id}?sysparm_display_value=all`;

        return RequestUtil.get(uri, {auth: {bearer: token.access_token}})
            .then(response => {
                if (response.response.statusCode == 404) {
                    return null;
                }
                else if (response.response.statusCode < 400) {
                    return <T>(JSON.parse(response.body)).result;
                }
                else {
                    throw response;
                }
            });
    }
}

export interface IQueryResult<T> {
    result: Array<T>;
    page?: number;
    limit?: number;
    total?: number;
}