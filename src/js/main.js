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

const lightbox = new SimpleLightbox.default(".gallery a", {
  captionsData: "alt",
  captionPosition: "bottom",
  captionDelay: 250,
});

const handleSearchForm = async (evt) => {
  evt.preventDefault();

  buttonEl.disabled = true;
  loaderEl.classList.remove("unvisible");
  try {
    const query = evt.currentTarget.elements.searchQuery.value.trim();

    if (query === "") {
      showToast("Please enter a search query.");
      return;
    }

    clearGallery();

    const data = await getImages(query);
    if (!data) return;
    if (data.hits.length === 0) {
      showToast(
        "Sorry, there are no images matching your search query. Please try again!",
      );
      return;
    }

    const markup = createGalleryMarkup(data.hits);
    renderGallery(markup);
    lightbox.refresh();
    searchFormEl.reset();
  } catch (error) {
    showToast("Something went wrong...");
    return;

    return;
  } finally {
    loaderEl.classList.add("unvisible");
    buttonEl.disabled = false;
  }
};

searchFormEl.addEventListener("submit", handleSearchForm);

// const localStorageKey = "favorites";

// searchQuery.value = localStorage.getItem(localStorageKey) ?? "";

// form.addEventListener("input", (evt) => {
//   localStorage.setItem(localStorageKey, evt.target.value);
// });
