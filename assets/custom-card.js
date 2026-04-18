// custom-card.js
// Size and Color Rail Functions for Product Cards

// ============================================
// MAIN INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  initAllRails();
});

document.addEventListener('shopify:section:load', function(event) {
  initAllRails(event.target);
});

function initAllRails(scope) {
  scope = scope || document;
  initSizeRails(scope);
  initColorRails(scope);
}

// ============================================
// SIZE RAIL FUNCTIONS
// ============================================
function initSizeRails(scope) {
  var sizeBoxes = scope.querySelectorAll('.quick_atc_box');
  for (var i = 0; i < sizeBoxes.length; i++) {
    var rail = sizeBoxes[i];
    if (rail.dataset.initialized === 'true') continue;
    rail.dataset.initialized = 'true';
    
    ensureSizeRailArrows(rail);
    bindSizeRailDrag(rail);
    updateSizeRailIndicator(rail);
    
    rail.addEventListener('scroll', function() {
      updateSizeRailIndicator(this);
    });
  }
}

function ensureSizeRailArrows(rail) {
  var wrap = rail.closest('.quick_atc_wrap');
  if (!wrap) return;
  if (wrap.querySelector('.quick_atc_arrow')) return;
  
  var prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'quick_atc_arrow quick_atc_arrow--prev';
  prev.setAttribute('aria-label', 'Scroll left');
  prev.innerHTML = '<svg viewBox="0 0 10 10" fill="currentColor"><path d="M6.8 1.5 2.8 5l4 3.5V1.5Z"></path></svg>';
  
  var next = document.createElement('button');
  next.type = 'button';
  next.className = 'quick_atc_arrow quick_atc_arrow--next';
  next.setAttribute('aria-label', 'Scroll right');
  next.innerHTML = '<svg viewBox="0 0 10 10" fill="currentColor"><path d="M3.2 1.5 7.2 5l-4 3.5V1.5Z"></path></svg>';
  
  wrap.appendChild(prev);
  wrap.appendChild(next);
  
  prev.addEventListener('click', function(e) {
    e.stopPropagation();
    rail.scrollBy({ left: -Math.max(rail.clientWidth * 0.7, 120), behavior: 'smooth' });
  });
  
  next.addEventListener('click', function(e) {
    e.stopPropagation();
    rail.scrollBy({ left: Math.max(rail.clientWidth * 0.7, 120), behavior: 'smooth' });
  });
}

function bindSizeRailDrag(rail) {
  if (rail.dataset.dragBound === 'true') return;
  rail.dataset.dragBound = 'true';
  
  var isDown = false;
  var startX = 0;
  var scrollLeft = 0;
  var moved = false;
  
  rail.addEventListener('mousedown', function(e) {
    isDown = true;
    moved = false;
    rail.style.cursor = 'grabbing';
    startX = e.pageX - rail.offsetLeft;
    scrollLeft = rail.scrollLeft;
    e.preventDefault();
  });
  
  rail.addEventListener('mouseleave', function() {
    isDown = false;
    rail.style.cursor = 'grab';
  });
  
  rail.addEventListener('mouseup', function() {
    isDown = false;
    rail.style.cursor = 'grab';
  });
  
  rail.addEventListener('mousemove', function(e) {
    if (!isDown) return;
    e.preventDefault();
    var x = e.pageX - rail.offsetLeft;
    var walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 3) moved = true;
    rail.scrollLeft = scrollLeft - walk;
    updateSizeRailIndicator(rail);
  });
  
  rail.style.cursor = 'grab';
}

