
import {
  db,
  collection,
  doc,
  onSnapshot
} from "./firebase.js";

/* ELEMENTS */

const menuGrid = document.getElementById("menuGrid");
const menuCategories = document.getElementById("menuCategories");
const menuItemCount = document.getElementById("menuItemCount");

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const checkoutSection = document.getElementById("checkoutSection");
const confirmationSection = document.getElementById("confirmationSection");

const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutForm = document.getElementById("checkoutForm");

const whatsappButton = document.getElementById("whatsappButton");
const confirmationTotal = document.getElementById("confirmationTotal");

/* DATA */

let menuData = [];
let cart = [];
let selectedCategory = "All";
let businessWhatsApp = "";

/* HELPERS */

function formatPrice(price) {
  return "AED " + Number(price).toFixed(2);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function getImagePath(filename) {
  const safeName = String(filename || "");

  if (!/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(safeName)) {
    return "";
  }

  return "assets/pizzas/" + encodeURIComponent(safeName);
}

/* LOAD FIREBASE MENU */

onSnapshot(
  collection(db, "menu"),

  snapshot => {
    menuData = snapshot.docs.map(document => ({
      id: document.id,
      ...document.data()
    }));

    menuData = menuData.filter(item =>
      item.available !== false &&
      item.name &&
      Number.isFinite(Number(item.price)) &&
      Number(item.price) >= 0
    );

    renderCategories();
    renderMenu();
    renderCart();
  },

  error => {
    console.error("Menu loading error:", error);

    menuGrid.innerHTML = `
      <div class="empty-menu">
        <h3>Unable to load our menu</h3>
        <p>Please try again later.</p>
      </div>
    `;
  }
);

/* LOAD BUSINESS SETTINGS */

onSnapshot(
  doc(db, "settings", "general"),

  snapshot => {
    if (snapshot.exists()) {
      const settings = snapshot.data();

      businessWhatsApp = String(
        settings.whatsappNumber || ""
      ).replace(/\D/g, "");
    }
  },

  error => {
    console.error("Settings loading error:", error);
  }
);

/* CATEGORIES */

function renderCategories() {
  const categories = [
    "All",
    ...new Set(
      menuData
        .map(item => String(item.category || "Other").trim())
        .filter(Boolean)
    )
  ];

  if (!categories.includes(selectedCategory)) {
    selectedCategory = "All";
  }

  menuCategories.innerHTML = categories.map(category => `
    <button
      class="category-button ${selectedCategory === category ? "active" : ""}"
      data-category="${escapeHTML(category)}"
    >
      ${escapeHTML(category === "All" ? "All Items" : category)}
    </button>
  `).join("");
}

/* DISPLAY MENU */

function renderMenu() {
  const filteredItems = selectedCategory === "All"
    ? menuData
    : menuData.filter(item =>
        (item.category || "Other") === selectedCategory
      );

  menuItemCount.textContent = filteredItems.length;

  if (filteredItems.length === 0) {
    menuGrid.innerHTML = `
      <div class="empty-menu">
        <h3>No items available</h3>
        <p>Please check back later for delicious options.</p>
      </div>
    `;
    return;
  }

  menuGrid.innerHTML = filteredItems.map(item => {
    const imagePath = getImagePath(item.image);

    return `
      <article class="menu-card">

        <div class="menu-card-image">
          ${imagePath ? `
            <img
              src="${escapeHTML(imagePath)}"
              alt="${escapeHTML(item.name)}"
              loading="lazy"
              onerror="this.style.display='none'; this.parentElement.insertAdjacentHTML('beforeend','<div class=&quot;empty-menu-image&quot;>🍕</div>')"
            >
          ` : `
            <div class="empty-menu-image">🍕</div>
          `}
        </div>

        <div class="menu-card-content">

          <span class="menu-card-category">
            ${escapeHTML(item.category || "Other")}
          </span>

          <h3>${escapeHTML(item.name)}</h3>

          <p class="menu-card-description">
            ${escapeHTML(item.description || "")}
          </p>

          <div class="menu-card-bottom">

            <span class="menu-price">
              ${formatPrice(Number(item.price))}
            </span>

            <button
              class="add-cart-button"
              data-add-cart="${escapeHTML(item.id)}"
            >
              + Add to Cart
            </button>

          </div>
        </div>
      </article>
    `;
  }).join("");
}

/* CATEGORY BUTTONS */

menuCategories.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  selectedCategory = button.dataset.category;

  renderCategories();
  renderMenu();
});

/* ADD TO CART */

menuGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add-cart]");
  if (!button) return;

  const itemId = button.dataset.addCart;
  const item = menuData.find(product => product.id === itemId);

  if (!item) return;

  const existingItem = cart.find(product => product.id === itemId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      image: item.image || "",
      quantity: 1
    });
  }

  renderCart();

  button.textContent = "Added ✓";

  setTimeout(() => {
    button.textContent = "+ Add to Cart";
  }, 900);
});

/* RENDER CART */

