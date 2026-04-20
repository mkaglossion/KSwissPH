document.addEventListener('click', function (e) {
  const sizeBtn = e.target.closest('.variant-btn');
  const swatchBtn = e.target.closest('.card-swatch');
  const arrowBtn = e.target.closest('.quick_atc_arrow');
  const colorArrowBtn = e.target.closest('.color_swatch_arrow');

  if (arrowBtn) {
    const wrap = arrowBtn.closest('.quick_atc_wrap');
    const rail = wrap ? wrap.querySelector('.quick_atc_box') : null;
    if (!rail) return;

    const amount = Math.max(rail.clientWidth * 0.8, 140);
    const direction = arrowBtn.classList.contains('quick_atc_arrow--next') ? 1 : -1;

    rail.scrollBy({
      left: amount * direction,
      behavior: 'smooth'
    });

    return;
  }

  if (colorArrowBtn) {
    const wrap = colorArrowBtn.closest('.color_swatch_wrap');
    const rail = wrap ? wrap.querySelector('.color_swatch_box') : null;
    if (!rail) return;

    const amount = Math.max(rail.clientWidth * 0.8, 140);
    const direction = colorArrowBtn.classList.contains('color_swatch_arrow--next') ? 1 : -1;

    rail.scrollBy({
      left: amount * direction,
      behavior: 'smooth'
    });

    return;
  }

  if (sizeBtn) {
    const card = sizeBtn.closest('.custom-plp-card');
    if (!card || sizeBtn.disabled || sizeBtn.hidden) return;

    card.querySelectorAll('.variant-btn').forEach((btn) => {
      btn.classList.remove('is-active', 'active');
    });

    sizeBtn.classList.add('is-active', 'active');

    const variantId = sizeBtn.dataset.variantId;
    const variantInput = card.querySelector('.product-variant-id');

    if (variantInput && variantId) {
      variantInput.value = variantId;
      variantInput.disabled = false;
    }

    card.dataset.selectedVariantId = variantId;
    return;
  }

  if (swatchBtn) {
    const productUrl = swatchBtn.dataset.url;
    if (productUrl) {
      window.location.href = productUrl;
      return;
    }

    const card = swatchBtn.closest('.custom-plp-card');
    if (!card) return;

    const newImage = swatchBtn.dataset.image;
    const colorName = swatchBtn.dataset.colorName;
    const variantId = swatchBtn.dataset.variantId;

    card.querySelectorAll('.card-swatch').forEach((btn) => {
      btn.classList.remove('is-active', 'active');
    });

    swatchBtn.classList.add('is-active', 'active');

    const mainImg = card.querySelector('.custom-plp-card__main-image.primary-image');
    const hoverImg = card.querySelector('.custom-plp-card__main-image.hover-image');

    if (mainImg && newImage) {
      mainImg.src = newImage;
      mainImg.srcset = '';
    }

    if (hoverImg && newImage) {
      hoverImg.src = newImage;
      hoverImg.srcset = '';
    }

    const colorText = card.querySelector('.active-color-name');
    if (colorText && colorName) {
      colorText.textContent = colorName;
    }

    const allSizeBtns = card.querySelectorAll('.variant-btn');
    let firstAvailableBtn = null;

    allSizeBtns.forEach((btn) => {
      const btnColor = btn.dataset.color || '';

      if (!colorName || btnColor === colorName) {
        btn.hidden = false;

        if (!btn.disabled && !firstAvailableBtn) {
          firstAvailableBtn = btn;
        }
      } else {
        btn.hidden = true;
        btn.classList.remove('is-active', 'active');
      }
    });

    const variantInput = card.querySelector('.product-variant-id');
    const atcBtn = card.querySelector('.custom-plp-card__atc');

    if (firstAvailableBtn) {
      firstAvailableBtn.classList.add('is-active', 'active');

      if (variantInput) {
        variantInput.value = firstAvailableBtn.dataset.variantId;
        variantInput.disabled = false;
      }

      if (atcBtn) {
        atcBtn.disabled = false;
      }

      card.dataset.selectedVariantId = firstAvailableBtn.dataset.variantId;
    } else if (variantId) {
      if (variantInput) {
        variantInput.value = variantId;
        variantInput.disabled = false;
      }

      if (atcBtn) {
        atcBtn.disabled = false;
      }

      card.dataset.selectedVariantId = variantId;
    } else {
      if (variantInput) {
        variantInput.disabled = true;
      }

      if (atcBtn) {
        atcBtn.disabled = true;
      }
    }

    initScrollIndicators(card);
    initColorRails(card);

    requestAnimationFrame(() => {
      initScrollIndicators(card);
      initColorRails(card);
    });
  }
});

