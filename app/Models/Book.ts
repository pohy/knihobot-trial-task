export enum BookCondition {
  new = 'new',
  asNew = 'as_new',
  damaged = 'damaged',
}

export default class Book {
  public static ConditionPriceFactor: Record<BookCondition, number> = {
    [BookCondition.new]: 1,
    [BookCondition.asNew]: 0.8,
    [BookCondition.damaged]: 0.5,
  }

  constructor(book: Partial<Book>) {
    Object.assign(this, book)
  }

  public title: string | null
  public price_base: number | null
  public price_factored_by_condition: number | null
  public condition: BookCondition
  public isbn_13: string
  public isbn_10: string
  // TODO: Maybe add getters for the derivable fields? :)
}
