import { test } from '@japa/runner'

test.group('POST /books', () => {
  test('returns 400 on invalid ISBN', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: '123' })

    response.assertStatus(400)
  })

  test('parses ISBN10', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: '0321515269' })

    response.assertStatus(200)
  })

  test('parses hyphenated ISBN10', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: '0-321-51526-9' })

    response.assertStatus(200)
  })

  test('parses ISBN13', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: '9780321515261' })

    response.assertStatus(200)
  })

  test('parses hyphenated ISBN13', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: '978-0321515261' })

    response.assertStatus(200)
  })
})
