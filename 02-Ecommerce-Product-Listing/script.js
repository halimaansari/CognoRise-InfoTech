
/* =========================================================
   NOVA MARKET — E-COMMERCE APPLICATION
   Author: Halima Sadia Ansari
   Technology: Vanilla JavaScript (ES6+)

   FEATURES:
   1. Product API integration
   2. Dynamic category dropdown
   3. Product card rendering
   4. Loading and error states
   5. Product search
   6. Category filtering
   7. Product sorting
   ========================================================= */


/* ---------------------------------------------------------
   01. CONFIGURATION
   Keep application settings in one place.
   --------------------------------------------------------- */

const CONFIG = {
  API_BASE_URL: "https://dummyjson.com",
  PRODUCTS_ENDPOINT: "/products?limit=100",
  CURRENCY: "USD"
};


/* ---------------------------------------------------------
   02. DOM ELEMENT REFERENCES
   Store HTML elements for easy access.
   --------------------------------------------------------- */

const DOM = {
  productGrid: document.getElementById("product-grid"),
  productCount: document.getElementById("product-count"),

  productSearch: document.getElementById("product-search"),
  categoryFilter: document.getElementById("category-filter"),
  sortFilter: document.getElementById("sort-filter"),

  resultsMessage: document.getElementById("results-message"),
  emptyState: document.getElementById("empty-state"),
  loadError: document.getElementById("load-error"),

  resetFilters: document.getElementById("reset-filters"),
  retryProducts: document.getElementById("retry-products"),

  cartCount: document.getElementById("cart-count"),
  cartToggle: document.getElementById("cart-toggle"),
  searchToggle: document.getElementById("search-toggle"),

  currentYear: document.getElementById("current-year"),
  toast: document.getElementById("toast")
};


/* ---------------------------------------------------------
   03. APPLICATION STATE
   Store original and filtered products separately.
   --------------------------------------------------------- */

const state = {
  products: [],
  filteredProducts: [],
  cart: [],
  searchTerm: "",
  selectedCategory: "all",
  sortOption: "featured",
  isLoading: false
};


/* ---------------------------------------------------------
   04. APPLICATION INITIALIZATION
   Start the application.
   --------------------------------------------------------- */

function initializeApp() {
    loadCart();
  // Automatically update the footer year.
  if (DOM.currentYear) {
    DOM.currentYear.textContent = new Date().getFullYear();
  }

  // Register all event listeners.
  setupEventListeners();

  // Fetch products from the API.
  loadProducts();
}


/* ---------------------------------------------------------
   05. API SERVICE
   Fetch product information from DummyJSON.
   --------------------------------------------------------- */

async function fetchProducts() {
  const apiUrl =
    `${CONFIG.API_BASE_URL}${CONFIG.PRODUCTS_ENDPOINT}`;

  const response = await fetch(apiUrl);

  // Check whether the API request was successful.
  if (!response.ok) {
    throw new Error(
      `Product request failed: HTTP ${response.status}`
    );
  }

  const data = await response.json();

  // Validate the API response.
  if (!data || !Array.isArray(data.products)) {
    throw new Error("Invalid product data received.");
  }

  return data.products;
}


/* ---------------------------------------------------------
   06. LOADING STATE
   Display a loading message while fetching products.
   --------------------------------------------------------- */

function showLoadingState() {
  state.isLoading = true;

  DOM.productGrid.innerHTML = "";

  DOM.emptyState.hidden = true;
  DOM.loadError.hidden = true;

  DOM.productCount.textContent = "Loading...";

  DOM.resultsMessage.textContent =
    "Please wait while we load the collection.";
}


/* ---------------------------------------------------------
   07. ERROR STATE
   Display an error message if something goes wrong.
   --------------------------------------------------------- */

function showErrorState(error) {
  console.error("Product loading error:", error);

  DOM.productGrid.innerHTML = "";

  DOM.emptyState.hidden = true;
  DOM.loadError.hidden = false;

  DOM.productCount.textContent = "Products unavailable";

  DOM.resultsMessage.textContent =
    "We couldn't retrieve the product collection.";
}


