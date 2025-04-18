import { Iquery } from "../types/types";
import { client } from '../lib/apollo-client';
export abstract class clQuery implements Iquery {
    query: string;
    abstract getQuery(): string;
    async executeQuery(): Promise<T> {
        
    }
    constructor(){
        this.query = this.getQuery()
    }
}