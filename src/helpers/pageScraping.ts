import { getWishlist, updateBadge, updateWishlist } from './browserApi'
import type { WishlistItem } from '../types'

interface PriceResponse {
  amount: string
  end_datetime?: string
}

interface FetchPricesResponse {
  discount_price?: PriceResponse
  regular_price: PriceResponse
  title_id: number
}

function pickBetween (input: string, start: string, end: string) {
  const parsed_1 = input.split(start)
  if (parsed_1.length > 1) {
    const parsed_2 = parsed_1[1].split(end)
    return parsed_2[0]
  }
  return null
}

export async function fetchAndScrapeUrl (url: string): Promise<WishlistItem> {
  try {
    const res = await fetch(url)
    const html = await res.text()

    const doc = <HTMLElement>htmlToElement(html)
    const title = <HTMLElement>doc.querySelector('h1')
    const locale = pickBetween(html, 'lang="', '"')
    const [lang, country] = locale.split('-')

    const titleId = parseInt(pickBetween(html, '"nsuid":"', '",') || pickBetween(html, 'nsuid: "', '",'))

    // Save locale for future calls
    await chrome.storage.sync.set({ locale: { country, lang } })

    const [{ discount_price, regular_price }] = await fetchPrice(titleId)

    return {
      title: title.innerText.trim(),
      price: discount_price ? discount_price.amount : regular_price.amount,
      ogPrice: discount_price ? regular_price.amount : '',
      saleEnds: discount_price ? `Sale ends ${(new Date(discount_price.end_datetime)).toLocaleString()}` : '',
      url,
      titleId
    }
  } catch (err) {
    throw err
  }
}

export async function fetchPrice (titleId: number | string): Promise<FetchPricesResponse[]> {
  return await new Promise((resolve, reject) => {
    chrome.storage.sync.get(['locale'], async function ({ locale }) {
      const country = locale.country || 'US'
      const lang = locale.lang || 'en'
      try {
        const priceApi = await fetch(`https://api.ec.nintendo.com/v1/price?country=${country.toUpperCase()}&lang=${lang}&ids=${titleId}`)
        const priceRes = await priceApi.json()
        resolve(priceRes.prices)
      } catch (error) {
        reject(error)
      }
    })
  })
}

function htmlToElement (html: string) {
  const template = document.createElement('template')
  html = html.trim() // Never return a text node of whitespace as the result
  template.innerHTML = html
  return template.content.cloneNode(true)
}

export async function refreshPriceData (): Promise<void> {
  return await new Promise((resolve) => {
    getWishlist(wishlist => {
      if (wishlist.items.length === 0) {
        return resolve()
      }

      const titleIds = wishlist.items.reduce((acc, next) => acc += `${acc === '' ? '' : ','}${next.titleId}`, '')

      fetchPrice(titleIds)
        .then(prices => {
          const updatedItems = wishlist.items.map(item => {
            const { discount_price, regular_price } = prices.find(price => price.title_id === item.titleId)
            return {
              ...item,
              price: discount_price ? discount_price.amount : regular_price.amount,
              ogPrice: discount_price ? regular_price.amount : '',
              saleEnds: discount_price ? `Sale ends ${(new Date(discount_price.end_datetime)).toLocaleString()}` : '',
              outdated: false
            }
          })

          const newWishlist = {
            items: updatedItems,
            lastUpdated: Date.now()
          }
          updateBadge(updatedItems)
          updateWishlist(newWishlist, true).then(resolve)
        })
        .catch(err => {
          console.log('Data refresh error: ', err)
          const newWishlist = {
            items: wishlist.items.map(item => ({ ...item, outdated: true })),
            lastUpdated: Date.now()
          }
          updateWishlist(newWishlist, true).then(resolve)
        })
    })
  })
}
