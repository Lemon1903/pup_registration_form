const carouselForm = document.querySelector(".carousel");
const carouselContainer = document.querySelector(".carousel__track-container");
const track = document.querySelector(".carousel__track");
const trackContainer = document.querySelector(".carousel__track-container");
const slides = Array.from(track.children).filter((slide) => !slide.classList.contains("carousel__empty"));
const nextButton = document.querySelector(".carousel__btn--next");
const prevButton = document.querySelector(".carousel__btn--prev");
const centerButton = document.querySelector(".carousel__btn--center");
// const allButton = document.querySelector(".carousel__btn--all");
const navigationPane = document.querySelector(".navigation-pane");
const backButton = document.querySelector(".navigation-pane__back");
const navigationButtons = document.querySelectorAll(".navigation-pane__btn");
const nextButtons = document.querySelectorAll(".card__btn--next");
const prevButtons = document.querySelectorAll(".card__btn--prev");
const incompleteMessage = document.querySelector(".navigation-pane__incomplete");

window.addEventListener("load", () => {
  setSlideOffset();
  // setAllButtonText(false);
  setCurrentSlideText();
  setActiveIndicator();
  initializeNavButtons();
  document.querySelector(":root").style.setProperty("--vh", window.innerHeight / 100 + "px");
});

window.addEventListener("resize", () => {
  setSlideOffset();
  if (window.innerHeight <= 768) {
    document.querySelector(":root").style.setProperty("--vh", window.innerHeight / 100 + "px");
  }
});

// handle swipe left and right in carousel track
track.addEventListener("touchstart", handleTouchStart, false);
track.addEventListener("touchmove", handleTouchMove, false);
track.addEventListener("touchend", handleTouchEnd, false);

// allButton.addEventListener("mouseover", () => setAllButtonText(true));
// allButton.addEventListener("mouseout", () => setAllButtonText(false));
// allButton.addEventListener("click", () => {
//   const currentSlide = track.querySelector(".current-slide");
//   const currentSlideIndex = slides.indexOf(currentSlide);
//   slides.forEach((slide) => {
//     const isShrinked = slide.classList.contains("shrink-down");
//     slide.classList.toggle("shrink-down", !isShrinked);
//     slide.classList.toggle("shrink-up", isShrinked);
//     if (!isShrinked && currentSlideIndex > 0) {
//       slide.style.transform = `translateX(50%)`;
//     } else {
//       slide.style.transform = "translateX(0)";
//     }
//   });
//   document.querySelectorAll(".carousel__empty").forEach((empty) => {
//     empty.classList.toggle("shrink");
//   });
//   trackContainer.classList.toggle("shrink");
// });

carouselForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(carouselForm);

  for (let pair of formData.entries()) {
    if ((pair[1] === "" && pair[0] !== "major") || (pair[0] === "major" && pair[1] === "")) return;
  }

  const submitButton = document.querySelector(".card__btn[type='submit']");
  console.log(submitButton);
  centerButton.textContent = "Please wait...";
  submitButton.textContent = "Please wait...";

  setTimeout(() => {
    centerButton.textContent = "Submit";
    submitButton.textContent = "Submit";

    // animation
    const finishPage = document.querySelector(".finish-page");
    carouselContainer.classList.toggle("scale-up");
    carouselContainer.classList.toggle("scale-down");
    navigationPane.classList.toggle("fade-in");
    navigationPane.classList.toggle("fade-out");
    finishPage.classList.toggle("fade-in");
    finishPage.classList.toggle("show");

    console.log("Form submitted successfully!");
  }, 2000);
});

// carousel navigation
nextButton.addEventListener("click", (e) => {
  const currentSlide = track.querySelector(".current-slide");
  const card = currentSlide.querySelector(".card");

  // skip the first 2 cards
  if (card.classList.contains("card--skip")) {
    moveToNextSlide();
    return;
  }

  const isValid = validateField(card);
  if (isValid) moveToNextSlide();
});
prevButton.addEventListener("click", moveToPrevSlide);

