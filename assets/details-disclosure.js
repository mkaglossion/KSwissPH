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
    this._onResize = this._onResize.bind(this);
    this._boundHoverIn = null;
    this._boundHoverOut = null;
    this._hasHover = false;

    // Initialize hover behavior based on current width
    if (window.innerWidth >= 990) this._bindHover();

    // Keep hover behavior responsive to viewport changes
    window.addEventListener('resize', this._onResize);
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

  _bindHover() {
    if (this._hasHover) return;
    this._boundHoverIn = this.onHoverIn.bind(this);
    this._boundHoverOut = this.onHoverOut.bind(this);
    this.addEventListener('mouseenter', this._boundHoverIn);
    this.addEventListener('mouseleave', this._boundHoverOut);
    this._hasHover = true;
  }

  _unbindHover() {
    if (!this._hasHover) return;
    this.removeEventListener('mouseenter', this._boundHoverIn);
    this.removeEventListener('mouseleave', this._boundHoverOut);
    this._boundHoverIn = null;
    this._boundHoverOut = null;
    this._hasHover = false;
  }

  _onResize() {
    if (window.innerWidth >= 990) {
      this._bindHover();
    } else {
      this._unbindHover();
    }
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
}

  disconnectedCallback() {
    // Clean up listeners
    this._unbindHover();
    window.removeEventListener('resize', this._onResize);
  }

}

customElements.define('header-menu', HeaderMenu);
