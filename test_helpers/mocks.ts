import nock from 'nock'
import { bookPriceUrl, openLibraryUrl } from 'Config/apiUrls'
import * as ISBN from 'isbn3'
import { faker } from '@faker-js/faker'

// TODO: I think it would be more sensible to pass a desired price, instead of generating a random one
export function mockGetBookPricePrice(bookFound = true) {
  // TODO: How about implementing the "mock" endpoint inside the app which will fail randomly and return a random price.
  //  And for the testing mock to be deterministic?
  return nock(bookPriceUrl)
    .get('/price')
    .query(true)
    .reply((uri, _) => {
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

      // TODO: The requirement states that the API should fail half the time
      //  But that's hard to test :))
      if (bookFound) {
        return [200, { price: faker.number.int({ min: 10, max: 5000 }) }]
      }
      return [404]
    })
}

export function mockGetOpenLibraryBook(isbns: string[], title?: string) {
  // TODO: We would like to mock all calls to the external API
  //  We either have to call this method before each test case, or make this mock persistent?
  return nock(openLibraryUrl)
    .get((uri) => isbns.some((isbn) => uri.includes(`/isbn/${isbn}.json`)))
    .reply(() => {
      if (title) {
        return [200, { title }]
      }
      return [404]
    })
}
