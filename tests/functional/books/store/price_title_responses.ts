import { test } from '@japa/runner'
import { generateIsbn13 } from '../../../../test_helpers/isbn'
import { mockGetBookPricePrice, mockGetOpenLibraryBook } from '../../../../test_helpers/mocks'

test.group('POST /books with appropriate HTTP response when title or price is found or not', () => {
  const title = 'GPU Gems 3'
  const isbn = generateIsbn13()

  test('returns 202 when title is not found', async ({ client }) => {
    mockGetBookPricePrice(true)
    mockGetOpenLibraryBook([isbn])

    const response = await client.post('/books').json({ isbn, condition: 'new' })

    response.assertStatus(202)
    response.assertBodyContains({
      title: null,
    })
  })

  test('returns 202 when price is not found', async ({ client }) => {
    mockGetOpenLibraryBook([isbn], title)
    mockGetBookPricePrice(false)

    const response = await client.post('/books').json({ isbn, condition: 'new' })

    response.assertStatus(202)
    response.assertBodyContains({
      price_base: null,
      price_factored_by_condition: null,
    })
  })

  test('returns 200 when title and price are found', async ({ client, assert }) => {
    mockGetBookPricePrice(true)
    mockGetOpenLibraryBook([isbn], title)

    const response = await client.post('/books').json({ isbn, condition: 'new' })
    const body = response.body()

    response.assertStatus(200)
    assert.isAbove(body.price_base, 0)
    assert.equal(body.title, title)
  })
})