/* ---------------------------------------------------------
   08. LOAD PRODUCTS
   Connect API data with application state and rendering.
   --------------------------------------------------------- */

async function loadProducts() {
  showLoadingState();

  try {
    const products = await fetchProducts();

    // Save the original product collection.
    state.products = products;

    // Generate category dropdown options.
    populateCategories(products);

    // Display products with current filters.
    applyProductFilters();

  } catch (error) {
    showErrorState(error);

  } finally {
    state.isLoading = false;
  }
}


/* ---------------------------------------------------------
   09. POPULATE CATEGORY DROPDOWN
   Create unique category options from API data.
   --------------------------------------------------------- */

function populateCategories(products) {
  const categories = [
    ...new Set(products.map((product) => product.category))
  ];

  // Arrange categories alphabetically.
  categories.sort((a, b) => a.localeCompare(b));

  // Add the default option.
  DOM.categoryFilter.innerHTML =
    '<option value="all">All categories</option>';

  // Create an option for every category.
  categories.forEach((category) => {
    const option = document.createElement("option");

    option.value = category;
    option.textContent = formatCategory(category);

    DOM.categoryFilter.appendChild(option);
  });
}


/* ---------------------------------------------------------
   10. FORMAT CATEGORY LABELS
   Convert category names into readable text.
   --------------------------------------------------------- */

function formatCategory(category) {
  return category
    .split("-")
    .map((word) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}


/* ---------------------------------------------------------
   11. PRODUCT CARD RENDERING
   Create product cards dynamically using JavaScript.
   --------------------------------------------------------- */

function renderProducts(products) {
  // Clear previously displayed cards.
  DOM.productGrid.innerHTML = "";

  products.forEach((product) => {

    // Main product card.
    const card = document.createElement("article");
    card.className = "product-card";

    // Product image wrapper.
    const imageWrapper = document.createElement("div");
    imageWrapper.className = "product-image-wrapper";

    // Product image.
    const image = document.createElement("img");

    image.className = "product-image";
    image.src = product.thumbnail;
    image.alt = product.title;
    image.loading = "lazy";

    // Handle unavailable product images.
    image.onerror = () => {
      image.removeAttribute("src");
      imageWrapper.textContent = "Image unavailable";
    };

    imageWrapper.appendChild(image);


    // Product details container.
    const details = document.createElement("div");
    details.className = "product-details";


    // Product category.
    const category = document.createElement("p");

    category.className = "product-category";
    category.textContent = formatCategory(product.category);


    // Product name.
    const name = document.createElement("h3");

    name.className = "product-name";
    name.textContent = product.title;


    // Product rating.
    const rating = document.createElement("p");

    rating.className = "product-rating";
    rating.textContent = `★ ${product.rating} / 5`;


    // Product price.
    const price = document.createElement("p");

    price.className = "product-price";

    price.textContent = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: CONFIG.CURRENCY
    }).format(product.price);


    // Add to Bag button.
    // Actual cart functionality will be implemented later.
    const addButton = document.createElement("button");

    addButton.className = "add-to-cart";
    addButton.type = "button";
    addButton.textContent = "Add to Bag";
    addButton.disabled = false;
addButton.title = "Add this product to your bag";

// Add product to cart when clicked.
addButton.addEventListener("click", () => {
  addToCart(product.id);

  addButton.textContent = "Added ✓";

  setTimeout(() => {
    addButton.textContent = "Add to Bag";
  }, 1000);
});


    // Add all product details to the card.
    details.append(
      category,
      name,
      rating,
      price,
      addButton
    );

    card.append(imageWrapper, details);

    // Display the completed card.
    DOM.productGrid.appendChild(card);
  });
}

/* ---------------------------------------------------------
   SHOPPING CART — BASIC FUNCTIONS
   --------------------------------------------------------- */

