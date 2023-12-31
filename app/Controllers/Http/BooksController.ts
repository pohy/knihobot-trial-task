import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import * as ISBN from 'isbn3'
import superagent from 'superagent'
import Book, { BookCondition } from 'App/Models/Book'
import { bookPriceUrl, openLibraryUrl } from 'Config/apiUrls'

export default class BooksController {
  public async store({ request, response }: HttpContextContract) {
    const storeBookSchema = schema.create({
      isbn: schema.string(),
      condition: schema.enum(Object.values(BookCondition)),
    })

    const { condition, isbn } = await request.validate({ schema: storeBookSchema })

    const parsedIsbn = ISBN.parse(isbn)
    if (!parsedIsbn) {
      // TODO: ISBN validation could be implemented as a custom validator
      //  But at the same time, we want both ISBN10 and ISBN13 here, hence the inline validation/parsing
      return response.unprocessableEntity({ error: `Invalid ISBN: '${isbn}'` })
    }

    const price = await superagent
      .get(`${bookPriceUrl}/price`)
      .query({ isbn_13: parsedIsbn.isbn13 })
      .then<number>((res) => res.body.price)
      .catch(() => null)

    const title = await superagent
      .get(`${openLibraryUrl}/isbn/${parsedIsbn.isbn13}.json`)
      .then<string>((res) => res.body.title)
      .catch(() => null)

    const book = new Book({
      title,
      condition,
      price_base: price,
      price_factored_by_condition: price ? price * Book.ConditionPriceFactor[condition] : null,
      isbn_10: parsedIsbn.isbn10,
      isbn_13: parsedIsbn.isbn13,
    })

    if (!price || !title) {
      return response.accepted(book)
    }

    return response.ok(book)
  }
}
