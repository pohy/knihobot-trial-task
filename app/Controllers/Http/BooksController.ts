import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class BooksController {
  public async store({ request, response }: HttpContextContract) {
    response.internalServerError('Not implemented')
  }
}