/* =========================
   SIZE RAIL
   ========================= */

function ensureRailArrows(rail) {
  const wrap = rail.closest('.quick_atc_wrap');
  if (!wrap || wrap.dataset.arrowsBound === 'true') return;

  wrap.dataset.arrowsBound = 'true';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'quick_atc_arrow quick_atc_arrow--prev';
  prev.setAttribute('aria-label', 'Scroll left');
  prev.innerHTML = `
    <svg viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      <path d="M6.8 1.5 2.8 5l4 3.5V1.5Z"></path>
    </svg>
  `;

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'quick_atc_arrow quick_atc_arrow--next';
  next.setAttribute('aria-label', 'Scroll right');
  next.innerHTML = `
    <svg viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      <path d="M3.2 1.5 7.2 5l-4 3.5V1.5Z"></path>
    </svg>
  `;

  wrap.appendChild(prev);
  wrap.appendChild(next);
}

function updateRailArrows(rail) {
  const wrap = rail.closest('.quick_atc_wrap');
  if (!wrap) return;

  const prev = wrap.querySelector('.quick_atc_arrow--prev');
  const next = wrap.querySelector('.quick_atc_arrow--next');
  if (!prev || !next) return;

  const maxScroll = Math.max(rail.scrollWidth - rail.clientWidth, 0);
  const atStart = rail.scrollLeft <= 1;
  const atEnd = rail.scrollLeft >= maxScroll - 1;

  prev.disabled = atStart;
  next.disabled = atEnd;
}

function updateScrollIndicator(rail) {
  const wrap = rail.closest('.quick_atc_wrap');
  if (!wrap) return;

  const maxScroll = Math.max(rail.scrollWidth - rail.clientWidth, 0);
  const hasOverflow = maxScroll > 2;

  wrap.classList.toggle('has-overflow', hasOverflow);

  if (!hasOverflow) {
    wrap.style.setProperty('--scroll-thumb-width', '0px');
    wrap.style.setProperty('--scroll-thumb-x', '0px');
    updateRailArrows(rail);
    return;
  }

  const trackInset = window.innerWidth < 750 ? 32 : 36;
  const trackWidth = Math.max(rail.clientWidth - trackInset, 0);
  const visibleRatio = rail.clientWidth / rail.scrollWidth;
  const thumbWidth = Math.max(trackWidth * visibleRatio, 42);
  const maxThumbX = Math.max(trackWidth - thumbWidth, 0);
  const scrollRatio = maxScroll > 0 ? rail.scrollLeft / maxScroll : 0;
  const thumbX = maxThumbX * scrollRatio;

  wrap.style.setProperty('--scroll-thumb-width', thumbWidth + 'px');
  wrap.style.setProperty('--scroll-thumb-x', thumbX + 'px');

  updateRailArrows(rail);
}

