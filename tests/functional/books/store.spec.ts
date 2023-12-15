import { test } from '@japa/runner'
import { mockGetBookPricePrice, mockGetOpenLibraryBook } from '../../test_helpers/mocks'
import { faker } from '@faker-js/faker'
test.group('POST /books validates ISBN', (group) => {
  group.tap((test) => test.skip())
  const isbns = {
    gpuGemsIsbn10: '0321515269',
    gpuGemsIsbn10Hyphenated: '0-321-51526-9',
    gpuGemsIsbn13: '9780321515261',
    gpuGemsIsbn13Hyphenated: '978-0321515261',
  }
  const validIsbns = Object.values(isbns)

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

    response.assertBodyContains({
      isbn_10: isbns.gpuGemsIsbn10,
      isbn_13: isbns.gpuGemsIsbn13,
    })
  })

  test('parses hyphenated ISBN10', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: isbns.gpuGemsIsbn10Hyphenated })

    response.assertBodyContains({
      isbn_10: isbns.gpuGemsIsbn10,
      isbn_13: isbns.gpuGemsIsbn13,
    })
  })

  test('parses ISBN13', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: isbns.gpuGemsIsbn13 })

    response.assertBodyContains({
      isbn_10: isbns.gpuGemsIsbn10,
      isbn_13: isbns.gpuGemsIsbn13,
    })
  })

  test('parses hyphenated ISBN13', async ({ client }) => {
    const response = await client.post('/books').json({ isbn: isbns.gpuGemsIsbn13Hyphenated })

    response.assertBodyContains({
      isbn_10: isbns.gpuGemsIsbn10,
      isbn_13: isbns.gpuGemsIsbn13,
    })
  })
})

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

test.group(
  'POST /books with appropriate HTTP response when title or price is found or not',
  (group) => {
    group.tap((test) => test.skip())

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
  }
)

// test.group('POST /books validates condition', () => {})
test.group('POST /books factors condition in book price', () => {
  // group.each.setup(() => {
  //   mockGetBookPricePrice(true)
  //   mockGetOpenLibraryBook(validIsbns, title)
  // })
  // test('returns price factored by condition new', async ({ client }) => {
  //   const condition: BookCondition = 'new'
  //   const response = await client.post('/books').json({ isbn: isbns.gpuGemsIsbn13, condition })
  //
  //   response.assertBodyContains({
  //     price_factored_by_condition:
  //       response.body().price_base * Book.ConditionPriceFactor[condition],
  //   })
  // })
  // test('returns price factored by condition as_new', async ({ client }) => {
  //   const condition: BookCondition = 'as_new'
  //   const response = await client.post('/books').json({ isbn: isbns.gpuGemsIsbn13, condition })
  //
  //   response.assertBodyContains({
  //     price_factored_by_condition:
  //       response.body().price_base * Book.ConditionPriceFactor[condition],
  //   })
  // })
  //
  // test('returns price factored by condition damaged', async ({ client }) => {
  //   const condition: BookCondition = 'damaged'
  //   const response = await client.post('/books').json({ isbn: isbns.gpuGemsIsbn13, condition })
  //
  //   response.assertBodyContains({
  //     price_factored_by_condition:
  //       response.body().price_base * Book.ConditionPriceFactor[condition],
  //   })
  // })
})

// TODO: Condition validation

function generateIsbnAndTitles(count: number) {
  return Array.from(Array(count)).map(() => {
    const isbn10 = generateIsbn10()
    const isbn13 = `978${isbn10}`
    const title = faker.word.words(3)
    return { isbn10, isbn13, title }
  })
}

// TODO: Move to helpers or something

function generateIsbn10() {
  const generatedIsbn = faker.string.numeric(10)
  return makeGeneratedIsbnValid(generatedIsbn)
}

function generateIsbn13() {
  const generatedIsbn = `978${faker.string.numeric(10)}`
  return makeGeneratedIsbnValid(generatedIsbn)
}

function makeGeneratedIsbnValid(isbn: string) {
  const checkDigit = isbnChecksum(isbn.substring(0, isbn.length - 1))
  return `${isbn.substring(0, isbn.length - 1)}${checkDigit}`

  // Yoinked from the isbn3 library: https://github.com/inventaire/isbn3/blob/main/lib/calculate_check_digit.js
  function isbnChecksum(isbn: string) {
    let check = 0

    if (isbn.length === 9) {
      for (let n = 0; n < 9; n += 1) {
        check += (10 - n) * (isbn.charAt(n) as any)
      }
      check = (11 - (check % 11)) % 11
      return check === 10 ? 'X' : String(check)
    } else if (isbn.length === 12) {
      for (let n = 0; n < 12; n += 2) {
        check += Number(isbn.charAt(n)) + 3 * (isbn.charAt(n + 1) as any)
      }
      return String((10 - (check % 10)) % 10)
    }

    return null
  }
}
