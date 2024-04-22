window.addEventListener("load", async () => {
  populateCollegesDropdown();
  populateRegionsDropdown();
});

const cardStart = document.querySelector(".card--start");
const carouselNav = document.querySelector(".carousel__nav--mobile");
const navigationItemContainer = document.querySelector(".navigation-pane__item-container");
const startButton = document.querySelector("#start-btn");

startButton.addEventListener("click", () => {
  startButton.style.display = "none";
  cardStart.style.opacity = 0;
  cardStart.style.zIndex = 0;
  carouselNav.classList.add("show");
  carouselContainer.classList.add("scale-up");
  if (window.innerWidth >= 768) {
    navigationPane.classList.add("fade-in");
    navigationItemContainer.classList.add("show");
    navigationButtons.forEach((button) => {
      button.classList.add("fade-in");
    });
  }
});

const dropdowns = document.querySelectorAll(".card__dropdown");
dropdowns.forEach((dropdown) => {
  const dropdownButton = dropdown.querySelector(".card__input--dropdown");
  const dropdownContent = dropdown.querySelector(".card__dropdown-content");
  const dropdownOptions = dropdown.querySelectorAll(".card__dropdown-item");

  dropdownButton.addEventListener("click", () => {
    closeAllDropdowns(dropdownContent);
    dropdownContent.classList.toggle("show");
    carouselForm.style.zIndex = dropdownContent.classList.contains("show") ? 9999 : 0;
    if (window.innerWidth > 768) {
      const selectedItem = dropdown.querySelector(".card__dropdown-item--selected");
      selectedItem?.scrollIntoView();
    }
  });

  dropdownOptions.forEach((dropdownOption) => {
    dropdownOption.addEventListener("click", (e) => {
      handleDropdownItemClick(e.target, dropdownButton, dropdownContent);
    });
  });
});

const dropdownContents = document.querySelectorAll(".card__dropdown-content");
function closeAllDropdowns(excludedDropdownContent) {
  dropdownContents.forEach((dropdownContent) => {
    if (excludedDropdownContent && dropdownContent === excludedDropdownContent) return;
    dropdownContent.classList.remove("show");
  });
}

function handleDropdownItemClick(option, button, content) {
  if (option.textContent === button.value) return;

  closeAllDropdowns();
  const previousElement = button.previousElementSibling;
  previousElement.value = option.textContent;
  button.value = option.textContent;
  carouselForm.style.zIndex = 0;

  const previousSelected = content.querySelector(".card__dropdown-item--selected");
  previousSelected?.classList.remove("card__dropdown-item--selected");
  option.classList.add("card__dropdown-item--selected");
}

// --------- Courses dropdowns --------- //
function populateMajorsDropdown(majors) {
  const majorDropdown = document.querySelector("#major");
  const majorDropdownButton = majorDropdown.querySelector(".card__input--dropdown");
  const majorContent = majorDropdown.querySelector(".card__dropdown-content");

  // show the major dropdown when a course is selected and have majors
  const majorInput = majorDropdown.querySelector("input[name='major']");
  majorDropdown.classList.toggle("show", majors.length > 0);
  majorInput.value = majorDropdown.classList.contains("show") ? "" : "hidden";

  const majorItemContainer = majorDropdown.querySelector(".card__dropdown-items");
  majorItemContainer.innerHTML = "";
  majorDropdownButton.value = majorDropdownButton.getAttribute("data-default");

  majors.forEach((major) => {
    const majorOption = document.createElement("li");
    majorOption.classList.add("card__dropdown-item");
    majorOption.textContent = major;
    majorItemContainer.appendChild(majorOption);

    // majors dropdown
    majorOption.addEventListener("click", (e) => {
      handleDropdownItemClick(e.target, majorDropdownButton, majorContent);
    });
  });
}

function populateCoursesDropdown(courses) {
  const courseDropdown = document.querySelector("#course");
  const courseDropdownButton = courseDropdown.querySelector(".card__input--dropdown");
  const courseContent = courseDropdown.querySelector(".card__dropdown-content");

  // show the course dropdown when a college is selected and have courses
  courseDropdown.classList.toggle("show", courses.length > 0);

  const courseItemContainer = courseDropdown.querySelector(".card__dropdown-items");
  courseItemContainer.innerHTML = "";
  courseDropdownButton.value = courseDropdownButton.getAttribute("data-default");

  courses.forEach(({ course, majors }) => {
    const courseOption = document.createElement("li");
    courseOption.classList.add("card__dropdown-item");
    courseOption.textContent = course;
    courseItemContainer.appendChild(courseOption);

    // courses dropdown
    courseOption.addEventListener("click", (e) => {
      handleDropdownItemClick(e.target, courseDropdownButton, courseContent);
      populateMajorsDropdown(majors);
    });
  });
}

