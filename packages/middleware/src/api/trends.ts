import { TtrendsPageSource } from './../types/typesSource'
import { clQuery } from './query'
import { ArrowRight, ChevronRight, Linkedin, Mail, Twitter, Youtube } from "lucide-react";


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