import { refreshPriceData } from './helpers/pageScraping'

// Refresh price data periodically
chrome.alarms.create('wishlistPoll', { periodInMinutes: 60 })
chrome.alarms.onAlarm.addListener(refreshPriceData)
