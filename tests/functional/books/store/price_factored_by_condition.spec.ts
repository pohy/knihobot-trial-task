import { test } from '@japa/runner'
import { mockGetBookPricePrice, mockGetOpenLibraryBook } from '../../../test_helpers/mocks'
import { generateIsbn13 } from '../../../test_helpers/isbn'
import { faker } from '@faker-js/faker'
import Book, { BookCondition } from 'App/Models/Book'

test.group('POST /books factors condition in book price', (group) => {
  const isbn = generateIsbn13()
  const title = faker.word.words(3)

  group.each.setup(() => {
    mockGetBookPricePrice(true)
    mockGetOpenLibraryBook([isbn], title)
  })

  test('returns price factored by condition new', async ({ client }) => {
    const condition = BookCondition.new
    const response = await client.post('/books').json({ isbn, condition })

    response.assertBodyContains({
      price_factored_by_condition:
        response.body().price_base * Book.ConditionPriceFactor[condition],
    })
  })
  test('returns price factored by condition as_new', async ({ client }) => {
    const condition = BookCondition.asNew
    const response = await client.post('/books').json({ isbn, condition })

    response.assertBodyContains({
      price_factored_by_condition:
        response.body().price_base * Book.ConditionPriceFactor[condition],
    })
  })

  test('returns price factored by condition damaged', async ({ client }) => {
    const condition = BookCondition.damaged
    const response = await client.post('/books').json({ isbn, condition })

    response.assertBodyContains({
      price_factored_by_condition:
        response.body().price_base * Book.ConditionPriceFactor[condition],
    })
  })
})

// TODO: Condition validation

// TODO: Move to helpers or something
