import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import * as ISBN from 'isbn3'
import superagent from 'superagent'
import Book from 'App/Models/Book'
import { bookPriceUrl, openLibraryUrl } from 'Config/apiUrls'

export default class BooksController {
  public async store({ request, response }: HttpContextContract) {
    // TODO: Validate schema

    const queryIsbn = request.input('isbn')
    const parsedIsbn = ISBN.parse(queryIsbn)
    if (!parsedIsbn) {
      // TODO: Implement isbn validation as a custom validation rule
      return response.badRequest({ error: `Invalid ISBN: '${queryIsbn}'` })
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

    const condition = request.input('condition')

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
