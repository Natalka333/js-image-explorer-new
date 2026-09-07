const KEY_REQUEST = "local-key-last-request";
const KEY_ACTIVE_REQUEST = "local-key-active-request";

const saveSearchQuery = (query) => {
  const savedRequest = localStorage.getItem(KEY_REQUEST);
  const parsedRequest = JSON.parse(savedRequest);

  let history = savedRequest ? parsedRequest : [];

  if (!history.includes(query)) {
    history.push(query);
  }
  history = history.slice(-5);

  localStorage.setItem(KEY_REQUEST, JSON.stringify(history));
  // localStorage.setItem("local-key-active-request", JSON.stringify(history));
};

const getSearchQuery = () => {
  const savedRequest = localStorage.getItem(KEY_REQUEST);

  if (!savedRequest) {
    return [];
  }
  return JSON.parse(savedRequest);
};

const renderSearchHistory = (querys) => {
  const activeQuery = localStorage.getItem(KEY_ACTIVE_REQUEST);

  return querys
    .map((query) => {
      const activeClass = query === activeQuery ? "active" : "";

      return `<li class="history-item ${activeClass}">${query}</li>`;
    })
    .join("");
};

const saveActiveQuery = (query) => {
  localStorage.setItem(KEY_ACTIVE_REQUEST, query);
};

const getActiveQuery = () => {
  return localStorage.getItem(KEY_ACTIVE_REQUEST);
};

export {
  saveSearchQuery,
  getSearchQuery,
  renderSearchHistory,
  saveActiveQuery,
  getActiveQuery,
};
