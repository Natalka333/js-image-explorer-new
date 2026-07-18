const galleryEl = document.querySelector(".gallery");

const createGalleryMarkup = (images) => {
  return images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
	<li class="photo-card">
    <a class="gallery_link" href="${largeImageURL}">
  <img class="gallery_img" src="${webformatURL}" alt="${tags}" loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <span class="label">Likes</span>
<span class="value">${likes}</span>
    </p>
    <p class="info-item">
    <span class="label">Views</span>
<span class="value">${views}</span>

    </p>
    <p class="info-item">
    <span class="label">Comments</span>
<span class="value">${comments}</span>

    </p>
    <p class="info-item">
    <span class="label">Downloads</span>
<span class="value">${downloads}</span>
    </p>
  </div>
</li>
`;
      },
    )
    .join("");
};

const renderGallery = (markup) => {
  galleryEl.insertAdjacentHTML("beforeend", markup);
};

const clearGallery = () => {
  galleryEl.innerHTML = "";
};

export { createGalleryMarkup, renderGallery, clearGallery };
