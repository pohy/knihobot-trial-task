import { test } from '@japa/runner'
import { generateIsbn13 } from '../../../../test_helpers/isbn'
import { BookCondition } from 'App/Models/Book'

test.group('POST /books condition', () => {
  test('returns 422 when condition is not valid', async ({ client }) => {
    const response = await client
      .post('/books')
      .json({ isbn: generateIsbn13(), condition: 'invalid-book-condition-hopefully' })

    response.assertStatus(422)
  })

  test('accepts condition new', async ({ client }) => {
    const condition = BookCondition.new
    const response = await client.post('/books').json({ isbn: generateIsbn13(), condition })

    response.assertStatus(202)
    response.assertBodyContains({ condition })
  })

  test('accepts condition as_new', async ({ client }) => {
    const condition = BookCondition.asNew
    const response = await client.post('/books').json({ isbn: generateIsbn13(), condition })

    response.assertStatus(202)
    response.assertBodyContains({ condition })
  })

  test('accepts condition damaged', async ({ client }) => {
    const condition = BookCondition.damaged
    const response = await client.post('/books').json({ isbn: generateIsbn13(), condition })

    response.assertStatus(202)
    response.assertBodyContains({ condition })
  })
})
