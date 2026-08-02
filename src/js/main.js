import "modern-normalize";
import "izitoast/dist/css/iziToast.min.css";
import "simplelightbox/dist/simple-lightbox.css";
import SimpleLightbox from "simplelightbox";

import "../css/styles.css";
import { showToast } from "./notifications.js";
import {
  createGalleryMarkup,
  renderGallery,
  clearGallery,
} from "./render-functions.js";
import { getImages } from "./pixabay.js";
import { smoothScroll, smoothScrollTop } from "./scroll.js";

const searchFormEl = document.querySelector(".search-form");
const loaderEl = document.querySelector(".loader");
const buttonEl = document.querySelector(".btn");
const loadMoreBtn = document.querySelector(".load-more");
const backToTopBtn = document.querySelector(".back-to-top");

let query = "";
let page = 1;
const PER_PAGE = 20;
let totalPages = 0;

const lightbox = new SimpleLightbox.default(".gallery a", {
  captionsData: "alt",
  captionPosition: "bottom",
  captionDelay: 250,
});

const handleSearchForm = async (evt) => {
  evt.preventDefault();
  loadMoreBtn.classList.add("unvisible");
  buttonEl.disabled = true;
  loaderEl.classList.remove("unvisible");
  try {
    page = 1;
    query = evt.currentTarget.elements.searchQuery.value.trim();

    if (query === "") {
      showToast("Please enter a search query.");
      return;
    }

    clearGallery();

    const data = await getImages(query, page, PER_PAGE);

    if (!data.hits.length) {
      showToast(
        "Sorry, there are no images matching your search query. Please try again!",
      );
      return;
    }

    const markup = createGalleryMarkup(data.hits);

    renderGallery(markup);

    totalPages = Math.ceil(data.totalHits / PER_PAGE);

    if (totalPages > 1) {
      loadMoreBtn.classList.remove("unvisible");
    }
    lightbox.refresh();
    searchFormEl.reset();
  } catch (error) {
    console.error(error);
    showToast("Something went wrong...");
  } finally {
    loaderEl.classList.add("unvisible");
    buttonEl.disabled = false;
  }
};

const handleLoadMore = async () => {
  loaderEl.classList.remove("unvisible");
  try {
    page++;

    const data = await getImages(query, page, PER_PAGE);

    const markup = createGalleryMarkup(data.hits);
    renderGallery(markup);

    lightbox.refresh();
    //  скрол
    smoothScroll();

    if (page >= totalPages) {
      loadMoreBtn.classList.add("unvisible");
      showToast("We're sorry, but you've reached the end of search results.");
    }
  } catch (error) {
    console.error(error);
    showToast("Something went wrong...");
  } finally {
    loaderEl.classList.add("unvisible");
  }
};

const handleBackToTop = () => {
  smoothScrollTop();
};

searchFormEl.addEventListener("submit", handleSearchForm);
loadMoreBtn.addEventListener("click", handleLoadMore);
backToTopBtn.addEventListener("click", handleBackToTop);

const handleScroll = () => {
  if (window.scrollY > 300) {
    backToTopBtn.classList.remove("unvisible");
  } else {
    backToTopBtn.classList.add("unvisible");
  }
};
window.addEventListener("scroll", handleScroll);
// const localStorageKey = "favorites";

// searchQuery.value = localStorage.getItem(localStorageKey) ?? "";
//  searchFormEl.addEventListener("input", (evt) => {
//    localStorage.setItem("favorites", query);
//  });
