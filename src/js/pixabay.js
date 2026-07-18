import axios from "axios";

const API_KEY = "38739030-af5614da71e4107ffbd422430";
const BASE_URL = "https://pixabay.com/api/";

// const params = new URLSearchParams({
//   key: API_KEY,
//   q: query,
//   image_type: "photo",
//   orientation: "horizontal",
//   safesearch: true,
// });

const getImages = async (query) => {
  const response = await axios.get(BASE_URL, {
    params: {
      key: API_KEY,
      q: query,
      image_type: "photo",
      orientation: "horizontal",
      safesearch: true,
    },
  });
  return response.data;
};

// getImages("cat");
export { getImages };