centerButton.addEventListener("click", () => {
  if (centerButton.getAttribute("type") !== "submit" && window.innerWidth < 768) {
    navigationPane.style.transform = "translateY(-100%)";
  } else {
    const allValid = validateAllFields();
    if (!allValid) {
      navigationPane.style.transform = "translateY(-100%)";
    }
  }
});

backButton.addEventListener("click", () => {
  navigationPane.style.transform = "translateY(100px)";
});

function initializeNavButtons() {
  navigationButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const currentSlide = track.querySelector(".current-slide");
      const targetSlide = slides[index];
      moveToSlide(currentSlide, targetSlide);
      if (window.innerWidth < 768) {
        navigationPane.style.transform = "translateY(100%)";
      }
    });
    setSlideOffset();
  });
  // card buttons navigation
  nextButtons.forEach((button) => {
    if (button.getAttribute("id") === "start-btn") return;

    button.addEventListener("click", (e) => {
      const card = e.target.parentElement.parentElement;

      // skip the first 2 cards
      if (card.classList.contains("card--skip")) {
        moveToNextSlide();
        return;
      }

      // if all inputs are valid, move to the next slide
      const isValid = validateField(card);
      if (isValid) moveToNextSlide();
      if (button.getAttribute("type") === "submit") validateAllFields();
    });
  });
  prevButtons.forEach((button) => {
    button.addEventListener("click", moveToPrevSlide);
  });
}

function validateField(card) {
  const inputs = card.querySelectorAll("input");
  const title = card.querySelector(".card__title");
  const error = card.querySelector(".error");
  const index = slides.indexOf(card.parentElement);
  const navigationButton = navigationButtons[index];

  const toggleErrors = (inputs, show) => {
    title.classList.toggle("card__title--error", show);
    error?.classList.toggle("show", show);
    card.classList.toggle("shake", show);
    navigationButton.classList.toggle("navigation-pane__btn--error", show);

    // for mobile
    let count = 0;
    navigationButtons.forEach((button) => {
      if (button.classList.contains("navigation-pane__btn--error")) count++;
    });
    incompleteMessage.textContent = count > 1 ? `${count} fields are incomplete` : `${count} field is incomplete`;
    incompleteMessage.classList.toggle("show", count > 0);

    if (inputs instanceof NodeList) {
      inputs.forEach((input) => input.classList.toggle("card__input--error", show));
    } else {
      inputs.classList.toggle("card__input--error", show);
    }
  };

  // reset the error ui in every input field
  inputs.forEach((input) => input.classList.remove("card__input--error"));
  const isValid = Array.from(inputs).every((input) => {
    // for the major dropdown
    if (title.textContent === "Course Program") {
      const dropdown = input.parentElement.parentElement;
      if (
        (dropdown.getAttribute("id") !== "major" && input.value === input.getAttribute("data-default")) ||
        (dropdown.getAttribute("id") === "major" &&
          dropdown.classList.contains("show") &&
          input.value === input.getAttribute("data-default"))
      ) {
        toggleErrors(input, true);
        setTimeout(() => card.classList.remove("shake"), 500);
        return false;
      }
    }

    // for the address inputs
    if (title.textContent === "Address") {
      if (input.value === input.getAttribute("data-default")) {
        toggleErrors(input, true);
        setTimeout(() => card.classList.remove("shake"), 500);
        return false;
      }
    }

    const valid = input.checkValidity();
    // add the error ui in every elements and shake the card
    if (!valid) {
      toggleErrors(input, true);
      setTimeout(() => card.classList.remove("shake"), 500);
    }
    return valid;
  });

  if (isValid) {
    toggleErrors(inputs, false);
    navigationButton.classList.add("navigation-pane__btn--done");
  }

  return isValid;
}

