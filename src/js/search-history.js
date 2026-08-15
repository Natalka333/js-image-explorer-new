const KEY_REQUEST = "local-key-last-request";

const saveSearchQuery = (query) => {
  const savedRequest = localStorage.getItem(KEY_REQUEST);
  const parsedRequest = JSON.parse(savedRequest);

  const history = savedRequest ? parsedRequest : [];

  if (!history.includes(query)) {
    history.push(query);
  }
  console.log(history);

  localStorage.setItem(KEY_REQUEST, JSON.stringify(history));
};

const getSearchQuery = () => {
  const savedRequest = localStorage.getItem(KEY_REQUEST);

  if (!savedRequest) {
    return [];
  }

  return JSON.parse(savedRequest);
};

const renderSearchHistory = (querys) => {
  return querys
    .map((query) => {
      return `<li class="history-item">${query}</li>`;
    })
    .join("");
};

export { saveSearchQuery, getSearchQuery, renderSearchHistory };
