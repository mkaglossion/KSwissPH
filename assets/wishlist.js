(() => {
  const STORAGE_KEY = 'kswiss:wishlist-v1';
  const PAGE_CONTENT_SELECTOR = '.js-wishlist-content';

  const escapeHtml = (value) =>
    String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const readWishlist = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((item) => item && item.handle) : [];
    } catch (error) {
      return [];
    }
  };

  const writeWishlist = (items) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      // Ignore storage failures and keep the UI usable.
    }
  };

  const getHandle = (element) => element?.dataset?.wishlistHandle || '';

  const collectWishlistItem = (element) => ({
    handle: getHandle(element),
    title: element.dataset.wishlistTitle || '',
    url: element.dataset.wishlistUrl || '',
    image: element.dataset.wishlistImage || '',
    imageAlt: element.dataset.wishlistImageAlt || element.dataset.wishlistTitle || '',
    price: element.dataset.wishlistPrice || '',
    compareAtPrice: element.dataset.wishlistCompareAtPrice || '',
    variantId: element.dataset.wishlistVariantId || '',
    vendor: element.dataset.wishlistVendor || '',
    available: element.dataset.wishlistAvailable !== 'false',
  });

  const getProductInfo = (element) => element?.closest('product-info');

  const getSectionId = (element) => element?.dataset?.wishlistSectionId || getProductInfo(element)?.dataset?.section || '';

  const readText = (element) => element?.textContent?.replace(/\s+/g, ' ').trim() || '';

  const getSelectedVariant = (productInfo) => {
    const selectedVariant = productInfo?.querySelector('variant-selects [data-selected-variant]')?.textContent;
    if (!selectedVariant) return null;

    try {
      return JSON.parse(selectedVariant);
    } catch (error) {
      return null;
    }
  };

  const getProductPriceData = (productInfo, sectionId) => {
    const priceContainer = productInfo?.querySelector(`#price-${sectionId}`);
    if (!priceContainer) return { price: '', compareAtPrice: '' };

    const salePrice = readText(priceContainer.querySelector('.price__sale .price-item--last'));
    const regularPrice = readText(priceContainer.querySelector('.price__regular .price-item--regular'));
    const compareAtPrice = readText(priceContainer.querySelector('.price__sale .price-item--regular, .variant-item__old-price'));

    return {
      price: salePrice || regularPrice,
      compareAtPrice,
    };
  };

  const getProductImageData = (productInfo, variant) => {
    const activeImage =
      productInfo?.querySelector('.product__media-item.is-active img') ||
      productInfo?.querySelector('media-gallery img');
    const variantImage = variant?.featured_media?.preview_image?.src || variant?.featured_image?.src || '';

    return {
      image: variantImage || activeImage?.currentSrc || activeImage?.src || '',
      imageAlt: activeImage?.getAttribute('alt') || '',
    };
  };

  const getProductUrl = (productInfo, variant) => {
    const baseUrl = productInfo?.dataset?.url || window.location.pathname;
    return variant?.id ? `${baseUrl}?variant=${variant.id}` : baseUrl;
  };

  const updateWishlistButtonCopy = (button, saved) => {
    const addLabel = button.dataset.wishlistLabelAdd || 'Add to wishlist';
    const activeLabel = button.dataset.wishlistLabelActive || 'Saved to wishlist';
    const label = saved ? activeLabel : addLabel;

    button.dataset.wishlistState = saved ? 'saved' : 'default';
    button.querySelectorAll('[data-wishlist-button-text]').forEach((element) => {
      element.textContent = label;
    });
  };

  const syncStoredItemFromToggle = (button) => {
    const handle = getHandle(button);
    if (!handle) return readWishlist();

    const items = readWishlist();
    const existingIndex = items.findIndex((item) => item.handle === handle);
    if (existingIndex < 0) return items;

    const nextItem = collectWishlistItem(button);
    const currentItem = items[existingIndex];
    const isSame = Object.keys(nextItem).every((key) => currentItem[key] === nextItem[key]);

    if (isSame) return items;

    items[existingIndex] = { ...currentItem, ...nextItem };
    writeWishlist(items);
    return items;
  };

  const syncProductWishlistButton = (button, variant = null) => {
    if (!button) return readWishlist();

    const productInfo = getProductInfo(button);
    if (!productInfo) return readWishlist();

    const activeVariant = variant || getSelectedVariant(productInfo);
    const sectionId = getSectionId(button);
    const { price, compareAtPrice } = getProductPriceData(productInfo, sectionId);
    const { image, imageAlt } = getProductImageData(productInfo, activeVariant);

    button.dataset.wishlistUrl = getProductUrl(productInfo, activeVariant);
    button.dataset.wishlistVariantId = activeVariant?.id ? String(activeVariant.id) : '';
    button.dataset.wishlistAvailable = activeVariant?.available === false ? 'false' : 'true';

    if (price) button.dataset.wishlistPrice = price;
    button.dataset.wishlistCompareAtPrice = compareAtPrice || '';
    if (image) button.dataset.wishlistImage = image;
    if (imageAlt) button.dataset.wishlistImageAlt = imageAlt;

    return syncStoredItemFromToggle(button);
  };

  const syncProductWishlistButtons = () => {
    let items = readWishlist();

    document.querySelectorAll('[data-wishlist-product-button]').forEach((button) => {
      items = syncProductWishlistButton(button);
    });

    return items;
  };

  const syncToggleButtons = (items = readWishlist()) => {
    const handles = new Set(items.map((item) => item.handle));

    document.querySelectorAll('[data-wishlist-toggle]').forEach((button) => {
      const handle = getHandle(button);
      const saved = handles.has(handle);
      const title = button.dataset.wishlistTitle || 'item';

      button.classList.toggle('is-active', saved);
      button.setAttribute('aria-pressed', saved ? 'true' : 'false');
      button.setAttribute('aria-label', saved ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`);
      updateWishlistButtonCopy(button, saved);
    });

    document.querySelectorAll('[data-wishlist-count]').forEach((counter) => {
      const hasItems = items.length > 0;
      counter.textContent = hasItems ? String(items.length) : '';
      counter.hidden = !hasItems;
    });

    document.querySelectorAll('[data-wishlist-link]').forEach((link) => {
      link.classList.toggle('is-active', items.length > 0);
      link.setAttribute('aria-label', items.length > 0 ? `Wishlist (${items.length})` : 'Wishlist');
    });
  };

  const renderEmptyState = () => `
    <div class="wishlist-empty">
      <div class="wishlist-empty__icon" aria-hidden="true">
        <span class="svg-wrapper">${window.__wishlistHeartSvg || ''}</span>
      </div>
      <h2 class="wishlist-empty__title">Your wishlist is empty</h2>
      <p class="wishlist-empty__text">Save products you like, then come back here to review them later.</p>
      <div class="wishlist-empty__actions">
        <a href="/collections/all" class="button button--primary wishlist-empty__action">Continue shopping</a>
        <a href="/search" class="button button--secondary wishlist-empty__action">Search products</a>
      </div>
    </div>
  `;

  const renderWishlistCard = (item) => `
    <div class="wishlist-page__item" data-wishlist-item data-wishlist-handle="${escapeHtml(item.handle)}">
      <article class="wishlist-card">
        <div class="wishlist-card__media">
          <a href="${escapeHtml(item.url)}" class="wishlist-card__image">
            ${
              item.image
                ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.imageAlt)}" loading="lazy">`
                : '<span class="wishlist-card__placeholder">No image</span>'
            }
          </a>
          <button
            type="button"
            class="wishlist-card__remove"
            data-wishlist-remove
            data-wishlist-handle="${escapeHtml(item.handle)}"
            aria-label="Remove ${escapeHtml(item.title)} from wishlist"
          >
            <span class="svg-wrapper">${window.__wishlistCloseSvg || ''}</span>
          </button>
          <label class="wishlist-card__select">
            <input type="checkbox" class="js-wishlist-select" value="${escapeHtml(item.handle)}">
            <span class="visually-hidden">Select ${escapeHtml(item.title)}</span>
          </label>
        </div>

        <div class="wishlist-card__body">
          ${
            item.vendor || item.available === false
              ? `
                <div class="wishlist-card__meta">
                  ${item.vendor ? `<p class="wishlist-card__vendor">${escapeHtml(item.vendor)}</p>` : ''}
                  ${
                    item.available === false
                      ? '<span class="wishlist-card__badge wishlist-card__badge--soldout">Sold out</span>'
                      : ''
                  }
                </div>
              `
              : ''
          }
          <h3 class="wishlist-card__title">
            <a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a>
          </h3>
          <div class="wishlist-card__price">
            ${item.price ? `<span>${escapeHtml(item.price)}</span>` : ''}
            ${item.compareAtPrice ? `<s>${escapeHtml(item.compareAtPrice)}</s>` : ''}
          </div>
          <div class="wishlist-card__actions">
            <a href="${escapeHtml(item.url)}" class="button button--secondary wishlist-card__button wishlist-card__view">View product</a>
          </div>
        </div>
      </article>
    </div>
  `;

  const getSelectedHandles = () =>
    Array.from(document.querySelectorAll('.js-wishlist-select:checked')).map((input) => input.value);

  const syncSelectionControls = () => {
    const items = readWishlist();
    const selected = getSelectedHandles();
    const selectedSet = new Set(selected);
    const selectedCount = document.querySelector('.js-wishlist-selected-count');
    const selectAll = document.querySelector('.js-wishlist-select-all');
    const bulkRemove = document.querySelector('.js-wishlist-bulk-remove');
    const bulkCart = document.querySelector('.js-wishlist-bulk-cart');
    const bulkCheckout = document.querySelector('.js-wishlist-bulk-checkout');

    if (selectedCount) selectedCount.textContent = String(selected.length);

    if (selectAll) {
      selectAll.checked = items.length > 0 && selected.length === items.length;
      selectAll.indeterminate = selected.length > 0 && selected.length < items.length;
    }

    const hasSelection = selected.length > 0;
    [bulkRemove, bulkCart, bulkCheckout].forEach((button) => {
      if (button) button.disabled = !hasSelection;
    });

    document.querySelectorAll('[data-wishlist-item]').forEach((item) => {
      item.querySelector('.wishlist-card')?.classList.toggle(
        'is-selected',
        selectedSet.has(item.dataset.wishlistHandle || '')
      );
    });
  };

  const renderWishlistPage = () => {
    const content = document.querySelector(PAGE_CONTENT_SELECTOR);
    if (!content) return;

    const bulkBar = document.querySelector('.wishlist-page__bulk');
    const pageCount = document.querySelector('.js-wishlist-page-count');
    const selectedCount = document.querySelector('.js-wishlist-selected-count');
    const selectAll = document.querySelector('.js-wishlist-select-all');
    const bulkRemove = document.querySelector('.js-wishlist-bulk-remove');
    const bulkCart = document.querySelector('.js-wishlist-bulk-cart');
    const bulkCheckout = document.querySelector('.js-wishlist-bulk-checkout');
    const items = readWishlist();

    if (pageCount) pageCount.textContent = String(items.length);

    if (!items.length) {
      content.innerHTML = renderEmptyState();
      if (bulkBar) bulkBar.classList.add('is-hidden');
      if (selectedCount) selectedCount.textContent = '0';
      if (selectAll) {
        selectAll.checked = false;
        selectAll.indeterminate = false;
      }
      [bulkRemove, bulkCart, bulkCheckout].forEach((button) => {
        if (button) button.disabled = true;
      });
      return;
    }

    if (bulkBar) bulkBar.classList.remove('is-hidden');

    content.innerHTML = items.map(renderWishlistCard).join('');

    syncSelectionControls();
  };

  const removeHandles = (handles) => {
    const toRemove = new Set(handles);
    const nextItems = readWishlist().filter((item) => !toRemove.has(item.handle));
    writeWishlist(nextItems);
    refreshWishlist();
  };

  const addItemsToCart = async (items, redirectUrl) => {
    if (!items.length) return;

    const variantIds = [...new Set(items.map((item) => item.variantId).filter(Boolean))];
    if (!variantIds.length) return;

    const response = await fetch(window.routes?.cart_add_url || '/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        items: variantIds.map((id) => ({ id: Number(id), quantity: 1 })),
      }),
    });

    if (!response.ok) {
      throw new Error('Unable to add wishlist items to cart');
    }

    window.location.href = redirectUrl;
  };

  const refreshWishlist = () => {
    const items = syncProductWishlistButtons();
    syncToggleButtons(items);
    renderWishlistPage();
  };

  document.addEventListener('click', async (event) => {
    const toggle = event.target.closest('[data-wishlist-toggle]');
    const remove = event.target.closest('[data-wishlist-remove]');
    const bulkRemove = event.target.closest('.js-wishlist-bulk-remove');
    const bulkCart = event.target.closest('.js-wishlist-bulk-cart');
    const bulkCheckout = event.target.closest('.js-wishlist-bulk-checkout');
    const addToCart = event.target.closest('[data-wishlist-add-to-cart]');

    if (toggle) {
      event.preventDefault();

      const handle = getHandle(toggle);
      if (!handle) return;

      const items = readWishlist();
      const existingIndex = items.findIndex((item) => item.handle === handle);

      if (existingIndex >= 0) {
        items.splice(existingIndex, 1);
      } else {
        items.unshift(collectWishlistItem(toggle));
      }

      writeWishlist(items);
      refreshWishlist();
      return;
    }

    if (remove) {
      event.preventDefault();
      removeHandles([getHandle(remove)]);
      return;
    }

    if (bulkRemove) {
      event.preventDefault();
      removeHandles(getSelectedHandles());
      return;
    }

    if (bulkCart) {
      event.preventDefault();
      try {
        const selectedHandles = new Set(getSelectedHandles());
        const selectedItems = readWishlist().filter((item) => selectedHandles.has(item.handle));
        await addItemsToCart(selectedItems, window.routes?.cart_url || '/cart');
      } catch (error) {
        console.error(error);
      }
      return;
    }

    if (bulkCheckout) {
      event.preventDefault();
      try {
        const selectedHandles = new Set(getSelectedHandles());
        const selectedItems = readWishlist().filter((item) => selectedHandles.has(item.handle));
        await addItemsToCart(selectedItems, '/checkout');
      } catch (error) {
        console.error(error);
      }
      return;
    }

    if (addToCart) {
      event.preventDefault();
      try {
        const item = readWishlist().find((entry) => entry.handle === getHandle(addToCart));
        if (!item) return;
        await addItemsToCart([item], window.routes?.cart_url || '/cart');
      } catch (error) {
        console.error(error);
      }
    }
  });

  document.addEventListener('change', (event) => {
    if (event.target.matches('.js-wishlist-select, .js-wishlist-select-all')) {
      const selectAll = document.querySelector('.js-wishlist-select-all');
      const selectAllChecked = !!selectAll?.checked;

      if (event.target.matches('.js-wishlist-select-all')) {
        document.querySelectorAll('.js-wishlist-select').forEach((input) => {
          input.checked = selectAllChecked;
        });
      }

      syncSelectionControls();
    }
  });

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      refreshWishlist();
    }
  });

  if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
    subscribe(PUB_SUB_EVENTS.variantChange, ({ data }) => {
      const sectionId = data?.sectionId;
      if (!sectionId) return;

      const toggle = document.querySelector(
        `[data-wishlist-product-button][data-wishlist-section-id="${sectionId}"]`
      );
      if (!toggle) return;

      const items = syncProductWishlistButton(toggle, data?.variant || null);
      syncToggleButtons(items);
    });
  }

  document.addEventListener('DOMContentLoaded', refreshWishlist);
  window.addEventListener('load', refreshWishlist);
  document.addEventListener('shopify:section:load', refreshWishlist);

  if (document.readyState !== 'loading') {
    refreshWishlist();
  }
})();
