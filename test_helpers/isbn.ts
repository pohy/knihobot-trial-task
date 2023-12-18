import { faker } from '@faker-js/faker'

// TODO: The generation algorithm is not reliable and sometimes fails. We should invest more time to make the algorithm correct. I didn't want to spend more time fiddling with the algorithm. Took me long enough for now
export function generateIsbn13() {
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
