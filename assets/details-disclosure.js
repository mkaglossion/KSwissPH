class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.content = this.mainDetailsToggle.querySelector('summary').nextElementSibling;

    this.mainDetailsToggle.addEventListener('focusout', this.onFocusOut.bind(this));
    this.mainDetailsToggle.addEventListener('toggle', this.onToggle.bind(this));
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  onToggle() {
    if (!this.animations) this.animations = this.content.getAnimations();

    if (this.mainDetailsToggle.hasAttribute('open')) {
      this.animations.forEach((animation) => animation.play());
    } else {
      this.animations.forEach((animation) => animation.cancel());
    }
  }

  close() {
    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
  }
}

customElements.define('details-disclosure', DetailsDisclosure);

class HeaderMenu extends DetailsDisclosure {
  constructor() {
    super();
    this.header = document.querySelector('.header-wrapper');
    this.hoverTimeout = null;
    this._boundOnHoverIn = this.onHoverIn.bind(this);
    this._boundOnHoverOut = this.onHoverOut.bind(this);
    this._boundOnResize = this._onResize.bind(this);

    // Initialize hover behavior depending on viewport
    this.updateHoverListeners();
    window.addEventListener('resize', this._boundOnResize);
  }

  _onResize() {
    // Update hover listeners when crossing breakpoint thresholds
    this.updateHoverListeners();
  }

  updateHoverListeners() {
    const isDesktop = window.innerWidth >= 990;
    if (isDesktop && !this._hoverEnabled) {
      this.addEventListener('mouseenter', this._boundOnHoverIn);
      this.addEventListener('mouseleave', this._boundOnHoverOut);
      this._hoverEnabled = true;
    } else if (!isDesktop && this._hoverEnabled) {
      this.removeEventListener('mouseenter', this._boundOnHoverIn);
      this.removeEventListener('mouseleave', this._boundOnHoverOut);
      this._hoverEnabled = false;
    }
  }

  onHoverIn() {
    // Clear any pending close timeout
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    // Open immediately on hover
    this.mainDetailsToggle.setAttribute('open', '');
  }

  onHoverOut() {
    // Close after small delay to allow moving to submenu
    this.hoverTimeout = setTimeout(() => {
      if (!this.mainDetailsToggle.open) return;
      this.mainDetailsToggle.removeAttribute('open');
    }, 200);
  }

  onToggle() {
    if (!this.header) return;
    this.header.preventHide = this.mainDetailsToggle.open;

    if (document.documentElement.style.getPropertyValue('--header-bottom-position-desktop') !== '') return;
    document.documentElement.style.setProperty(
      '--header-bottom-position-desktop',
      `${Math.floor(this.header.getBoundingClientRect().bottom)}px`
    );
  }

  disconnectedCallback() {
    // Cleanup listeners
    window.removeEventListener('resize', this._boundOnResize);
    if (this._hoverEnabled) {
      this.removeEventListener('mouseenter', this._boundOnHoverIn);
      this.removeEventListener('mouseleave', this._boundOnHoverOut);
    }
  }
}

customElements.define('header-menu', HeaderMenu);
