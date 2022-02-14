import { getWishlist, updateBadge, updateWishlist } from './browserApi'
import type { WishlistItem } from '../types'

type PriceResponse = {
  amount: string
  end_datetime?: string
}

type FetchPricesResponse = {
  discount_price: PriceResponse
  regular_price: PriceResponse
  title_id: number
}

const gameIdQuery = '.buy-now-link'
const nameQuery = 'h1'

export async function fetchAndScrapeUrl(url: string): Promise<WishlistItem> {
  try {
    const res = await fetch(url)
    const html = await res.text()
    const doc = <HTMLElement>htmlToElement(html)
    const gameIdElement = <HTMLAnchorElement>doc.querySelector(gameIdQuery)
    const title = <HTMLElement>doc.querySelector(nameQuery)
    const titleId = parseInt(gameIdElement.href.split('?title=')[1])
    const [{ discount_price, regular_price }] = await fetchPrice(titleId)

    try {
      return {
        title: title.innerText.trim(),
        price: discount_price ? discount_price.amount : regular_price.amount,
        ogPrice: discount_price ? regular_price.amount : '',
        saleEnds: discount_price ? `Sale ends ${(new Date(discount_price.end_datetime)).toLocaleString()}` : '',
        url,
        titleId
      }
    } catch (e) {
      // console.log(e);
      throw new Error(`Could not parse response from ${url}`)
    }
  } catch (err) {
    throw err
  }
}

export function fetchPrice(titleId: number | string): Promise<FetchPricesResponse[]> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['locale'], async function ({ locale }) {
      const country = locale.country || 'US'
      const lang = locale.lang || 'en'
      try {
        const priceApi = await fetch(`https://api.ec.nintendo.com/v1/price?country=${country}&lang=${lang}&ids=${titleId}`)
        const priceRes = await priceApi.json()
        resolve(priceRes.prices)
      } catch (error) {
        reject(error)
      }
    })
  })
}

function htmlToElement(html: string) {
  const template = document.createElement('template')
  html = html.trim() // Never return a text node of whitespace as the result
  template.innerHTML = html
  return template.content.cloneNode(true)
}

export function refreshPriceData(): Promise<void> {
  return new Promise((resolve) => {
    getWishlist(wishlist => {
      if (!wishlist.items.length) {
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