function updateSizeRailIndicator(rail) {
  var wrap = rail.closest('.quick_atc_wrap');
  if (!wrap) return;
  
  var maxScroll = Math.max(rail.scrollWidth - rail.clientWidth, 0);
  var hasOverflow = maxScroll > 2;
  
  if (hasOverflow) {
    wrap.classList.add('has-overflow');
  } else {
    wrap.classList.remove('has-overflow');
  }
  
  if (!hasOverflow) {
    wrap.style.setProperty('--scroll-thumb-width', '0px');
    wrap.style.setProperty('--scroll-thumb-x', '0px');
    return;
  }
  
  var trackInset = window.innerWidth < 750 ? 32 : 36;
  var trackWidth = Math.max(rail.clientWidth - trackInset, 0);
  var visibleRatio = rail.clientWidth / rail.scrollWidth;
  var thumbWidth = Math.max(trackWidth * visibleRatio, 42);
  var maxThumbX = Math.max(trackWidth - thumbWidth, 0);
  var scrollRatio = maxScroll > 0 ? rail.scrollLeft / maxScroll : 0;
  var thumbX = maxThumbX * scrollRatio;
  
  wrap.style.setProperty('--scroll-thumb-width', thumbWidth + 'px');
  wrap.style.setProperty('--scroll-thumb-x', thumbX + 'px');
  
  var prev = wrap.querySelector('.quick_atc_arrow--prev');
  var next = wrap.querySelector('.quick_atc_arrow--next');
  if (prev) prev.disabled = rail.scrollLeft <= 1;
  if (next) next.disabled = rail.scrollLeft >= maxScroll - 1;
}

// ============================================
// COLOR RAIL FUNCTIONS
// ============================================
function initColorRails(scope) {
  var colorBoxes = scope.querySelectorAll('.color_swatch_box');
  for (var i = 0; i < colorBoxes.length; i++) {
    var rail = colorBoxes[i];
    if (rail.dataset.initialized === 'true') continue;
    rail.dataset.initialized = 'true';
    
    ensureColorRailArrows(rail);
    bindColorRailDrag(rail);
    updateColorRailIndicator(rail);
    
    rail.addEventListener('scroll', function() {
      updateColorRailIndicator(this);
    });
  }
}

function ensureColorRailArrows(rail) {
  var wrap = rail.closest('.color_swatch_wrap');
  if (!wrap) return;
  if (wrap.querySelector('.color_swatch_arrow')) return;
  
  var prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'color_swatch_arrow color_swatch_arrow--prev';
  prev.setAttribute('aria-label', 'Scroll left');
  prev.innerHTML = '<svg viewBox="0 0 10 10" fill="currentColor"><path d="M6.8 1.5 2.8 5l4 3.5V1.5Z"></path></svg>';
  
  var next = document.createElement('button');
  next.type = 'button';
  next.className = 'color_swatch_arrow color_swatch_arrow--next';
  next.setAttribute('aria-label', 'Scroll right');
  next.innerHTML = '<svg viewBox="0 0 10 10" fill="currentColor"><path d="M3.2 1.5 7.2 5l-4 3.5V1.5Z"></path></svg>';
  
  wrap.appendChild(prev);
  wrap.appendChild(next);
  
  prev.addEventListener('click', function(e) {
    e.stopPropagation();
    rail.scrollBy({ left: -Math.max(rail.clientWidth * 0.7, 120), behavior: 'smooth' });
  });
  
  next.addEventListener('click', function(e) {
    e.stopPropagation();
    rail.scrollBy({ left: Math.max(rail.clientWidth * 0.7, 120), behavior: 'smooth' });
  });
}

function bindColorRailDrag(rail) {
  if (rail.dataset.dragBound === 'true') return;
  rail.dataset.dragBound = 'true';
  
  var isDown = false;
  var startX = 0;
  var scrollLeft = 0;
  var moved = false;
  
  rail.addEventListener('mousedown', function(e) {
    isDown = true;
    moved = false;
    rail.style.cursor = 'grabbing';
    startX = e.pageX - rail.offsetLeft;
    scrollLeft = rail.scrollLeft;
    e.preventDefault();
  });
  
  rail.addEventListener('mouseleave', function() {
    isDown = false;
    rail.style.cursor = 'grab';
  });
  
  rail.addEventListener('mouseup', function() {
    isDown = false;
    rail.style.cursor = 'grab';
  });
  
  rail.addEventListener('mousemove', function(e) {
    if (!isDown) return;
    e.preventDefault();
    var x = e.pageX - rail.offsetLeft;
    var walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 3) moved = true;
    rail.scrollLeft = scrollLeft - walk;
    updateColorRailIndicator(rail);
  });
  
  rail.style.cursor = 'grab';
}

