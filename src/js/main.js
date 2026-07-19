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

const searchFormEl = document.querySelector(".search-form");
const loaderEl = document.querySelector(".loader");
const buttonEl = document.querySelector(".btn");
const loadMoreBtn = document.querySelector(".load-more");

let query = "";
let page = 1;
const per_page = 20;

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
    // console.log(query);

    if (query === "") {
      showToast("Please enter a search query.");
      return;
    }

    // if (data.hits.length * page === data.totalHits) {
    //   loadMoreBtn.classList.add("unvisible");
    // } else {
    //   loadMoreBtn.classList.remove("unvisible");
    // }

    clearGallery();

    const data = await getImages(query, page, per_page);
    console.log(data);
    if (!data) return;
    if (data.hits.length === 0) {
      showToast(
        "Sorry, there are no images matching your search query. Please try again!",
      );
      return;
    }

    const markup = createGalleryMarkup(data.hits);

    renderGallery(markup);
    loadMoreBtn.classList.remove("unvisible");
    lightbox.refresh();
    searchFormEl.reset();
  } catch (error) {
    showToast("Something went wrong...");
    return;
  } finally {
    loaderEl.classList.add("unvisible");
    buttonEl.disabled = false;
  }
};

const handleLoadMore = async () => {
  loaderEl.classList.remove("unvisible");
  try {
    page += 1;

    const data = await getImages(query, page, per_page);

    console.log(page);
    console.log(per_page);
    console.log(data.totalHits);
    console.log(page * per_page);

    const markup = createGalleryMarkup(data.hits);
    renderGallery(markup);

    if (page >= totalPages) {
      console.log("Hide button");
      loadMoreBtn.classList.add("unvisible");
      console.log(loadMoreBtn.className);
      showToast("We're sorry, but you've reached the end of search results.");
    }

    lightbox.refresh();
  } catch (error) {
    showToast("Something went wrong...");
    return;
  } finally {
    loaderEl.classList.add("unvisible");
  }
};

searchFormEl.addEventListener("submit", handleSearchForm);
loadMoreBtn.addEventListener("click", handleLoadMore);
// const localStorageKey = "favorites";

// searchQuery.value = localStorage.getItem(localStorageKey) ?? "";
//  searchFormEl.addEventListener("input", (evt) => {
//    localStorage.setItem("favorites", query);
//  });