function bindDragScroll(rail) {
  if (rail.dataset.dragBound === 'true') return;
  rail.dataset.dragBound = 'true';

  let isPointerDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let moved = false;
  let pointerId = null;

  const start = (clientX) => {
    isPointerDown = true;
    moved = false;
    rail.classList.add('is-dragging');
    startX = clientX;
    scrollLeft = rail.scrollLeft;
  };

  const move = (clientX) => {
    if (!isPointerDown) return;
    const walk = (clientX - startX) * 1.15;
    if (Math.abs(walk) > 3) moved = true;
    rail.scrollLeft = scrollLeft - walk;
    updateScrollIndicator(rail);
  };

  const end = () => {
    isPointerDown = false;
    rail.classList.remove('is-dragging');
    pointerId = null;
  };

  // Prefer Pointer Events for unified pointer handling
  if (window.PointerEvent) {
    rail.addEventListener('pointerdown', (e) => {
      if (e.button && e.button !== 0) return;
      pointerId = e.pointerId;
      try {
        rail.setPointerCapture && rail.setPointerCapture(e.pointerId);
      } catch (err) {}
      start(e.clientX);
    });

    rail.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;
      e.preventDefault();
      move(e.clientX);
    });

    rail.addEventListener('pointerup', (e) => {
      if (pointerId === e.pointerId) {
        try {
          rail.releasePointerCapture && rail.releasePointerCapture(e.pointerId);
        } catch (err) {}
        end();
      }
    });

    rail.addEventListener('pointercancel', end);
  } else {
    // Fallback for older browsers
    rail.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      start(e.pageX);
    });

    rail.addEventListener('mousemove', (e) => {
      if (!isPointerDown) return;
      e.preventDefault();
      move(e.pageX);
    });

    rail.addEventListener('mouseleave', end);

    rail.addEventListener(
      'touchstart',
      (e) => {
        if (!e.touches.length) return;
        start(e.touches[0].pageX);
      },
      { passive: true }
    );

    rail.addEventListener(
      'touchmove',
      (e) => {
        if (!isPointerDown || !e.touches.length) return;
        move(e.touches[0].pageX);
      },
      { passive: true }
    );

    rail.addEventListener('touchend', end);
  }

  rail.addEventListener('scroll', () => updateScrollIndicator(rail));

  // Prevent click if dragging happened
  rail.querySelectorAll('.variant-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  });

  // Keyboard support for accessibility
  if (!rail.hasAttribute('tabindex')) rail.tabIndex = 0;
  rail.addEventListener('keydown', (e) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'];
    if (!keys.includes(e.key)) return;
    let amount = 0;
    if (e.key === 'ArrowLeft') amount = -Math.max(rail.clientWidth * 0.5, 80);
    if (e.key === 'ArrowRight') amount = Math.max(rail.clientWidth * 0.5, 80);
    if (e.key === 'PageUp') amount = -rail.clientWidth;
    if (e.key === 'PageDown') amount = rail.clientWidth;
    if (e.key === 'Home') {
      rail.scrollTo({ left: 0, behavior: 'smooth' });
      e.preventDefault();
      return;
    }
    if (e.key === 'End') {
      rail.scrollTo({ left: rail.scrollWidth, behavior: 'smooth' });
      e.preventDefault();
      return;
    }
    if (amount !== 0) {
      rail.scrollBy({ left: amount, behavior: 'smooth' });
      e.preventDefault();
    }
  });
}

function initRails(scope = document) {
  scope.querySelectorAll('.quick_atc_box').forEach((rail) => {
    ensureRailArrows(rail);
    bindDragScroll(rail);
    updateScrollIndicator(rail);
  });
}

function initScrollIndicators(scope = document) {
  scope.querySelectorAll('.quick_atc_box').forEach((rail) => {
    updateScrollIndicator(rail);
  });
}

function refreshRails(scope = document) {
  initRails(scope);

  requestAnimationFrame(() => {
    initScrollIndicators(scope);
  });

  setTimeout(() => {
    initScrollIndicators(scope);
  }, 120);

  setTimeout(() => {
    initScrollIndicators(scope);
  }, 300);
}

/* =========================
   COLOR RAIL
   ========================= */

function getColorSwatchCount(rail) {
  const wrap = rail.closest('.color_swatch_wrap');
  if (!wrap) return 0;

  const grid =
    wrap.querySelector('.collection-siblings__grid') ||
    rail.querySelector('.collection-siblings__grid');

  if (!grid) return rail.querySelectorAll('.card-swatch').length;

  return Array.from(grid.children).filter((item) => {
    if (item.hidden) return false;
    if (item.hasAttribute('hidden')) return false;
    return true;
  }).length;
}

function ensureColorArrows(rail) {
  const wrap = rail.closest('.color_swatch_wrap');
  if (!wrap || wrap.dataset.colorArrowsBound === 'true') return;

  wrap.dataset.colorArrowsBound = 'true';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'color_swatch_arrow color_swatch_arrow--prev';
  prev.setAttribute('aria-label', 'Scroll left');
  prev.innerHTML = `
    <svg viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      <path d="M6.8 1.5 2.8 5l4 3.5V1.5Z"></path>
    </svg>
  `;

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'color_swatch_arrow color_swatch_arrow--next';
  next.setAttribute('aria-label', 'Scroll right');
  next.innerHTML = `
    <svg viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      <path d="M3.2 1.5 7.2 5l-4 3.5V1.5Z"></path>
    </svg>
  `;

  wrap.appendChild(prev);
  wrap.appendChild(next);
}

