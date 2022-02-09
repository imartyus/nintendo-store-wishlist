<script lang="ts">
	import { onMount } from 'svelte';
	import {isOnStoreUrl, getWishlist} from './helpers/browserApi'
	import orderBy from 'lodash.orderby'

	let onStoreUrl
	let onStoreAlreadyAdded
	let loading
	let gameList = []
	let sortBy
	let sortOrder
	let lastUpdated

	function getSortedList (list) {
      const NUMERIC_REGEXP = /[-]{0,1}[\d]*[.]{0,1}[\d]+/g // extract price number

      const sort = (item) => {
        if (sortBy === 'price') {
          return parseInt(item.price.match(NUMERIC_REGEXP)[0])
        }
        return item[sortBy]
      }

      return orderBy(list, sort, sortOrder)
    }

	onMount(() => {
		getWishlist(wishlist => {
			console.log('wishlist: ', wishlist);
        sortBy = wishlist.sortBy || 'title'
        sortOrder = wishlist.sortOrder || 'asc'
        gameList = getSortedList(wishlist.items)
        lastUpdated = wishlist.lastUpdated ? (new Date(wishlist.lastUpdated)).toLocaleString() : null
        isOnStoreUrl((currentUrl, isStoreUrl) => {
					console.log('currentUrl: ', currentUrl, isStoreUrl);
          if (isStoreUrl) {
            const existingGame = wishlist.items.find(item => item.url === currentUrl)
            onStoreUrl = currentUrl
            onStoreAlreadyAdded = !!existingGame
          }
        })
      })
	});
</script>

<main>
	{#if !onStoreUrl}
		<section class="info-block">
			Open this extension on a PlayStation Store product page to add it to the Wishlist
		</section>
	{:else}
		<section>
			<button class="btn btn-add" disabled={loading || onStoreAlreadyAdded}>
				{loading ? 'Adding!' : onStoreAlreadyAdded ? 'Already in Wishlist' : 'Add this game to Wishlist'}
			</button>
		</section>
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

.btn {
  padding: 8px 10px;
  background-color: var(--color-blue);
  color: var(--text-color);
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn:disabled {
  background-color: var(--color-grey);
  cursor: not-allowed;
}

.btn-add {
  padding: 12px;
}

.btn-link {
  background: none;
  border: none;
  color: var(--text-color);
  padding: 1px 0px;
  margin: 0 4px;
  cursor: pointer;
}

.btn-link.active, .btn-link:hover {
  border-bottom: 1px solid;
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

.wl {
  margin-top: 20px;
  overflow-y: auto;
  max-height: 470px;
  padding-right: 20px;
}

.wl-sort {
  float: right;
  font-size: 14px;
}

.wl-sort-arrow {
  display: inline-block;
  transition: all 500ms;
}

.rotated {
  transform: rotate(180deg);
}

.wl-head {
  font-size: 16px;
  padding-bottom: 10px;
}

.wl-row {
  display: flex;
  align-items: center;
}

.wl-item {
  padding: 12px 0 7px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid;
  font-size: 16px;
  margin-right: 15px;
  width: 379px;
}

.wl-item.sale {
  color: var(--color-lightgreen);
}

.wl-item.outdated {
  color: var(--color-warn);
}

.wl-item a {
  color: var(--text-color);
  text-decoration: none;
}

.wl-item-title {
  width: 245px;
}

.wl-item.sale a {
  color: var(--color-lightgreen);
}

.wl-item.outdated a {
  color: var(--color-warn);
}

.wl-item a:hover {
  color: var(--color-blue);
}

.og-price {
  text-decoration: line-through;
  opacity: 0.5;
}

.text-small {
  font-size: 12px;
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