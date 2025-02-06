const inputs = document.querySelectorAll(".input-field");
const toggle_button = document.querySelectorAll(".toggle-login");
const main = document.querySelector("main");
const indicators = document.querySelectorAll(".images-indicators span");
const images = document.querySelectorAll(".image");

inputs.forEach((input) => {
  input.addEventListener("focus", () => {
    input.classList.add("active");
  });
  input.addEventListener("blur", () => {
    if (input.value != "") return;
    input.classList.remove("active");
  });
});

toggle_button.forEach((button) => {
  button.addEventListener("click", () => {
    main.classList.toggle("sign-up-mode");
  });
});

function moveSlider() {
  let index = this.dataset.value;

  let currentImage = document.querySelector(`.sign-${index}`);
  images.forEach((image) => image.classList.remove("active"));
  currentImage.classList.add("active");

  const textSlider = document.querySelector(".images-text-list");
  textSlider.style.transform = `translateY(${-(index - 1) * 2.2}rem)`;

  indicators.forEach((indicator) => indicator.classList.remove("active"));
  this.classList.add("active");
}

indicators.forEach((indicator) => {
  indicator.addEventListener("click", moveSlider);
});