const smoothScroll = () => {
  const card = document.querySelector(".photo-card");
  const cardHeight = card.getBoundingClientRect().height;

  window.scrollBy({
    top: cardHeight * 1.5,
    behavior: "smooth",
  });
};

const smoothScrollTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export { smoothScroll, smoothScrollTop };
