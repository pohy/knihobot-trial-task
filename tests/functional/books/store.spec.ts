import { test } from '@japa/runner'
import { mockGetBookPricePrice, mockGetOpenLibraryBook } from '../../test_helpers/mocks'

const isbns = {
  invalid: '123',
  gpuGemsIsbn10: '0321515269',
  gpuGemsIsbn10Hyphenated: '0-321-51526-9',
  gpuGemsIsbn13: '9780321515261',
  gpuGemsIsbn13Hyphenated: '978-0321515261',
}
const validIsbns = [
  isbns.gpuGemsIsbn10,
  isbns.gpuGemsIsbn10Hyphenated,
  isbns.gpuGemsIsbn13,
  isbns.gpuGemsIsbn13Hyphenated,
]
const title = 'GPU Gems 3'

test.group('POST /books validates ISBN', () => {
  test('returns 400 on invalid ISBN', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: '123' })

    response.assertStatus(400)
  })

  test('parses ISBN10', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: isbns.gpuGemsIsbn10 })

    response.assertStatus(202)
    response.assertBodyContains({
      isbn_10: isbns.gpuGemsIsbn10,
      isbn_13: isbns.gpuGemsIsbn13,
    })
  })

  test('parses hyphenated ISBN10', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: isbns.gpuGemsIsbn10Hyphenated })

    response.assertStatus(202)
    response.assertBodyContains({
      isbn_10: isbns.gpuGemsIsbn10,
      isbn_13: isbns.gpuGemsIsbn13,
    })
  })

  test('parses ISBN13', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: isbns.gpuGemsIsbn13 })

    response.assertStatus(202)
    response.assertBodyContains({
      isbn_10: isbns.gpuGemsIsbn10,
      isbn_13: isbns.gpuGemsIsbn13,
    })
  })

  test('parses hyphenated ISBN13', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: isbns.gpuGemsIsbn13Hyphenated })

    response.assertStatus(202)
    response.assertBodyContains({
      isbn_10: isbns.gpuGemsIsbn10,
      isbn_13: isbns.gpuGemsIsbn13,
    })
  })
})

test.group('POST /books fetches price', () => {
  test('returns null price when the price API did not find price', async ({ client }) => {
    mockGetBookPricePrice(false)

    const response = await client
      .post('/books')
      .json({ isbn: isbns.gpuGemsIsbn13, condition: 'new' })

    response.assertBodyContains({ price_base: null })
  })

  test('returns same price for the same ISBN', async ({ client }) => {
    mockGetBookPricePrice(true)

    const response1 = await client
      .post('/books')
      .json({ isbn: isbns.gpuGemsIsbn13, condition: 'new' })
    const response2 = await client
      .post('/books')
      .json({ isbn: isbns.gpuGemsIsbn13, condition: 'new' })

    response1.assertBodyContains({ price_base: response2.body().price_base })
  })
})

test.group('POST /books with appropriate HTTP response when title or price is found or not', () => {
  test('returns 202 when title is not found', async ({ client }) => {
    mockGetOpenLibraryBook(validIsbns)

    const response = await client
      .post('/books')
      .json({ isbn: isbns.gpuGemsIsbn13, condition: 'new' })

    response.assertStatus(202)
    response.assertBodyContains({
      title: null,
    })
  })

  test('returns 202 when price is not found', async ({ client }) => {
    mockGetBookPricePrice(true)

    const response = await client
      .post('/books')
      .json({ isbn: isbns.gpuGemsIsbn13, condition: 'new' })

    response.assertStatus(202)
    response.assertBodyContains({
      price_base: null,
      price_factored_by_condition: null,
    })
  })

  test('returns 200 when title and price are found', async ({ client, assert }) => {
    mockGetBookPricePrice(true)
    mockGetOpenLibraryBook(validIsbns, title)

    const response = await client
      .post('/books')
      .json({ isbn: isbns.gpuGemsIsbn13, condition: 'new' })
    const body = response.body()

    response.assertStatus(200)
    assert.isAbove(body.price_base, 0)
    assert.equal(body.title, title)
  })
})

