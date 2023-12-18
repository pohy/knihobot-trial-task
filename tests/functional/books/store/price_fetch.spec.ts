import { test } from '@japa/runner'
import { generateIsbn13 } from '../../../test_helpers/isbn'
import { mockGetBookPricePrice, mockGetOpenLibraryBook } from '../../../test_helpers/mocks'

test.group('POST /books fetches price', (group) => {
  const isbn = generateIsbn13()

  group.each.setup(() => {
    mockGetOpenLibraryBook([isbn])
  })

  test('returns null price when the price API did not find price', async ({ client }) => {
    mockGetBookPricePrice(false)

    const response = await client.post('/books').json({ isbn, condition: 'new' })

    response.assertBodyContains({ price_base: null })
  })

  test('returns same price for the same ISBN', async ({ client }) => {
    mockGetBookPricePrice(true)
    const response1 = await client.post('/books').json({ isbn, condition: 'new' })

    mockGetBookPricePrice(true)
    const response2 = await client.post('/books').json({ isbn, condition: 'new' })

    response1.assertBodyContains({ price_base: response2.body().price_base })
  })
})
