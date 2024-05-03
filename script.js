
var swiper = new Swiper(".home-slider", {
  autoplay: {
    delay: 3500,
    disableOnInteraction: false,
  },
  grabCursor: true,
  loop: true,
});

var swiper = new Swiper(".review-slider", {
  autoplay: {
    delay: 1500,
    disableOnInteraction: false,
  },
  grabCursor: true,
  loop: true,
  spaceBetween: 20,
  centeredSlides: true,
  breakpoints: {
    0: {
      slidesPerView: 1,
    },
    768: {
      slidesPerView: 2,
    },
    991: {
      slidesPerView: 3,
    },
  },
});
