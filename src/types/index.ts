export type Wishlist = {
  items: WishlistItem[];
  lastUpdated?: number;
  sortBy: 'title' | 'price';
  sortOrder: 'asc' | 'desc';
}

export type WishlistItem = {
  title: string;
  price: string;
  ogPrice?: string;
  saleEnds?: string;
  url: string;
  outdated?: boolean;
  titleId: number;
}