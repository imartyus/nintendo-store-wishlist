<script lang="ts">
  import { updateWishlist } from './helpers/browserApi'

  export let gameList
  export let sortBy
  export let sortOrder

  function removeGame (url) {
    gameList = gameList.filter(item => item.url !== url)
    updateWishlist({ items: [...gameList] }, true)
  }

  function updateSort (_sortBy) {
    if (_sortBy === sortBy) {
      sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'
    } else {
      sortBy = _sortBy
      sortOrder = 'asc'
    }
    updateWishlist({ sortBy, sortOrder }, true)
  }
</script>

<section class="wl">
		<div class="wl-head">
			<span>My Wishlist:</span>
			<div class="wl-sort">
				Sort By: 
				<button on:click="{() => updateSort('title')}" class="btn-link"  class:active={sortBy === 'title'}>Title</button>
				<span class="wl-sort-arrow" class:rotated={sortOrder === 'asc'}>&uarr;</span>
				<button on:click="{() => updateSort('price')}" class="btn-link" class:active={sortBy === 'price'}>Price</button>
			</div>
		</div>
    {#each gameList as item}
      <section class="wl-row">
        <div class="wl-item" class:sale={item.ogPrice} class:outdated={item.outdated}>
          <div class="wl-item-title">
            <a href={item.url} target="_blank">{item.title}</a>
            <div class="text-small">{item.outdated ? 'Price info might be outdated!' : item.saleEnds}</div>
          </div>
          <div>
            <span>{item.price}</span>
            &nbsp;<span class="og-price">{item.ogPrice}</span>
          </div>
        </div>
        <button class="btn" on:click="{() => removeGame(item.url)}">Remove</button>
      </section>
    {/each}
</section>

<style>
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
  color: var(--nin-orange);
}

.og-price {
  text-decoration: line-through;
  opacity: 0.5;
}

.text-small {
  font-size: 12px;
}
</style>