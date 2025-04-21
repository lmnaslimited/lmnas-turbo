import { IQuery, TtrendsPageSource } from "../types";
import { client } from '../lib/apollo-client';
import { gql } from "@apollo/client";

// The clQuery class implements the Iquery interface and provides a base implementation for executing GraphQL queries.
export abstract class clQuery<DynamicSourceType> implements IQuery<DynamicSourceType> {
    query: string;
    contentType: string;
    locale: string;
    variables: {}
    // The getQuery method is abstract and must be implemented by subclasses to return the actual GraphQL query string. 
    abstract getQuery(): string;
    
    async executeQuery(): Promise<DynamicSourceType> {
      // Set params of the query
      this.setVariables({locale: this.locale})
      const { data } = await client.query({
        query:gql`${this.query}`,
        variables: this.variables || {},
      });    
      return (data) as DynamicSourceType;   
    }
    setVariables(variables: Record<string, any>): void {
      this.variables = variables;
    }
    constructor(iContentType: string){
        this.contentType = iContentType
        this.query = this.getQuery()
    }
}
// The clQueryTrends class extends the clQuery class and provides a specific implementation for the "Trends" query.

export class clQueryTrends extends clQuery<TtrendsPageSource> {
  constructor(iContentType: string) {
    super(iContentType);
  }

  getQuery(): string {
    return `
      query Trend($locale: I18NLocaleCode) {
        ${this.contentType}(locale: $locale) {
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
  private static queryMap: { [key: string]: new (icontentType: string) => IQuery<any> } = {
    "trend": clQueryTrends,
    // Add more mappings here
  };

  static createQuery<T extends object>(iContentType: string): IQuery<T> {
    const QueryClass = this.queryMap[iContentType];
    if (!QueryClass) throw new Error(`Invalid query type: ${iContentType}`);
    return new QueryClass(iContentType);
  }
}