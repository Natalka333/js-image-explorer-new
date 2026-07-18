import iziToast from "izitoast";

const showToast = (message) => {
  iziToast.error({
    message,
    position: "topCenter",
    timeout: 3000,
  });
};

export { showToast };
