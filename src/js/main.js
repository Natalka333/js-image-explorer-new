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
import {
  saveSearchQuery,
  getSearchQuery,
  renderSearchHistory,
} from "./search-history.js";

const searchFormEl = document.querySelector(".search-form");
const loaderEl = document.querySelector(".loader");
const buttonEl = document.querySelector(".btn");
const loadMoreBtn = document.querySelector(".load-more");
const backToTopBtn = document.querySelector(".back-to-top");
const historyListEl = document.querySelector(".history-list");

let query = "";
let page = 1;
let totalPages = 0;

const PER_PAGE = 20;

const lightbox = new SimpleLightbox.default(".gallery a", {
  captionsData: "alt",
  captionPosition: "bottom",
  captionDelay: 250,
});

//Создается функция. Она принимает один параметр
const performSearch = async (searchQuery) => {
  loaderEl.classList.remove("unvisible");

  try {
    query = searchQuery;
    //Каждый новый поиск начинается с первой страницы
    page = 1;
    // Удаляем старые картинки
    clearGallery();
    // поиск данных
    const data = await getImages(query, page, PER_PAGE);

    if (!data.hits.length) {
      showToast(
        "Sorry, there are no images matching your search query. Please try again!",
      );
      return;
    }
    // Из массива объектов делаем HTML.
    const markup = createGalleryMarkup(data.hits);
    // Добавляем этот HTML в DOM
    renderGallery(markup);
    // округляет количество страниц в большую сторону
    totalPages = Math.ceil(data.totalHits / PER_PAGE);

    if (totalPages > 1) {
      loadMoreBtn.classList.remove("unvisible");
    }
    //SimpleLightbox заново считывает ссылки.
    //  Иначе новые картинки не откроются
    lightbox.refresh();

    searchFormEl.reset();
  } catch (error) {
    console.error(error);
    showToast("Something went wrong...");
  } finally {
    loaderEl.classList.add("unvisible");
  }
};

const handleSearchForm = async (evt) => {
  // Не даем браузеру перезагрузить страницу.
  evt.preventDefault();

  loadMoreBtn.classList.add("unvisible");
  //Отключаем кнопку, чтобы нельзя было нажать 20 раз.
  buttonEl.disabled = true;

  // Берем текст из input
  const searchQuery = evt.currentTarget.elements.searchQuery.value.trim();

  if (!searchQuery) {
    showToast("Please enter a search query.");
    buttonEl.disabled = false;
    return;
  }
  try {
    saveSearchQuery(searchQuery);

    const updatedQueries = getSearchQuery();

    historyListEl.innerHTML = renderSearchHistory(updatedQueries);
    // обычный поиск
    await performSearch(searchQuery);
  } finally {
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

const savedQueries = getSearchQuery();

if (savedQueries.length) {
  const lastQuery = savedQueries[savedQueries.length - 1];

  searchFormEl.elements.searchQuery.value = lastQuery;
  performSearch(lastQuery);
}

historyListEl.innerHTML = renderSearchHistory(savedQueries);

const handleHistorySearch = (evt) => {
  if (!evt.target.classList.contains("history-item")) {
    return;
  }
  const searchQuery = evt.target.textContent;

  document.querySelector(".history-item.active")?.classList.remove("active");
  evt.target.classList.add("active");

  searchFormEl.elements.searchQuery.value = searchQuery;
  // поиск при клике по истории
  performSearch(searchQuery);
};
historyListEl.addEventListener("click", handleHistorySearch);
