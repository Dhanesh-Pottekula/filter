const API_KEY = "44294615-96a26509785b168e783b29a5d";
const API_URL = `https://pixabay.com/api/?key=${API_KEY}&image_type=photo&pretty=true`;

let currentPage = 1;
let columns = 3;
let loading = false;

const gallery = document.getElementById("gallery");
const columnsRange = document.getElementById("columnsRange");
const columnsValue = document.getElementById("columnsValue");

let selectedIndex;
columnsValue.textContent = columns;
gallery.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

columnsRange.addEventListener("input", (e) => {
  columns = e.target.value;
  columnsValue.textContent = columns;
  gallery.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
});

const fetchImages = async (page) => {
  if (loading) return;
  loading = true;

  const response = await fetch(`${API_URL}&page=${page}`);
  const data = await response.json();
  data.hits.forEach((hit) => {
    const imgContainer = document.createElement("div");
    imgContainer.className = "image-container";

    const img = document.createElement("img");
    img.dataset.src = hit.webformatURL;

    // img.alt = hit.tags;

    imgContainer.appendChild(img);
    gallery.appendChild(imgContainer);
  });

  loading = false;
  lazyLoadImages();
};

const lazyLoadImages = () => {
  const images = document.querySelectorAll("img[data-src]");

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          observer.unobserve(img);
        }
      }
    });
  });

  images.forEach((image) => {
    observer.observe(image);
  });
};

const handleScroll = () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
    !loading
  ) {
    currentPage++;
    fetchImages(currentPage);
  }
};

const handleKeyDown = (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    const allImages = Array.from(gallery.getElementsByClassName("image-container"));

    // Remove border from previously selected image
    const previouslySelectedImage = document.querySelector(".image-container.selected");
    if (previouslySelectedImage) {
      previouslySelectedImage.classList.remove("selected");
    }

    let nextIndex;
    switch (e.key) {
      case "ArrowRight":
        nextIndex = selectedIndex + 1;
        if (nextIndex < allImages.length) {
          selectedIndex = nextIndex;
        }
        break;
      case "ArrowLeft":
        nextIndex = selectedIndex - 1;
        if (nextIndex >= 0) {
          selectedIndex = nextIndex;
        }
        break;
      case "ArrowDown":
        nextIndex = selectedIndex + columns;
        if (nextIndex < allImages.length) {
          selectedIndex = nextIndex;
        }
        break;
      case "ArrowUp":
        nextIndex = selectedIndex - columns;
        if (nextIndex >= 0) {
          selectedIndex = nextIndex;
        }
        break;
    }

    if (selectedIndex !== undefined && selectedIndex < allImages.length && selectedIndex >= 0) {
      allImages[selectedIndex].classList.add("selected");
      const selectedImage = allImages[selectedIndex];
      // Ensure the selected image scrolls into view only if it's not fully visible
  
      if (
        selectedImage.getBoundingClientRect().top < 0 ||
        selectedImage.getBoundingClientRect().bottom > window.innerHeight
      ) {
        // Calculate the desired scroll position
        const desiredScrollPosition = selectedImage.offsetTop - (window.innerHeight - selectedImage.clientHeight) / 2;
        
        // Scroll to the desired position
        window.scrollTo({
          top: desiredScrollPosition,
          behavior: "smooth"
        });
      }
      
    }

    // Debugging information
  }
};



// Function to handle click on an image
const handleClick = (e) => {
  const clickedImage = e.target.closest(".image-container");
  if (clickedImage) {
    // Remove border from previously selected image
    const previouslySelectedImage = document.querySelector(".image-container.selected");
    if (previouslySelectedImage) {
      previouslySelectedImage.classList.remove("selected");
    }
    // Add border to the clicked image
    clickedImage.classList.add("selected");
    const allImages = Array.from(gallery.getElementsByClassName("image-container"));
    selectedIndex = allImages.indexOf(clickedImage);
    clickedImage.querySelector("img").focus();
  }
};


// Add click event listener to the gallery
gallery.addEventListener("click", handleClick);
window.addEventListener("scroll", handleScroll);
window.addEventListener("keydown", handleKeyDown);

fetchImages(currentPage);