function updateColorArrows(rail) {
  const wrap = rail.closest('.color_swatch_wrap');
  if (!wrap) return;

  const prev = wrap.querySelector('.color_swatch_arrow--prev');
  const next = wrap.querySelector('.color_swatch_arrow--next');
  if (!prev || !next) return;

  const maxScroll = Math.max(rail.scrollWidth - rail.clientWidth, 0);
  const atStart = rail.scrollLeft <= 1;
  const atEnd = rail.scrollLeft >= maxScroll - 1;

  prev.disabled = atStart;
  next.disabled = atEnd;
}

function updateColorIndicator(rail) {
  const wrap = rail.closest('.color_swatch_wrap');
  if (!wrap) return;

  const itemCount = getColorSwatchCount(rail);
  const maxScroll = Math.max(rail.scrollWidth - rail.clientWidth, 0);
  const hasOverflow = maxScroll > 2 && itemCount > 2;

  wrap.classList.toggle('has-overflow', hasOverflow);

  if (!hasOverflow) {
    wrap.style.setProperty('--swatch-thumb-width', '0px');
    wrap.style.setProperty('--swatch-thumb-x', '0px');
    updateColorArrows(rail);
    return;
  }

  const trackInset = window.innerWidth < 750 ? 36 : 40;
  const trackWidth = Math.max(rail.clientWidth - trackInset, 0);
  const visibleRatio = rail.clientWidth / rail.scrollWidth;
  const thumbWidth = Math.max(trackWidth * visibleRatio, 42);
  const maxThumbX = Math.max(trackWidth - thumbWidth, 0);
  const scrollRatio = maxScroll > 0 ? rail.scrollLeft / maxScroll : 0;
  const thumbX = maxThumbX * scrollRatio;

  wrap.style.setProperty('--swatch-thumb-width', thumbWidth + 'px');
  wrap.style.setProperty('--swatch-thumb-x', thumbX + 'px');

  updateColorArrows(rail);
}

function bindColorDragScroll(rail) {
  if (rail.dataset.colorDragBound === 'true') return;
  rail.dataset.colorDragBound = 'true';

  let isPointerDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let moved = false;
  let pointerId = null;

  const start = (clientX) => {
    isPointerDown = true;
    moved = false;
    rail.classList.add('is-dragging');
    startX = clientX;
    scrollLeft = rail.scrollLeft;
  };

  const move = (clientX) => {
    if (!isPointerDown) return;
    const walk = (clientX - startX) * 1.15;
    if (Math.abs(walk) > 3) moved = true;
    rail.scrollLeft = scrollLeft - walk;
    updateColorIndicator(rail);
  };

  const end = () => {
    isPointerDown = false;
    rail.classList.remove('is-dragging');
    pointerId = null;
  };

  if (window.PointerEvent) {
    rail.addEventListener('pointerdown', (e) => {
      if (e.button && e.button !== 0) return;
      pointerId = e.pointerId;
      try {
        rail.setPointerCapture && rail.setPointerCapture(e.pointerId);
      } catch (err) {}
      start(e.clientX);
    });

    rail.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;
      e.preventDefault();
      move(e.clientX);
    });

    rail.addEventListener('pointerup', (e) => {
      if (pointerId === e.pointerId) {
        try {
          rail.releasePointerCapture && rail.releasePointerCapture(e.pointerId);
        } catch (err) {}
        end();
      }
    });

    rail.addEventListener('pointercancel', end);
  } else {
    rail.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      start(e.pageX);
    });

    rail.addEventListener('mousemove', (e) => {
      if (!isPointerDown) return;
      e.preventDefault();
      move(e.pageX);
    });

    rail.addEventListener('mouseleave', end);

    rail.addEventListener(
      'touchstart',
      (e) => {
        if (!e.touches.length) return;
        start(e.touches[0].pageX);
      },
      { passive: true }
    );

    rail.addEventListener(
      'touchmove',
      (e) => {
        if (!isPointerDown || !e.touches.length) return;
        move(e.touches[0].pageX);
      },
      { passive: true }
    );

    rail.addEventListener('touchend', end);
  }

  rail.addEventListener('scroll', () => updateColorIndicator(rail));

  rail.querySelectorAll('.card-swatch').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  });

  // Keyboard support
  if (!rail.hasAttribute('tabindex')) rail.tabIndex = 0;
  rail.addEventListener('keydown', (e) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'];
    if (!keys.includes(e.key)) return;
    let amount = 0;
    if (e.key === 'ArrowLeft') amount = -Math.max(rail.clientWidth * 0.5, 80);
    if (e.key === 'ArrowRight') amount = Math.max(rail.clientWidth * 0.5, 80);
    if (e.key === 'PageUp') amount = -rail.clientWidth;
    if (e.key === 'PageDown') amount = rail.clientWidth;
    if (e.key === 'Home') {
      rail.scrollTo({ left: 0, behavior: 'smooth' });
      e.preventDefault();
      return;
    }
    if (e.key === 'End') {
      rail.scrollTo({ left: rail.scrollWidth, behavior: 'smooth' });
      e.preventDefault();
      return;
    }
    if (amount !== 0) {
      rail.scrollBy({ left: amount, behavior: 'smooth' });
      e.preventDefault();
    }
  });
}

