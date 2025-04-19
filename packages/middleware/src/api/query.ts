import { Iquery, TtrendsPageSource } from "../types";
import { client } from '../lib/apollo-client';
import { gql } from "@apollo/client";

// The clQuery class implements the Iquery interface and provides a base implementation for executing GraphQL queries.
export abstract class clQuery<T> implements Iquery<T> {
    query: string;
    locale: string;
    iDvaribles: {}
    // The getQuery method is abstract and must be implemented by subclasses to return the actual GraphQL query string. 
    abstract getQuery(): string;
    
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
// The clQueryTrends class extends the clQuery class and provides a specific implementation for the "Trends" query.

export class clQueryTrends extends clQuery<TtrendsPageSource> {
  constructor() {
    super();
  }

  getQuery(): string {
    return `
      query Trend($locale: I18NLocaleCode) {
        trend(locale: $locale) {
          heroSection {
            heading {
              title
              subtitle
              highlight
            }
            description
            buttons {
              label
              href
              icon
              formMode
            }
          }
        }
      }
    `;
  }

  async executeQuery(): Promise<TtrendsPageSource> {
    return super.executeQuery();
  }
}
export class clQueryFactory {
  private static queryMap: { [key: string]: new () => Iquery<any> } = {
    "Trends": clQueryTrends,
    // Add more mappings here
  };

  static createQuery<T extends object>(queryType: string): Iquery<T> {
    const QueryClass = this.queryMap[queryType];
    if (!QueryClass) throw new Error(`Invalid query type: ${queryType}`);
    return new QueryClass();
  }
}