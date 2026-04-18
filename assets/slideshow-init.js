document.addEventListener('DOMContentLoaded', function() {
  const slideshows = document.querySelectorAll('[id^="Slideshow-"]');
  
  slideshows.forEach(slideshow => {
    // Check if Slick is already initialized
    if (!slideshow.classList.contains('slick-initialized')) {
      // Initialize Slick carousel
      if (typeof $ !== 'undefined' && $.fn.slick) {
        $(slideshow).slick({
          dots: true,
          arrows: true,
          infinite: true,
          speed: 500,
          fade: true,
          cssEase: 'linear',
          autoplay: slideshow.dataset.autorotate === 'true' || slideshow.dataset.autorotate === true,
          autoplaySpeed: parseInt(slideshow.dataset.speed) || 5000,
          prevArrow: '<button type="button" class="slick-prev"></button>',
          nextArrow: '<button type="button" class="slick-next"></button>'
        });
        
        // Handle height adaptation
        if (slideshow.dataset.adaptHeight === 'true') {
          const updateHeight = () => {
            const activeSlide = slideshow.querySelector('.slick-active');
            if (activeSlide) {
              slideshow.style.height = activeSlide.offsetHeight + 'px';
            }
          };
          
          $(slideshow).on('afterChange', updateHeight);
          updateHeight();
        }
        
        // Update mobile text display on slide change
        $(slideshow).on('afterChange', function(event, slick, currentSlide) {
          const mobileTextWrap = slideshow.closest('[data-section-type="slideshow-section"]')?.querySelector('.slideshow__text-wrap--mobile');
          if (mobileTextWrap) {
            const mobileTexts = mobileTextWrap.querySelectorAll('.slideshow__text-content--mobile');
            mobileTexts.forEach((text, index) => {
              text.style.display = index === currentSlide ? 'block' : 'none';
            });
          }
        });
      }
    }
  });
});