function validateAllFields() {
  let count = 0;
  let allValid = true;
  navigationButtons.forEach((button, index) => {
    if (!button.classList.contains("navigation-pane__btn--done")) {
      const slide = slides[index];
      const card = slide.querySelector(".card");
      const isValid = validateField(card);
      if (!isValid) count++;
      allValid = allValid && isValid;
    }
  });
  incompleteMessage.textContent = count > 1 ? `${count} fields are incomplete` : `${count} field is incomplete`;
  incompleteMessage.classList.toggle("show", count > 0);
  return allValid;
}

function moveToNextSlide() {
  const currentSlide = track.querySelector(".current-slide");
  const nextSlide = currentSlide.nextElementSibling;
  if (nextSlide && !nextSlide.classList.contains("carousel__empty")) {
    moveToSlide(currentSlide, nextSlide);
  }
}

function moveToPrevSlide() {
  const currentSlide = track.querySelector(".current-slide");
  const prevSlide = currentSlide.previousElementSibling;
  if (prevSlide && !prevSlide.classList.contains("carousel__empty")) {
    moveToSlide(currentSlide, prevSlide);
  }
}

function moveToSlide(currentSlide, targetSlide) {
  track.style.transform = "translateX(-" + targetSlide.getAttribute("data-offset") + ")";
  // reset the previous slide
  currentSlide.classList.remove("current-slide");
  if (window.innerWidth < 768) {
    currentSlide.style.transform = "scaleY(0.9)";
  }
  // set the new slide
  targetSlide.classList.add("current-slide");
  targetSlide.style.transform = "scaleY(1)";
  // check if the new slide is the first or last
  const currentSlideIndex = getCurrentSlidesIndex();
  prevButton.classList.toggle("hide", currentSlideIndex === 0);
  nextButton.classList.toggle("hide", currentSlideIndex === slides.length - 1);
  // change the shown slides in center button
  setCurrentSlideText();
  // add the active indicator to the navigation pane
  setActiveIndicator();
}

// function setAllButtonText(hovered) {
//   if (hovered) {
//     allButton.textContent = "See All";
//     return;
//   }
//   allButton.textContent = `${getCurrentSlidesIndex() + 1} of ${slides.length}`;
// }

function setCurrentSlideText() {
  const currentSlideIndex = getCurrentSlidesIndex();
  centerButton.textContent = `${currentSlideIndex + 1} of ${slides.length}`;
  centerButton.setAttribute("type", "button");
  if (currentSlideIndex === slides.length - 1) {
    centerButton.textContent = "Submit";
    centerButton.setAttribute("type", "submit");
  }
}

function setActiveIndicator() {
  const currentIndicator = document.querySelector(".navigation-pane__btn--active");
  const targetIndicator = navigationButtons[getCurrentSlidesIndex()];
  currentIndicator.classList.remove("navigation-pane__btn--active");
  targetIndicator.classList.add("navigation-pane__btn--active");
}

function setSlideOffset() {
  const currentSlide = track.querySelector(".current-slide");
  slides.forEach((slide, index) => {
    const width = window.getComputedStyle(slide).getPropertyValue("width");
    const computedWidth = parseInt(width.split("px")[0]);
    if (window.innerWidth < 768) {
      slide.style.transform = `scaleY(${slide === currentSlide ? 1 : 0.9})`;
    }
    slide.setAttribute("data-offset", computedWidth * index + "px");
  });
  track.style.transform = `translateX(-${currentSlide.getAttribute("data-offset")})`;
}

function getCurrentSlidesIndex() {
  const currentSlide = track.querySelector(".current-slide");
  return slides.indexOf(currentSlide);
}

// ------- swipe gesture handler ------- //
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
}

function handleTouchMove(e) {
  e.preventDefault();
  touchEndX = e.touches[0].clientX;
}

function handleTouchEnd() {
  // prevent moving the carousel if just a click happened
  if (touchEndX === 0) return;

  let deltaX = touchEndX - touchStartX;
  let threshold = 100;

  if (deltaX > threshold) {
    // swipe right
    touchStartX = 0;
    touchEndX = 0;
    moveToPrevSlide();
  } else if (deltaX < -threshold) {
    // Swipe left
    touchStartX = 0;
    touchEndX = 0;
    moveToNextSlide();
  }
}
