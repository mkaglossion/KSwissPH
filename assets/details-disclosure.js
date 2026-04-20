class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.content = this.mainDetailsToggle.querySelector('summary').nextElementSibling;

    this.mainDetailsToggle.addEventListener('focusout', this.onFocusOut.bind(this));
    this.mainDetailsToggle.addEventListener('toggle', this.onToggle.bind(this));
    
    // Close menu on Escape key for better accessibility
    this.mainDetailsToggle.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.mainDetailsToggle.hasAttribute('open')) {
        event.preventDefault();
        this.close();
        this.mainDetailsToggle.querySelector('summary').focus();
      }
    });
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
      this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', 'true');
    } else {
      this.animations.forEach((animation) => animation.cancel());
      this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', 'false');
    }
  }

  close() {
    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', 'false');
  }
}

customElements.define('details-disclosure', DetailsDisclosure);

class HeaderMenu extends DetailsDisclosure {
  constructor() {
    super();
    this.header = document.querySelector('.header-wrapper');
    this.isDesktop = window.innerWidth >= 990;
    this.hoverTimeout = null;
    
    // Add hover listeners to the entire header-menu element
    this.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    this.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    
    // Override focusout to not interfere with hover on desktop
    if (this.isDesktop) {
      this.mainDetailsToggle.removeEventListener('focusout', this.onFocusOut.bind(this));
      this.mainDetailsToggle.addEventListener('focusout', this.onDesktopFocusOut.bind(this));
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

  onMouseEnter() {
    // Open the menu on hover (only on desktop)
    if (window.innerWidth >= 990) {
      clearTimeout(this.hoverTimeout);
      this.mainDetailsToggle.setAttribute('open', '');
    }
  }

  onMouseLeave() {
    // Close the menu when mouse leaves (with small delay for smooth transition)
    if (window.innerWidth >= 990) {
      this.hoverTimeout = setTimeout(() => {
        this.mainDetailsToggle.removeAttribute('open');
      }, 150);
    }
  }

  onDesktopFocusOut() {
    // Only close on focusout if menu isn't being hovered
    setTimeout(() => {
      if (!this.contains(document.activeElement) && !this.mainDetailsToggle.matches(':hover')) {
        this.close();
      }
    });
  }
}

customElements.define('header-menu', HeaderMenu);
