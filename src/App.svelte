<script lang="ts">
	import Wishlist from './Wishlist.svelte';
	import { onMount } from 'svelte';
	import {isOnStoreUrl, getWishlist, updateWishlist} from './helpers/browserApi'
	import { fetchAndScrapeUrl, refreshPriceData } from './helpers/pageScraping'
	import orderBy from 'lodash.orderby'

	let onStoreUrl: string
	let onStoreAlreadyAdded: boolean
	let loading: boolean
	let gameList = []
	let sortBy: 'title' | 'price'
	let sortOrder: 'asc' | 'desc'
	let lastUpdated: string | null

	function getSortedList (_sortBy, _sortOrder) {
		const NUMERIC_REGEXP = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g // extract price number

		const sort = (item) => {
			if (_sortBy === 'price') {
				return parseInt(item.price.match(NUMERIC_REGEXP)[0])
			}
			return item[_sortBy]
		}

		return orderBy(gameList, sort, _sortOrder)
	}

	function addGameFromTab () {
		getWishlist(wishlist => {
			loading = true
			fetchAndScrapeUrl(onStoreUrl)
				.then(gameData => {
					if (gameData) {
						wishlist.items.push(gameData)
						gameList.push(gameData)
						gameList = getSortedList(sortBy, sortOrder)
						updateWishlist(wishlist)
						onStoreAlreadyAdded = true
					}
					loading = false
				})
		})
	}

	onMount(() => {
		getWishlist(wishlist => {
				gameList = wishlist.items
        sortBy = wishlist.sortBy || 'title'
        sortOrder = wishlist.sortOrder || 'asc'
        lastUpdated = wishlist.lastUpdated ? (new Date(wishlist.lastUpdated)).toLocaleString() : null

        isOnStoreUrl((currentUrl, isStoreUrl) => {
          if (isStoreUrl) {
            const existingGame = wishlist.items.find(item => item.url === currentUrl)
            onStoreUrl = currentUrl
            onStoreAlreadyAdded = !!existingGame
          }
        })
      })
	});

	$: gameList = getSortedList(sortBy, sortOrder)

</script>

<main>
	{#if !onStoreUrl}
		<section class="info-block">
			Open this extension on a PlayStation Store product page to add it to the Wishlist
		</section>
	{:else}
		<section>
			<button class="btn btn-add" disabled={loading || onStoreAlreadyAdded} on:click={addGameFromTab}>
				{loading ? 'Adding!' : onStoreAlreadyAdded ? 'Already in Wishlist' : 'Add this game to Wishlist'}
			</button>
		</section>
	{/if}
	{#if gameList.length}
		<Wishlist bind:gameList bind:sortBy bind:sortOrder />
	{/if}
</main>

<style>

.info-block {
  font-size: 16px;
  border: 1px solid;
  width: 306px;
  padding: 10px;
  color: var(--color-gray);
}

.btn-add {
  padding: 12px;
}

.error-msg {
  color: var(--color-error);
  font-size: 13px;
  margin-left: 8px;
}

.warn-msg {
  color: var(--color-warn);
  font-size: 13px;
  margin-left: 8px;
}

.last-updated {
  float: right;
  margin-right: 40px;
}

.bottom-actions {
  color: var(--color-grey);
  padding-top: 18px;
}

.manual-refresh-button {
  background: none;
  color: inherit;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}
</style>