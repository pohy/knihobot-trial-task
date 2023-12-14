import nock from 'nock'
import { bookPriceUrl, openLibraryUrl } from 'Config/apiUrls'
import * as ISBN from 'isbn3'
import { faker } from '@faker-js/faker'

export function mockGetBookPricePrice(bookFound = true) {
  return nock(bookPriceUrl)
    .get('/price')
    .query(true)
    .reply((uri, _) => {
      console.log('uri', uri)
      console.log('body', _)
      const [, search] = uri.split('?')
      if (!search) {
        return [400]
      }
      const query = new URLSearchParams(search)
      const isbn13 = ISBN.asIsbn13(query.get('isbn_13') ?? '')

      if (!isbn13) {
        return [400]
      }

      faker.seed(Number.parseInt(isbn13, 10))

      if (bookFound) {
        return [200, { price: faker.number.int({ min: 10, max: 5000 }) }]
      }
      return [404]
    })
}

export function mockGetOpenLibraryBook(isbns: string[], title?: string) {
  return nock(openLibraryUrl)
    .get((uri) => isbns.some((isbn) => uri.includes(`/isbn/${isbn}.json`)))
    .reply(() => {
      if (title) {
        return [200, { title }]
      }
      return [404]
    })
}
