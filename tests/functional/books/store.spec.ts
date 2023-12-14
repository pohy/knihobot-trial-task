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

test.group('POST /books validates ISBN', (group) => {
  group.each.setup(() => {
    mockGetBookPricePrice(false)
    mockGetOpenLibraryBook(validIsbns)
  })

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

  })
})