function updateColorRailIndicator(rail) {
  var wrap = rail.closest('.color_swatch_wrap');
  if (!wrap) return;
  
  var maxScroll = Math.max(rail.scrollWidth - rail.clientWidth, 0);
  var hasOverflow = maxScroll > 2;
  
  if (hasOverflow) {
    wrap.classList.add('has-overflow');
  } else {
    wrap.classList.remove('has-overflow');
  }
  
  if (!hasOverflow) {
    wrap.style.setProperty('--swatch-thumb-width', '0px');
    wrap.style.setProperty('--swatch-thumb-x', '0px');
    return;
  }
  
  var trackInset = window.innerWidth < 750 ? 36 : 40;
  var trackWidth = Math.max(rail.clientWidth - trackInset, 0);
  var visibleRatio = rail.clientWidth / rail.scrollWidth;
  var thumbWidth = Math.max(trackWidth * visibleRatio, 42);
  var maxThumbX = Math.max(trackWidth - thumbWidth, 0);
  var scrollRatio = maxScroll > 0 ? rail.scrollLeft / maxScroll : 0;
  var thumbX = maxThumbX * scrollRatio;
  
  wrap.style.setProperty('--swatch-thumb-width', thumbWidth + 'px');
  wrap.style.setProperty('--swatch-thumb-x', thumbX + 'px');
  
  var prev = wrap.querySelector('.color_swatch_arrow--prev');
  var next = wrap.querySelector('.color_swatch_arrow--next');
  if (prev) prev.disabled = rail.scrollLeft <= 1;
  if (next) next.disabled = rail.scrollLeft >= maxScroll - 1;
}

// ============================================
// VARIANT BUTTON CLICK HANDLERS
// ============================================
document.addEventListener('click', function(e) {
  // Size variant button handler
  var sizeBtn = e.target.closest('.variant-btn');
  if (sizeBtn && !sizeBtn.disabled) {
    e.preventDefault();
    
    var card = sizeBtn.closest('.custom-plp-card');
    if (!card) return;
    
    var btns = card.querySelectorAll('.variant-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.remove('is-active', 'active');
    }
    sizeBtn.classList.add('is-active', 'active');
    
    var variantId = sizeBtn.dataset.variantId;
    var variantInput = card.querySelector('.product-variant-id');
    if (variantInput && variantId) {
      variantInput.value = variantId;
    }
    return;
  }
  
  // Color swatch handler
  var swatchBtn = e.target.closest('.card-swatch');
  if (swatchBtn) {
    e.preventDefault();
    
    var url = swatchBtn.dataset.url;
    if (url) {
      window.location.href = url;
      return;
    }
    
    var card = swatchBtn.closest('.custom-plp-card');
    if (!card) return;
    
    var swatches = card.querySelectorAll('.card-swatch');
    for (var i = 0; i < swatches.length; i++) {
      swatches[i].classList.remove('is-active', 'active');
    }
    swatchBtn.classList.add('is-active', 'active');
    
    var newImage = swatchBtn.dataset.image;
    var mainImg = card.querySelector('.custom-plp-card__main-image.primary-image');
    if (mainImg && newImage) {
      mainImg.src = newImage;
      mainImg.srcset = '';
    }
    
    var colorName = swatchBtn.dataset.colorName;
    var colorText = card.querySelector('.active-color-name');
    if (colorText && colorName) {
      colorText.textContent = colorName;
    }
    
    var allSizeBtns = card.querySelectorAll('.variant-btn');
    var firstAvailable = null;
    
    for (var i = 0; i < allSizeBtns.length; i++) {
      var btn = allSizeBtns[i];
      var btnColor = btn.dataset.color || '';
      if (!colorName || btnColor === colorName) {
        btn.hidden = false;
        if (!btn.disabled && !firstAvailable) {
          firstAvailable = btn;
        }
      } else {
        btn.hidden = true;
        btn.classList.remove('is-active', 'active');
      }
    }
    
    var variantInput = card.querySelector('.product-variant-id');
    if (firstAvailable) {
      firstAvailable.classList.add('is-active', 'active');
      if (variantInput) {
        variantInput.value = firstAvailable.dataset.variantId;
      }
    }
  }
});

// Force resize handler
window.addEventListener('resize', function() {
  setTimeout(function() {
    document.querySelectorAll('.quick_atc_box').forEach(function(rail) {
      updateSizeRailIndicator(rail);
    });
    document.querySelectorAll('.color_swatch_box').forEach(function(rail) {
      updateColorRailIndicator(rail);
    });
  }, 100);
});