function renderCart() {
  const totalQuantity = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  cartCount.textContent = totalQuantity;
  cartTotal.textContent = formatPrice(totalPrice);

  document.getElementById("checkoutButton").disabled =
    cart.length === 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <span>🛒</span>
        <h3>Your cart is empty</h3>
        <p>Discover something delicious from our menu.</p>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const imagePath = getImagePath(item.image);

    return `
      <div class="cart-item">

        ${imagePath ? `
          <img
            src="${escapeHTML(imagePath)}"
            alt="${escapeHTML(item.name)}"
            onerror="this.style.display='none'"
          >
        ` : `<div>🍕</div>`}

        <div class="cart-item-info">
          <h4>${escapeHTML(item.name)}</h4>
          <p>${formatPrice(item.price)}</p>

          <div class="quantity-controls">
            <button data-decrease="${escapeHTML(item.id)}">−</button>
            <span>${item.quantity}</span>
            <button data-increase="${escapeHTML(item.id)}">+</button>
          </div>
        </div>

        <button
          class="remove-item"
          data-remove="${escapeHTML(item.id)}"
          aria-label="Remove item"
        >×</button>

      </div>
    `;
  }).join("");
}

/* CART QUANTITY CONTROLS */

cartItems.addEventListener("click", event => {
  const increase = event.target.closest("[data-increase]");
  const decrease = event.target.closest("[data-decrease]");
  const remove = event.target.closest("[data-remove]");

  if (increase) {
    const item = cart.find(product =>
      product.id === increase.dataset.increase
    );

    if (item) item.quantity++;
  }

  if (decrease) {
    const item = cart.find(product =>
      product.id === decrease.dataset.decrease
    );

    if (item) {
      item.quantity--;

      if (item.quantity <= 0) {
        cart = cart.filter(product => product.id !== item.id);
      }
    }
  }

  if (remove) {
    cart = cart.filter(product =>
      product.id !== remove.dataset.remove
    );
  }

  renderCart();
});

/* OPEN AND CLOSE CART */

function openCart() {
  cartDrawer.classList.add("active");
  cartOverlay.classList.add("active");
  document.body.classList.add("cart-open");
}

function closeCart() {
  cartDrawer.classList.remove("active");
  cartOverlay.classList.remove("active");
  document.body.classList.remove("cart-open");
}

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

/* CHECKOUT SUMMARY */

function renderCheckoutSummary() {
  checkoutItems.innerHTML = cart.map(item => `
    <div class="summary-item">
      <span>${escapeHTML(item.name)} × ${item.quantity}</span>
      <span>${formatPrice(item.price * item.quantity)}</span>
    </div>
  `).join("");

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  checkoutTotal.textContent = formatPrice(total);
}

/* OPEN CHECKOUT */

document.getElementById("checkoutButton").addEventListener("click", () => {
  if (cart.length === 0) return;

  closeCart();
  renderCheckoutSummary();

  checkoutSection.classList.add("active");
  confirmationSection.classList.remove("active");

  checkoutSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

/* BACK TO MENU */

document.getElementById("backToMenu").addEventListener("click", () => {
  checkoutSection.classList.remove("active");

  document.getElementById("menu").scrollIntoView({
    behavior: "smooth"
  });
});

/* CONFIRM ORDER */

checkoutForm.addEventListener("submit", event => {
  event.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  if (!businessWhatsApp) {
    alert("The business WhatsApp number has not been configured yet. Please contact the manager.");
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const address = document.getElementById("customerAddress").value.trim();

  if (!name || !phone || !address) {
    alert("Please complete all delivery information.");
    return;
  }

  if (!/^[+\d\s()-]{7,20}$/.test(phone)) {
    alert("Please enter a valid phone number.");
    return;
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  let message = `*NEW ORDER - CEYLON CRUST PIZZA*\n\n`;

  message += `*Customer Details*\n`;
  message += `Name: ${name}\n`;
  message += `Phone: ${phone}\n`;
  message += `Address: ${address}\n\n`;

  message += `*ORDER DETAILS*\n`;

  cart.forEach(item => {
    message += `${item.name} x ${item.quantity}`;
    message += ` - ${formatPrice(item.price * item.quantity)}\n`;
  });

  message += `\n------------------------\n`;
  message += `*TOTAL: ${formatPrice(total)}*\n\n`;
  message += `Please confirm my order. Thank you!`;

  const whatsappURL =
    "https://wa.me/" +
    businessWhatsApp +
    "?text=" +
    encodeURIComponent(message);

  whatsappButton.href = whatsappURL;
  confirmationTotal.textContent = formatPrice(total);

  checkoutSection.classList.remove("active");
  confirmationSection.classList.add("active");

  confirmationSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

/* CONTINUE SHOPPING */

document.getElementById("continueShopping").addEventListener("click", () => {
  confirmationSection.classList.remove("active");
  checkoutSection.classList.remove("active");

  document.getElementById("menu").scrollIntoView({
    behavior: "smooth"
  });
});

/* MOBILE NAVIGATION */

const mobileMenuButton = document.getElementById("mobileMenuButton");
const mobileNavigation = document.getElementById("mobileNavigation");

mobileMenuButton.addEventListener("click", () => {
  mobileNavigation.classList.toggle("active");
});

mobileNavigation.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mobileNavigation.classList.remove("active");
  });
});

/* CURRENT YEAR */

document.getElementById("currentYear").textContent =
  new Date().getFullYear();

console.log("Ceylon Crust Pizza Ordering System Ready");
