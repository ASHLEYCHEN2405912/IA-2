

document.addEventListener("DOMContentLoaded", () => {

    const loginLink = document.getElementById("loginLink");
    const logoutLink = document.getElementById("logoutLink");

    if (localStorage.getItem("loggedIn") === "true") {
        if (loginLink) loginLink.style.display = "none";
        if (logoutLink) logoutLink.style.display = "inline-block";
    } else {
        if (loginLink) loginLink.style.display = "inline-block";
        if (logoutLink) logoutLink.style.display = "none";
    }

    // LOGOUT 
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("loggedIn");
            alert("You have been logged out.");
            window.location.reload();
        });
    }
});

// LOGIN FORM
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        const users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            localStorage.setItem("loggedIn", "true");
            alert(`Welcome back, ${user.name}!`);
            window.location.href = "products.html";
        } else {
            alert("Invalid username or password. Please try again.");
        }
    });
}



// --------------------------
// REGISTRATION FORM  
// --------------------------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const dob = document.getElementById("dob").value;
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    // CHECKING IF USER ALREADY EXISTS
    if (users.some(u => u.username === username)) {
      alert("Username already exists. Try a different one.");
      return;
    }

    // SAVE (FOR NEW USER)
    users.push({ name, dob, email, username, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful! You can now log in.");
    window.location.href = "index.html";
  });
}

// ================================
// PRODUCT PAGE (ADD TO CART)
// ================================
const addToCartButtons = document.querySelectorAll(".add-to-cart");

// Only run if add-to-cart buttons exist (products page)
if (addToCartButtons.length > 0) {
  // Check if cart exists in localStorage, otherwise initialize
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Save cart to localStorage
  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Add item to cart
  function addToCart(productName, productPrice) {
    const existingProduct = cart.find(item => item.name === productName);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({
        name: productName,
        price: parseFloat(productPrice),
        quantity: 1
      });
    }
    saveCart();
    alert(`${productName} has been added to your cart!`);
  }

  // Attach click event
  addToCartButtons.forEach(button => {
    button.addEventListener("click", () => {
      const productName = button.getAttribute("data-name");
      const productPrice = button.getAttribute("data-price");
      addToCart(productName, productPrice);
    });
  });
}

// ================================
// CART PAGE FUNCTIONALITY
// ================================
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const clearCartBtn = document.getElementById("clear-cart");
const checkoutBtn = document.getElementById("checkout");

// Only run cart code if cart page elements exist
if (cartItems && cartTotal) {
  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function renderCart() {
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.name}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td><input type="number" min="1" value="${item.quantity}" data-index="${index}" class="qty-input"></td>
        <td>$${subtotal.toFixed(2)}</td>
        <td><button class="remove-btn" data-index="${index}">X</button></td>
      `;
      cartItems.appendChild(row);
    });

    cartTotal.textContent = total.toFixed(2);
    localStorage.setItem("cart", JSON.stringify(cart));

    // Quantity change
    document.querySelectorAll(".qty-input").forEach(input => {
      input.addEventListener("change", e => {
        const idx = e.target.getAttribute("data-index");
        cart[idx].quantity = parseInt(e.target.value);
        renderCart();
      });
    });

    // Remove buttons
    document.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const idx = e.target.getAttribute("data-index");
        cart.splice(idx, 1);
        renderCart();
      });
    });
  }

  // Clear Cart
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      cart = [];
      renderCart();
    });
  }

  // Checkout
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) {
        alert("Your cart is empty!");
      } else {
        alert("Thank you for your purchase! Total: $" + cartTotal.textContent);
        cart = [];
        renderCart();
      }
    });
  }

  renderCart();
}

const checkoutRedirectBtn = document.getElementById("checkoutBtn");
if (checkoutRedirectBtn) {
    checkoutRedirectBtn.addEventListener("click", function () {
        window.location.href = "checkout.html";
    });
}


// Load cart items from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const checkoutItems = document.getElementById("checkout-items");

// TOTAL FIELDS
const subtotalField = document.getElementById("subtotal");
const discountField = document.getElementById("discount");
const taxField = document.getElementById("tax");
const totalField = document.getElementById("total");

// DISPLAY CART
function displayCheckout() {
    checkoutItems.innerHTML = "";

    if (cart.length === 0) {
        checkoutItems.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    cart.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("checkout-item");

        div.innerHTML = `
            <img src="${item.image}" alt="">
            <div>
                <p><strong>${item.name}</strong></p>
                <p>Qty: ${item.quantity}</p>
                <p>Price: $${item.price}</p>
                <p>Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        `;

        checkoutItems.appendChild(div);
    });

    calculateTotals();
}

// CALCULATE TOTALS
function calculateTotals() {
    let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discount = subtotal * 0.10;
    let taxedAmount = (subtotal - discount) * 0.15;
    let finalTotal = subtotal - discount + taxedAmount;

    subtotalField.innerText = `$${subtotal.toFixed(2)}`;
    discountField.innerText = `-$${discount.toFixed(2)}`;
    taxField.innerText = `$${taxedAmount.toFixed(2)}`;
    totalField.innerText = `$${finalTotal.toFixed(2)}`;
}

// CLEAR CART
document.getElementById("clearCart").addEventListener("click", () => {
    localStorage.removeItem("cart");
    cart = [];
    displayCheckout();
});

// SUBMIT ORDER
document.getElementById("shippingForm").addEventListener("submit", (e) => {
    e.preventDefault();

    alert("Order confirmed! Thank you for shopping with us.");

    // Clear cart after confirmation
    localStorage.removeItem("cart");

    // Redirect back to products
    window.location.href = "products.html";
});

displayCheckout();

// CONTACT FORM HANDLING
const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("contactName").value.trim();
        const email = document.getElementById("contactEmail").value.trim();
        const message = document.getElementById("contactMessage").value.trim();

        if (!name || !email || !message) {
            alert("Please fill in all fields.");
            return;
        }

        // Show success message
        document.getElementById("contactSuccess").style.display = "block";

        // Clear fields
        contactForm.reset();
    });
}



