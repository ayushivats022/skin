(function () {
  var STORAGE_KEY = "ayushi-cart";

  function formatINR(amount) {
    return "₹" + amount.toLocaleString("en-IN");
  }

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  var cart = loadCart();

  function addToCart(id, name, price) {
    var existing = cart.find(function (item) { return item.id === id; });
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: id, name: name, price: price, qty: 1 });
    }
    saveCart(cart);
    render();
    openDrawer();
  }

  function changeQty(id, delta) {
    var item = cart.find(function (item) { return item.id === id; });
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(function (i) { return i.id !== id; });
    }
    saveCart(cart);
    render();
  }

  function removeItem(id) {
    cart = cart.filter(function (i) { return i.id !== id; });
    saveCart(cart);
    render();
  }

  function cartCount() {
    return cart.reduce(function (sum, i) { return sum + i.qty; }, 0);
  }

  function cartTotal() {
    return cart.reduce(function (sum, i) { return sum + i.qty * i.price; }, 0);
  }

  function render() {
    var badge = document.querySelector(".cart-badge");
    var count = cartCount();
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? "flex" : "none";
    }

    var itemsEl = document.querySelector(".cart-items");
    var emptyEl = document.querySelector(".cart-empty");
    var totalEl = document.querySelector(".cart-total-amount");
    var checkoutBtn = document.querySelector(".cart-checkout");
    if (!itemsEl) return;

    itemsEl.innerHTML = "";

    if (cart.length === 0) {
      if (emptyEl) emptyEl.style.display = "block";
      if (checkoutBtn) checkoutBtn.setAttribute("disabled", "disabled");
    } else {
      if (emptyEl) emptyEl.style.display = "none";
      if (checkoutBtn) checkoutBtn.removeAttribute("disabled");

      cart.forEach(function (item) {
        var row = document.createElement("div");
        row.className = "cart-row";
        row.innerHTML =
          '<div class="cart-row-info">' +
            '<p class="cart-row-name">' + item.name + "</p>" +
            '<p class="cart-row-price">' + formatINR(item.price) + "</p>" +
          "</div>" +
          '<div class="cart-row-controls">' +
            '<button type="button" class="qty-btn" data-action="dec" data-id="' + item.id + '">−</button>' +
            '<span class="qty-value">' + item.qty + "</span>" +
            '<button type="button" class="qty-btn" data-action="inc" data-id="' + item.id + '">+</button>' +
            '<button type="button" class="cart-remove" data-action="remove" data-id="' + item.id + '">Remove</button>' +
          "</div>";
        itemsEl.appendChild(row);
      });
    }

    if (totalEl) totalEl.textContent = formatINR(cartTotal());
  }

  function openDrawer() {
    document.querySelector(".cart-drawer").classList.add("open");
    document.querySelector(".cart-overlay").classList.add("open");
  }

  function closeDrawer() {
    document.querySelector(".cart-drawer").classList.remove("open");
    document.querySelector(".cart-overlay").classList.remove("open");
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();

    document.querySelectorAll(".add-to-cart").forEach(function (btn) {
      btn.addEventListener("click", function () {
        addToCart(btn.dataset.id, btn.dataset.name, parseFloat(btn.dataset.price));
      });
    });

    var cartToggle = document.querySelector(".cart-toggle");
    if (cartToggle) cartToggle.addEventListener("click", openDrawer);

    var closeBtn = document.querySelector(".cart-close");
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

    var overlay = document.querySelector(".cart-overlay");
    if (overlay) overlay.addEventListener("click", closeDrawer);

    var itemsEl = document.querySelector(".cart-items");
    if (itemsEl) {
      itemsEl.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn) return;
        var id = btn.dataset.id;
        var action = btn.dataset.action;
        if (action === "inc") changeQty(id, 1);
        if (action === "dec") changeQty(id, -1);
        if (action === "remove") removeItem(id);
      });
    }

    var checkoutBtn = document.querySelector(".cart-checkout");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", function () {
        if (cart.length === 0) return;
        var lines = cart.map(function (i) {
          return i.name + " x " + i.qty + " — " + formatINR(i.price * i.qty);
        });
        var body = "Hi Ayushi,%0D%0A%0D%0AI'd like to order:%0D%0A%0D%0A" +
          lines.join("%0D%0A") +
          "%0D%0A%0D%0ATotal: " + formatINR(cartTotal()) +
          "%0D%0A%0D%0AName:%0D%0AAddress:%0D%0APhone:";
        window.location.href = "mailto:ayushivats022@gmail.com?subject=Ayushi%20Order&body=" + body;
      });
    }
  });
})();
