import { test } from '@japa/runner'
import { BookCondition } from 'App/Models/Book'

test.group('POST /books validates ISBN', () => {
  const condition = BookCondition.new
  const isbns = {
    gpuGemsIsbn10: '0321515269',
    gpuGemsIsbn10Hyphenated: '0-321-51526-9',
    gpuGemsIsbn13: '9780321515261',
    gpuGemsIsbn13Hyphenated: '978-0321515261',
  }

  test('returns 422 on invalid ISBN', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: '123', condition })

    response.assertStatus(422)
  })

  test('parses ISBN10', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: isbns.gpuGemsIsbn10, condition })

    response.assertBodyContains({
      isbn_10: isbns.gpuGemsIsbn10,
      isbn_13: isbns.gpuGemsIsbn13,
    })
  })

  test('parses hyphenated ISBN10', async ({ client }) => {
    const response = await client
      .post('/books')
      .json({ isbn: isbns.gpuGemsIsbn10Hyphenated, condition })

    response.assertBodyContains({
      isbn_10: isbns.gpuGemsIsbn10,
      isbn_13: isbns.gpuGemsIsbn13,
    })
  })

  test('parses ISBN13', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: isbns.gpuGemsIsbn13, condition })

    response.assertBodyContains({
      isbn_10: isbns.gpuGemsIsbn10,
      isbn_13: isbns.gpuGemsIsbn13,
    })
  })

  test('parses hyphenated ISBN13', async ({ client }) => {
    const response = await client
      .post('/books')
      .json({ isbn: isbns.gpuGemsIsbn13Hyphenated, condition })

    response.assertBodyContains({
      isbn_10: isbns.gpuGemsIsbn10,
      isbn_13: isbns.gpuGemsIsbn13,
    })
  })
})
