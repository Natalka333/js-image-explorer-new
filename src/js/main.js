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
  saveActiveQuery,
  getActiveQuery,
} from "./search-history.js";

const searchFormEl = document.querySelector(".search-form");
const loaderEl = document.querySelector(".loader");
const buttonEl = document.querySelector(".btn");
const loadMoreBtn = document.querySelector(".load-more");
const backToTopBtn = document.querySelector(".back-to-top");
const historyListEl = document.querySelector(".history-list");

// текущий поисковый запрос
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
  loadMoreBtn.classList.add("unvisible");
  loaderEl.classList.remove("unvisible");

  try {
    query = searchQuery;
    //Каждый новый поиск начинается с первой страницы
    page = 1;
    // Удаляем старые картинки
    clearGallery();
    // поиск данных
    const data = await getImages(query, page, PER_PAGE);

    // console.log(data);
    // console.log("QUERY:", query);
    // console.log("HITS:", data.hits);

    //Если ничего не найдено
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

    //Если страниц больше одной — показываем кнопку.
    if (totalPages > 1) {
      loadMoreBtn.classList.remove("unvisible");
    }

    //SimpleLightbox заново считывает ссылки.
    //  Иначе новые картинки не откроются
    lightbox.refresh();

    //После поиска поле поиска очищается.
    searchFormEl.reset();
  } catch (error) {
    console.error(error);
    showToast("Something went wrong...");
  } finally {
    loaderEl.classList.add("unvisible");
  }
};

//Она срабатывает, когда отправляется форма
const handleSearchForm = async (evt) => {
  // Не даем браузеру перезагрузить страницу.
  evt.preventDefault();

  //Отключаем кнопку, чтобы нельзя было нажать 20 раз.
  buttonEl.disabled = true;

  // Берем текст из input
  const searchQuery = evt.currentTarget.elements.searchQuery.value.trim();

  //Проверяем пустой запрос
  if (!searchQuery) {
    showToast("Please enter a search query.");
    buttonEl.disabled = false;
    return;
  }
  try {
    //Сохраняет запрос в историю.
    saveSearchQuery(searchQuery);

    // Какой запрос сейчас выбран как активный
    saveActiveQuery(searchQuery);
    //Берём обновлённую историю и заново рисуем список.
    const updatedQueries = getSearchQuery();
    historyListEl.innerHTML = renderSearchHistory(updatedQueries);
    //запускаем  обычный поиск
    await performSearch(searchQuery);
  } finally {
    buttonEl.disabled = false;
  }
};

const handleLoadMore = async () => {
  loaderEl.classList.remove("unvisible");
  try {
    page++;
    //query был установлен внутри performSearch() query = searchQuery;
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

//Отслеживаем прокрутку
// Если пользователь прокрутил больше 300 px
const handleScroll = () => {
  if (window.scrollY > 300) {
    backToTopBtn.classList.remove("unvisible");
  } else {
    backToTopBtn.classList.add("unvisible");
  }
};
window.addEventListener("scroll", handleScroll);

//Вот этот блок отвечает именно за восстановление после reload:
//Получаем всю историю запросов
const savedQueries = getSearchQuery();
//Активный запрос
const activeQuery = getActiveQuery();
//Проверяем: вообще есть история?
if (savedQueries.length) {
  //Выбираем, что искать после reload
  // проверим включает ли в сщхраненный активный запрос,
  // «Возьми activeQuery,
  // А ЕСЛИ его нет — возьми последний запрос из истории»
  const queryToSearch = savedQueries.includes(activeQuery)
    ? activeQuery
    : savedQueries[savedQueries.length - 1];

  searchFormEl.elements.searchQuery.value = queryToSearch;
  performSearch(queryToSearch);
}

historyListEl.innerHTML = renderSearchHistory(savedQueries);

//Эта функция работает,
// когда пользователь кликает по элементу истории.
const handleHistorySearch = (evt) => {
  //Проверяем, куда именно нажали
  if (!evt.target.classList.contains("history-item")) {
    return;
  }

  const searchQuery = evt.target.textContent;
  //Если какой-то элемент уже активный — снимаем с него active.
  document.querySelector(".history-item.active")?.classList.remove("active");
  //Теперь нажатый элемент становится активным.
  evt.target.classList.add("active");
  //Запоминаем его в Storage
  saveActiveQuery(searchQuery);
  //Записываем запрос в input
  searchFormEl.elements.searchQuery.value = searchQuery;
  // поиск при клике по истории
  performSearch(searchQuery);
};
historyListEl.addEventListener("click", handleHistorySearch);