// Add a product to the shopping cart.
function addToCart(productId) {
  const existingItem = state.cart.find(
    (item) => item.id === productId
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const product = state.products.find(
      (item) => item.id === productId
    );

    if (!product) return;

    state.cart.push({
      ...product,
      quantity: 1
    });
  }

  updateCartCount();
saveCart();
  console.log("Updated cart:", state.cart);
}


// Update the cart item count in the header.
function updateCartCount() {
  const totalItems = state.cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (DOM.cartCount) {
    DOM.cartCount.textContent = totalItems;
  }
}


/* ---------------------------------------------------------
   SAVE CART TO LOCAL STORAGE
   --------------------------------------------------------- */

function saveCart() {
  localStorage.setItem(
    "novaMarketCart",
    JSON.stringify(state.cart)
  );
}


/* ---------------------------------------------------------
   LOAD CART FROM LOCAL STORAGE
   --------------------------------------------------------- */

function loadCart() {
  const savedCart = localStorage.getItem("novaMarketCart");

  if (savedCart) {
    try {
      const parsedCart = JSON.parse(savedCart);

      if (Array.isArray(parsedCart)) {
        state.cart = parsedCart.filter((item) =>
          item &&
          Number.isFinite(item.id) &&
          Number.isFinite(item.quantity) &&
          item.quantity > 0
        );
      }
    } catch (error) {
      console.error("Unable to load saved cart:", error);

      state.cart = [];
    }
  }

  updateCartCount();
}

/* ---------------------------------------------------------
   12. SEARCH, FILTER AND SORT
   Apply user selections to the product collection.
   --------------------------------------------------------- */

function applyProductFilters() {
  // Start with a copy of all original products.
  let products = [...state.products];


  // SEARCH BY PRODUCT NAME
  if (state.searchTerm) {
    products = products.filter((product) =>
      product.title
        .toLowerCase()
        .includes(state.searchTerm)
    );
  }


  // FILTER BY CATEGORY
  if (state.selectedCategory !== "all") {
    products = products.filter((product) =>
      product.category === state.selectedCategory
    );
  }


  // SORT PRODUCTS
  switch (state.sortOption) {

    case "price-low":
      products.sort((a, b) => a.price - b.price);
      break;

    case "price-high":
      products.sort((a, b) => b.price - a.price);
      break;

    case "rating":
      products.sort((a, b) => b.rating - a.rating);
      break;

    case "name":
      products.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
      break;

    default:
      // Keep the original API order.
      break;
  }


  // Save the filtered collection.
  state.filteredProducts = products;


  // Update the product count.
  DOM.productCount.textContent =
    `${products.length} Products`;


  // Update the results message.
  DOM.resultsMessage.textContent =
    `Showing ${products.length} of ${state.products.length} products.`;


  // Show empty state if no products match.
  DOM.emptyState.hidden = products.length !== 0;


  // Render the final product collection.
  renderProducts(products);
}


/* ---------------------------------------------------------
   13. EVENT LISTENERS
   Connect HTML controls with JavaScript functionality.
   --------------------------------------------------------- */

function setupEventListeners() {

  // Live product search.
  DOM.productSearch.addEventListener("input", (event) => {

    state.searchTerm = event.target.value
      .trim()
      .toLowerCase();

    applyProductFilters();
  });


  // Category dropdown.
  DOM.categoryFilter.addEventListener("change", (event) => {

    state.selectedCategory = event.target.value;

    applyProductFilters();
  });


  // Product sorting.
  DOM.sortFilter.addEventListener("change", (event) => {

    state.sortOption = event.target.value;

    applyProductFilters();
  });


  // Reset all search and filter settings.
  DOM.resetFilters.addEventListener("click", () => {

    state.searchTerm = "";
    state.selectedCategory = "all";
    state.sortOption = "featured";

    DOM.productSearch.value = "";
    DOM.categoryFilter.value = "all";
    DOM.sortFilter.value = "featured";

    applyProductFilters();
  });


  // Retry product loading after an error.
  DOM.retryProducts.addEventListener("click", () => {
    loadProducts();
  });
}


/* ---------------------------------------------------------
   14. APPLICATION START
   This function must be called only once.
   --------------------------------------------------------- */

initializeApp();
