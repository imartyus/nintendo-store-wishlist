import { refreshPriceData } from './helpers/pageScraping'

let _locale

chrome.storage.sync.get(['locale'], function ({ locale }) {
  _locale = locale || {}
});

// chrome.runtime.onInstalled.addListener(function () {
// })

// Refresh price data periodically
chrome.alarms.create('wishlistPoll', { periodInMinutes: 60 })
chrome.alarms.onAlarm.addListener(refreshPriceData)

// Capture user's country and lang
const filter = { urls: ['https://api.ec.nintendo.com/v1/price?*'] };
const callback = function (details) {
  const parsedUrl = new URL(details.url)
  // console.log(parsedUrl.searchParams.get("country"));
  // console.log(parsedUrl.searchParams.get("lang"));
  const country = parsedUrl.searchParams.get("country")
  const lang = parsedUrl.searchParams.get("lang")
  if (!_locale || _locale.country !== country || _locale.lang !== lang) {
    chrome.storage.sync.set({ locale: { country, lang } });
  }
};

chrome.webRequest.onCompleted.addListener(callback, filter);