function initColorRails(scope = document) {
  scope.querySelectorAll('.color_swatch_box').forEach((rail) => {
    ensureColorArrows(rail);
    bindColorDragScroll(rail);
    updateColorIndicator(rail);
  });
}

function refreshColorRails(scope = document) {
  initColorRails(scope);

  requestAnimationFrame(() => {
    scope.querySelectorAll('.color_swatch_box').forEach((rail) => {
      updateColorIndicator(rail);
    });
  });

  setTimeout(() => {
    scope.querySelectorAll('.color_swatch_box').forEach((rail) => {
      updateColorIndicator(rail);
    });
  }, 120);
}

/* =========================
   GLOBAL INIT
   ========================= */

function refreshAllRails(scope = document) {
  refreshRails(scope);
  refreshColorRails(scope);
}

document.addEventListener('DOMContentLoaded', () => {
  refreshAllRails(document);
});

window.addEventListener('load', () => {
  refreshAllRails(document);
});

document.addEventListener('shopify:section:load', (event) => {
  const scope = event.target || document;
  refreshAllRails(scope);
});

// Resize handling is debounced below to avoid layout thrash.

// Debounce resize to avoid layout thrash
function debounce(fn, wait) {
  let t = null;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

const debouncedResizeHandler = debounce(() => {
  initScrollIndicators(document);
  document.querySelectorAll('.color_swatch_box').forEach((rail) => updateColorIndicator(rail));
}, 120);

window.addEventListener('resize', debouncedResizeHandler);

/* =========================
   AUTO RE-INIT FOR DYNAMIC SECTIONS
   ========================= */

const quickAtcObserver = new MutationObserver((mutations) => {
  let shouldRefresh = false;

  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;

      if (
        node.matches('.quick_atc_box, .quick_atc_wrap, .color_swatch_box, .color_swatch_wrap, .custom-plp-card') ||
        node.querySelector('.quick_atc_box, .quick_atc_wrap, .color_swatch_box, .color_swatch_wrap, .custom-plp-card')
      ) {
        shouldRefresh = true;
      }
    });
  });

  if (shouldRefresh) {
    refreshAllRails(document);
  }
});

quickAtcObserver.observe(document.body, {
  childList: true,
  subtree: true
});

;(function(){
  function isDataUrl(src){ return typeof src === 'string' && src.indexOf('data:') === 0; }
  function makeBgTransparent(img){
    try{
      if(!img || isDataUrl(img.src)) return;
      if(!img.complete){ img.addEventListener('load', function(){ makeBgTransparent(img); }); return; }
      var w = img.naturalWidth || img.width;
      var h = img.naturalHeight || img.height;
      if(!w || !h) return;
      var canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      var imgData;
      try { imgData = ctx.getImageData(0,0,w,h); } catch(e) { return; }
      var d = imgData.data;
      var threshold = 240; // pixels brighter than this are considered background
      for(var i = 0; i < d.length; i += 4){
        var r = d[i], g = d[i+1], b = d[i+2];
        if(r >= threshold && g >= threshold && b >= threshold){ d[i+3] = 0; }
      }
      ctx.putImageData(imgData, 0, 0);
      img.src = canvas.toDataURL('image/png');
    } catch(err) {
      // likely CORS or unsupported; fail silently
    }
  }

  function init(){
    var selectors = '.custom-plp-card__media img, .collection-siblings__grid img';
    document.querySelectorAll(selectors).forEach(function(img){ makeBgTransparent(img); });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();