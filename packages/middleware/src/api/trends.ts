import { TtrendsPageSource } from './../types/typesSource'
import { clQuery } from './query'

const trendsPageStructure: TtrendsPageSource = {
    heroSection: {
        heading: {
            title: '', subtitle: '', highlight: '', badge: ''
        },
        description:'',
        buttons: []
    }
}

class clQueryTrends extends clQuery {
    query: string
    constructor(){
        super()

    }
    getQuery(): string {
        let queryString = `query Trend($locale: I18NLocaleCode) {
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
}`
  return queryString   
    }
}