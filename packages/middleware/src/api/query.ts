import { Iquery } from "../types/types";
import { client } from '../lib/apollo-client';
import { gql } from "@apollo/client";
export abstract class clQuery<T> implements Iquery<T> {
    query: string;
    locale: string;
    iDvaribles: {}

    abstract getQuery(): string;
    // The getQuery method is abstract and must be implemented by subclasses to return the actual GraphQL query string. 
    async executeQuery(): Promise<T> {
            const { data } = await client.query({
            query:gql`${this.query}`
        });    
        return (data) as T;   
    }
    constructor(){
        this.query = this.getQuery()
    }
}