async function populateCollegesDropdown() {
  const response = await fetch("pup_courses.json");
  const data = await response.json();

  const collegeDropdown = document.querySelector("#college");
  const collegeDropdownButton = collegeDropdown.querySelector(".card__input--dropdown");
  const collegeContent = collegeDropdown.querySelector(".card__dropdown-content");

  data.forEach(({ college, courses }) => {
    const collegeOption = document.createElement("li");
    collegeOption.classList.add("card__dropdown-item");
    collegeOption.textContent = college;
    collegeDropdown.querySelector(".card__dropdown-items").appendChild(collegeOption);

    // college dropdown
    collegeOption.addEventListener("click", (e) => {
      // reset majors dropdown
      const majorDropdown = document.querySelector("#major");
      const majorInput = majorDropdown.querySelector("input[name='major']");
      majorInput.value = "hidden";
      majorDropdown.classList.remove("show");

      handleDropdownItemClick(e.target, collegeDropdownButton, collegeContent);
      populateCoursesDropdown(courses);
    });
  });
}

// --------- Address dropdowns --------- //
const barangayDropdown = document.querySelector("#barangay");
const cityDropdown = document.querySelector("#city");
const provinceDropdown = document.querySelector("#province");

function resetDropdownsValue(level) {
  const dropdowns = [barangayDropdown, cityDropdown, provinceDropdown];
  for (let i = 0; i < level - 1; i++) {
    const dropdown = dropdowns[i];
    const dropdownItemContainer = dropdown.querySelector(".card__dropdown-items");
    const dropdownButton = dropdown.querySelector(".card__input--dropdown");
    dropdownItemContainer.innerHTML = "";
    dropdownButton.value = dropdownButton.getAttribute("data-default");
  }
}

function populateBarangaysDropdown(barangays) {
  const barangayDropdownButton = barangayDropdown.querySelector(".card__input--dropdown");
  const barangayContent = barangayDropdown.querySelector(".card__dropdown-content");

  const barangayItemContainer = barangayDropdown.querySelector(".card__dropdown-items");
  barangayItemContainer.innerHTML = "";
  barangayDropdownButton.value = barangayDropdownButton.getAttribute("data-default");

  barangays.forEach((barangay) => {
    const barangayOption = document.createElement("li");
    barangayOption.classList.add("card__dropdown-item");
    barangayOption.textContent = barangay;
    barangayItemContainer.appendChild(barangayOption);

    // barangay dropdown
    barangayOption.addEventListener("click", (e) => {
      resetDropdownsValue(1);
      handleDropdownItemClick(e.target, barangayDropdownButton, barangayContent);
    });
  });
}

function populateCitiesDropdown(cities) {
  const cityDropdownButton = cityDropdown.querySelector(".card__input--dropdown");
  const cityContent = cityDropdown.querySelector(".card__dropdown-content");

  const cityItemContainer = cityDropdown.querySelector(".card__dropdown-items");
  cityItemContainer.innerHTML = "";
  cityDropdownButton.value = cityDropdownButton.getAttribute("data-default");

  cities.forEach(([city, barangays]) => {
    const cityOption = document.createElement("li");
    cityOption.classList.add("card__dropdown-item");
    cityOption.textContent = city;
    cityItemContainer.appendChild(cityOption);

    // city dropdown
    cityOption.addEventListener("click", (e) => {
      resetDropdownsValue(2);
      handleDropdownItemClick(e.target, cityDropdownButton, cityContent);
      populateBarangaysDropdown(barangays.barangay_list);
    });
  });
}

function populateProvincesDropdown(provinces) {
  const provinceDropdownButton = provinceDropdown.querySelector(".card__input--dropdown");
  const provinceContent = provinceDropdown.querySelector(".card__dropdown-content");

  const provinceItemContainer = provinceDropdown.querySelector(".card__dropdown-items");
  provinceItemContainer.innerHTML = "";
  provinceDropdownButton.value = provinceDropdownButton.getAttribute("data-default");

  provinces.forEach(([province, cities]) => {
    const provinceOption = document.createElement("li");
    provinceOption.classList.add("card__dropdown-item");
    provinceOption.textContent = province;
    provinceItemContainer.appendChild(provinceOption);

    // province dropdown
    provinceOption.addEventListener("click", (e) => {
      resetDropdownsValue(3);
      handleDropdownItemClick(e.target, provinceDropdownButton, provinceContent);
      populateCitiesDropdown(Object.entries(cities.municipality_list));
    });
  });
}

async function populateRegionsDropdown() {
  const response = await fetch("philippine_provinces_cities_municipalities_and_barangays_2019.json");
  const data = await response.json();

  const regionDropdown = document.querySelector("#region");
  const regionDropdownButton = regionDropdown.querySelector(".card__input--dropdown");
  const regionContent = regionDropdown.querySelector(".card__dropdown-content");

  Object.values(data).forEach(({ region_name, province_list }) => {
    const regionOption = document.createElement("li");
    regionOption.classList.add("card__dropdown-item");
    regionOption.textContent = region_name;
    regionDropdown.querySelector(".card__dropdown-items").appendChild(regionOption);

    // region dropdown
    regionOption.addEventListener("click", (e) => {
      resetDropdownsValue(4);
      handleDropdownItemClick(e.target, regionDropdownButton, regionContent);
      populateProvincesDropdown(Object.entries(province_list));
    });
  });
}
