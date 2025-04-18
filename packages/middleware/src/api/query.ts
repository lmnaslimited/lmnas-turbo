import { Iquery } from "../types/types";
import { client } from '../lib/apollo-client';
import { gql } from "@apollo/client";
import { clQueryTrends } from "./trends";
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


// Extend this map as you add more content types and their corresponding queries
const queryMap: Record<string, new () => clQuery<any>> = {
    trend: clQueryTrends,
  };
  
  export class QueryFactory {
    static create<T>(contentType: string): clQuery<T> {
      const QueryClass = queryMap[contentType.toLowerCase()];
      if (!QueryClass) {
        throw new Error(`No query defined for content type: ${contentType}`);
      }
      return new QueryClass() as clQuery<T>;
    }
  }