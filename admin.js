
import {
  db,
  auth,
  collection,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "./firebase.js";

const MANAGER_EMAIL = "ceylonecrustpizza@gmail.com";

const $ = (id) => document.getElementById(id);

let editingId = null;

const loginPanel = $("loginPanel");
const dashboard = $("dashboard");

function showMessage(id, message) {
  $(id).textContent = message;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

// LOGIN
$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  showMessage("loginMessage", "Signing in...");

  try {
    await signInWithEmailAndPassword(
      auth,
      $("loginEmail").value.trim(),
      $("loginPassword").value
    );
  } catch (error) {
    showMessage("loginMessage", error.message);
  }
});

// AUTHENTICATION CHECK
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    loginPanel.classList.remove("hidden");
    dashboard.classList.add("hidden");
    return;
  }

  if (
    user.email !== MANAGER_EMAIL ||
    !user.emailVerified
  ) {
    await signOut(auth);
    showMessage(
      "loginMessage",
      "Please use the verified manager account."
    );
    return;
  }

  loginPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");

  loadMenu();
  loadWhatsapp();
});

// LOGOUT
$("logoutButton").addEventListener("click", async () => {
  await signOut(auth);
});

// LOAD MENU
function loadMenu() {
  onSnapshot(
    collection(db, "menu"),
    (snapshot) => {
      const items = [];

      snapshot.forEach((document) => {
        items.push({
          id: document.id,
          ...document.data()
        });
      });

      renderItems(items);
    },
    (error) => {
      showMessage("itemMessage", error.message);
    }
  );
}

// DISPLAY MENU ITEMS
function renderItems(items) {
  const container = $("itemsList");

  if (items.length === 0) {
    container.innerHTML = "<p>No menu items yet. Add your first item above.</p>";
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="item">
      <h3>${escapeHTML(item.name)}</h3>
      <p>${escapeHTML(item.description || "No description")}</p>
      <p><strong>AED ${Number(item.price || 0).toFixed(2)}</strong></p>
      <p>Category: ${escapeHTML(item.category || "Uncategorised")}</p>
      <p>Image: ${escapeHTML(item.image || "No image")}</p>
      <p>Status: ${item.available === false ? "Unavailable" : "Available"}</p>

      <button class="small" data-edit="${escapeHTML(item.id)}">
        Edit
      </button>

      <button class="small danger" data-delete="${escapeHTML(item.id)}">
        Delete
      </button>
    </div>
  `).join("");
}

// ADD OR UPDATE ITEM
$("itemForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = $("itemName").value.trim();
  const price = Number($("itemPrice").value);
  const category = $("itemCategory").value.trim();
  const description = $("itemDescription").value.trim();
  const image = $("itemImage").value.trim();
  const available = $("itemAvailable").checked;

  if (!name || !category || !Number.isFinite(price) || price < 0) {
    showMessage("itemMessage", "Please enter valid item details.");
    return;
  }

  if (image && !/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(image)) {
    showMessage("itemMessage", "Use a valid image filename ending in jpg, jpeg, png or webp.");
    return;
  }

  const itemData = {
    name,
    price,
    category,
    description,
    image,
    available,
    updatedAt: serverTimestamp()
  };

  $("saveItemButton").disabled = true;
  showMessage("itemMessage", "Saving item...");

  try {
    if (editingId) {
      await updateDoc(doc(db, "menu", editingId), itemData);
      showMessage("itemMessage", "Menu item updated!");
    } else {
      await addDoc(collection(db, "menu"), {
        ...itemData,
        createdAt: serverTimestamp()
      });
      showMessage("itemMessage", "New menu item added!");
    }

    resetForm();
  } catch (error) {
    showMessage("itemMessage", error.message);
  } finally {
    $("saveItemButton").disabled = false;
  }
});

// EDIT OR DELETE BUTTONS
$("itemsList").addEventListener("click", async (event) => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;

  if (editId) {
    try {
      const itemRef = doc(db, "menu", editId);
      const snapshot = await getDoc(itemRef);

      if (!snapshot.exists()) return;

      const item = snapshot.data();

      editingId = editId;

      $("itemName").value = item.name || "";
      $("itemPrice").value = item.price ?? "";
      $("itemCategory").value = item.category || "";
      $("itemDescription").value = item.description || "";
      $("itemImage").value = item.image || "";
      $("itemAvailable").checked = item.available !== false;

      $("formHeading").textContent = "Edit Menu Item";
      $("saveItemButton").textContent = "Update Menu Item";
      $("cancelEditButton").classList.remove("hidden");

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      showMessage("itemMessage", error.message);
    }
  }

  if (deleteId) {
    if (!confirm("Are you sure you want to delete this menu item?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "menu", deleteId));
      showMessage("itemMessage", "Menu item deleted.");
    } catch (error) {
      showMessage("itemMessage", error.message);
    }
  }
});

// RESET FORM
function resetForm() {
  editingId = null;
  $("itemForm").reset();
  $("itemAvailable").checked = true;
  $("formHeading").textContent = "Add New Menu Item";
  $("saveItemButton").textContent = "Add Menu Item";
  $("cancelEditButton").classList.add("hidden");
}

$("cancelEditButton").addEventListener("click", resetForm);

// LOAD WHATSAPP NUMBER
async function loadWhatsapp() {
  try {
    const snapshot = await getDoc(doc(db, "settings", "general"));

    if (snapshot.exists()) {
      $("whatsappNumber").value =
        snapshot.data().whatsappNumber || "";
    }
  } catch (error) {
    showMessage("whatsappMessage", error.message);
  }
}

// SAVE WHATSAPP NUMBER
$("saveWhatsapp").addEventListener("click", async () => {
  const number = $("whatsappNumber").value.replace(/\D/g, "");

  if (number.length < 8) {
    showMessage("whatsappMessage", "Please enter a valid number with country code.");
    return;
  }

  try {
    await setDoc(
      doc(db, "settings", "general"),
      { whatsappNumber: number },
      { merge: true }
    );

    showMessage("whatsappMessage", "WhatsApp number saved!");
  } catch (error) {
    showMessage("whatsappMessage", error.message);
  }
});
