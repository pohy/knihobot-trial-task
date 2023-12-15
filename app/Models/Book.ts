import * as ISBN from 'isbn3'

export default class Book {
  public static ConditionPriceFactor: Record<BookCondition, number> = {
    new: 1,
    as_new: 0.8,
    damaged: 0.5,
  }

  constructor(book: Partial<Book>) {
    Object.assign(this, book)
  }

  public title: string | null
  public price_base: number | null // TODO: Add getter for the price factored by condition
  // TODO: Should be a getter/computed
  public price_factored_by_condition: number | null
  public condition: BookCondition
  public isbn_13: string
  public isbn_10: string // TODO: This can also be derived from isbn_13
  // TODO: Maybe add getters for the derivable fields? :)
}

export type BookCondition = 'new' | 'as_new' | 'damaged'
