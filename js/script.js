// ==========================================
// PRODUCT INFORMATION
// ==========================================

let products = [

    {
        id: "bee-keychain",
        name: "Bee Keychain",
        price: 329,
        description: "Cute handmade crochet bee keychain with little wings.",
        image: "images/products/bee.jpg",
        images: ["images/products/bee.jpg"],
        badge: "Best Seller",
        rating: "4.9",
        inStock: true
    },

    {
        id: "star-trinket-dish",
        name: "Star Trinket Dish",
        price: 399,
        description: "Handmade crochet star dish, perfect for keeping small treasures.",
        image: "images/products/star-dish.jpg",
        images: ["images/products/star-dish.jpg"],
        badge: "New",
        rating: "4.8",
        inStock: true
    },

    {
        id: "spiderman-keychain",
        name: "Spiderman Keychain",
        price: 219,
        description: "Cute handmade crochet Spiderman keychain, perfect for gifting.",
        image: "images/products/spiderman.jpg",
        images: ["images/products/spiderman.jpg"],
        badge: "New",
        rating: "4.8",
        inStock: true
    },

    {
        id: "cherry-keychain",
        name: "Cherry Keychain",
        price: 89,
        description: "Sweet handmade crochet cherry keychain for everyday.",
        image: "images/products/cherry.jpg",
        images: ["images/products/cherry.jpg"],
        badge: "",
        rating: "4.9",
        inStock: true
    },

    {
        id: "baby-romper",
        name: "Baby Romper",
        price: 799,
        description: "Soft handmade crochet baby romper, perfect for little ones.",
        image: "images/products/baby.jpg",
        images: ["images/products/baby.jpg"],
        badge: "New",
        rating: "4.9",
        inStock: true
    },

    {
        id: "evileye-keychain",
        name: "Evil Eye Keychain",
        price: 99,
        description: "Handmade crochet evil eye keychain, a cute everyday accessory.",
        image: "images/products/evileye.jpg",
        images: ["images/products/evileye.jpg", "images/products/evil-eye-keychain.jpeg"],
        badge: "",
        rating: "4.8",
        inStock: true
    }

];

// ==========================================
// STORE STATE & TOAST SYSTEM
// ==========================================
let savedProducts = JSON.parse(localStorage.getItem("wishlist")) || [];
let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
let selectedCategory = "all";
let storefrontSearchQuery = "";

// Helper: look up a product by ID (or by legacy numeric index)
function getProduct(idOrIndex) {
    return products.find(p => p.id === idOrIndex) || products[idOrIndex];
}

// Floating Toast Notification
function showToast(message, icon = "✨") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.innerHTML = `<span style="font-size: 16px;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = "all 0.3s ease";
        toast.style.opacity = "0";
        toast.style.transform = "translateY(15px)";
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 2400);
}

// Storefront Category Filter & Search Handlers
function filterCategory(cat) {
    selectedCategory = cat;
    document.querySelectorAll(".category-tab").forEach(tab => {
        tab.classList.toggle("active", tab.dataset.category === cat);
    });
    renderStorefrontProducts();
}

function handleStoreSearch(event) {
    storefrontSearchQuery = (event.target.value || "").trim().toLowerCase();
    renderStorefrontProducts();
}

function clearStoreFilters() {
    selectedCategory = "all";
    storefrontSearchQuery = "";
    const searchInput = document.getElementById("store-search-input");
    if (searchInput) searchInput.value = "";
    document.querySelectorAll(".category-tab").forEach(tab => {
        tab.classList.toggle("active", tab.dataset.category === "all");
    });
    renderStorefrontProducts();
}

// Render dynamic products on storefront with category & search filtering
function renderStorefrontProducts() {
    const grid = document.querySelector(".product-grid");
    if (!grid) return;

    const filtered = products.filter(product => {
        // Category filtering
        if (selectedCategory !== "all") {
            const id = (product.id || "").toLowerCase();
            const name = (product.name || "").toLowerCase();
            const desc = (product.description || "").toLowerCase();

            if (selectedCategory === "keychain") {
                if (!id.includes("keychain") && !name.includes("keychain") && !desc.includes("keychain")) return false;
            } else if (selectedCategory === "dish") {
                if (!id.includes("dish") && !id.includes("trinket") && !name.includes("dish") && !name.includes("trinket") && !desc.includes("dish")) return false;
            } else if (selectedCategory === "baby") {
                if (!id.includes("baby") && !id.includes("romper") && !name.includes("baby") && !name.includes("romper") && !desc.includes("baby") && !desc.includes("romper")) return false;
            }
        }

        // Live search filtering
        if (storefrontSearchQuery) {
            const name = (product.name || "").toLowerCase();
            const desc = (product.description || "").toLowerCase();
            const price = String(product.price || "");
            if (!name.includes(storefrontSearchQuery) && !desc.includes(storefrontSearchQuery) && !price.includes(storefrontSearchQuery)) {
                return false;
            }
        }

        return true;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-box" style="grid-column: 1 / -1; margin: 30px auto; max-width: 500px; width: 100%;">
                <span class="empty-icon">🔍</span>
                <h3>No Creations Found</h3>
                <p>We couldn't find any crochet creations matching your search. Try another query or explore all items!</p>
                <button type="button" class="empty-action-btn" onclick="clearStoreFilters()">✨ Show All Creations</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(product => {
        const isOutOfStock = product.inStock === false;
        const isSaved = savedProducts.includes(product.id);

        let badgeHtml = "";
        if (isOutOfStock) {
            badgeHtml = `<span class="badge" style="background:#C0392B; color:white;">Sold Out</span>`;
        } else if (product.badge) {
            const badgeClass = product.badge.toLowerCase().includes("best") ? "best-seller" : "new";
            badgeHtml = `<span class="badge ${badgeClass}">${product.badge}</span>`;
        }

        return `
            <div class="product-card" data-id="${product.id}" style="${isOutOfStock ? 'opacity: 0.85;' : ''}">
                ${badgeHtml}
                <img src="${product.image}" alt="${product.name}" onclick="openQuickView('${product.id}')" title="Click to view details">
                <h3 onclick="openQuickView('${product.id}')" title="Click to view details">${product.name}</h3>
                <p class="product-description">${product.description || ""}</p>
                <div class="product-rating">★★★★★ <span>${product.rating || "4.9"}</span></div>
                <p class="price">₹${product.price}</p>
                ${
                    isOutOfStock
                        ? `<button class="cart-btn" disabled style="background:#95A5A6; cursor:not-allowed;">🚫 Sold Out</button>`
                        : `<button class="cart-btn">🛒 Add to Cart</button>`
                }
                <button class="wishlist-btn ${isSaved ? 'saved' : ''}">
                    ${isSaved ? '❤️ Saved' : '🤍 Wishlist'}
                </button>
                <button type="button" class="quickview-btn" onclick="openQuickView('${product.id}')">
                    👁️ Quick View
                </button>
            </div>
        `;
    }).join("");

    initWishlistButtons();
    initCartButtons();
    initScrollReveal();
    initAuthNav();
}

// ==========================================
// PRODUCT QUICK-VIEW MODAL & INTERACTIVE ZOOM / CAROUSEL
// ==========================================
let currentQuickViewProduct = null;
let currentQuickViewQty = 1;
let currentGalleryImages = [];
let currentGalleryIndex = 0;
let isZoomMagnified = false;

function openQuickView(productId) {
    const product = getProduct(productId);
    if (!product) return;

    currentQuickViewProduct = product;
    currentQuickViewQty = 1;
    currentGalleryIndex = 0;
    isZoomMagnified = false;

    // Build gallery images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        currentGalleryImages = product.images;
    } else if (product.image) {
        currentGalleryImages = [product.image];
    } else {
        currentGalleryImages = ["images/hero/hero.jpg"];
    }

    const modal = document.getElementById("quickview-modal");
    if (!modal) return;

    updateQuickViewImage();
    renderQuickViewGalleryControls();

    // Badge
    const badgeEl = document.getElementById("qv-badge");
    if (badgeEl) {
        if (product.badge) {
            const badgeClass = product.badge.toLowerCase().includes("best") ? "best-seller" : "new";
            badgeEl.className = `badge ${badgeClass}`;
            badgeEl.textContent = product.badge;
            badgeEl.style.display = "inline-block";
        } else {
            badgeEl.style.display = "none";
        }
    }

    // Stock Status
    const isOutOfStock = product.inStock === false;
    const stockBadge = document.getElementById("qv-stock-badge");
    const actionsWrapper = document.getElementById("qv-actions-wrapper");
    const soldoutBox = document.getElementById("qv-soldout-box");

    if (stockBadge) {
        if (isOutOfStock) {
            stockBadge.className = "qv-stock-pill out-of-stock";
            stockBadge.textContent = "🔴 Sold Out / Made to Order";
        } else {
            stockBadge.className = "qv-stock-pill";
            stockBadge.textContent = "🟢 In Stock & Ready to Craft";
        }
    }

    // Name, Rating, Price, Description
    const nameEl = document.getElementById("qv-name");
    if (nameEl) nameEl.textContent = product.name;

    const ratingEl = document.getElementById("qv-rating");
    if (ratingEl) ratingEl.textContent = product.rating || "4.9";

    const priceEl = document.getElementById("qv-price");
    if (priceEl) priceEl.textContent = "₹" + product.price;

    const descEl = document.getElementById("qv-description");
    if (descEl) descEl.textContent = product.description || "Handcrafted with passion and premium yarn.";

    // Quantity Value
    const qtyVal = document.getElementById("qv-qty-value");
    if (qtyVal) qtyVal.textContent = "1";

    // Wishlist Button State
    const wishBtn = document.getElementById("qv-wishlist-btn");
    if (wishBtn) {
        const isSaved = savedProducts.includes(product.id);
        wishBtn.textContent = isSaved ? "❤️" : "🤍";
        wishBtn.classList.toggle("saved", isSaved);
    }

    // Controls display according to stock
    if (actionsWrapper) {
        actionsWrapper.style.display = isOutOfStock ? "none" : "flex";
    }
    if (soldoutBox) {
        soldoutBox.style.display = isOutOfStock ? "block" : "none";
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function updateQuickViewImage() {
    const imgEl = document.getElementById("qv-image");
    const zoomContainer = document.getElementById("qv-zoom-container");
    if (!imgEl) return;

    const src = currentGalleryImages[currentGalleryIndex] || (currentQuickViewProduct ? currentQuickViewProduct.image : "");
    imgEl.src = src;
    imgEl.alt = currentQuickViewProduct ? currentQuickViewProduct.name : "Crochet Product";

    // Reset zoom transformation
    imgEl.style.transformOrigin = "center center";
    imgEl.style.transform = "scale(1)";
    if (zoomContainer) {
        zoomContainer.classList.remove("zoomed");
    }

    // Update active state in dots & thumbnails
    const dots = document.querySelectorAll("#qv-carousel-dots .carousel-dot");
    dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === currentGalleryIndex);
    });

    const thumbs = document.querySelectorAll("#qv-thumbnails-strip .qv-thumb-item");
    thumbs.forEach((thumb, idx) => {
        thumb.classList.toggle("active", idx === currentGalleryIndex);
    });
}

function renderQuickViewGalleryControls() {
    const prevBtn = document.getElementById("qv-prev-img");
    const nextBtn = document.getElementById("qv-next-img");
    const dotsContainer = document.getElementById("qv-carousel-dots");
    const thumbsStrip = document.getElementById("qv-thumbnails-strip");

    const hasMultiple = currentGalleryImages.length > 1;

    if (prevBtn) prevBtn.style.display = hasMultiple ? "flex" : "none";
    if (nextBtn) nextBtn.style.display = hasMultiple ? "flex" : "none";

    if (dotsContainer) {
        if (!hasMultiple) {
            dotsContainer.innerHTML = "";
            dotsContainer.style.display = "none";
        } else {
            dotsContainer.style.display = "flex";
            dotsContainer.innerHTML = currentGalleryImages.map((_, i) => `
                <button type="button" class="carousel-dot ${i === currentGalleryIndex ? 'active' : ''}" data-index="${i}" aria-label="Go to image ${i + 1}"></button>
            `).join("");

            dotsContainer.querySelectorAll(".carousel-dot").forEach(dot => {
                dot.onclick = (e) => {
                    e.stopPropagation();
                    currentGalleryIndex = Number(dot.dataset.index);
                    updateQuickViewImage();
                };
            });
        }
    }

    if (thumbsStrip) {
        if (!hasMultiple) {
            thumbsStrip.innerHTML = "";
            thumbsStrip.style.display = "none";
        } else {
            thumbsStrip.style.display = "flex";
            thumbsStrip.innerHTML = currentGalleryImages.map((imgSrc, i) => `
                <button type="button" class="qv-thumb-item ${i === currentGalleryIndex ? 'active' : ''}" data-index="${i}" aria-label="View photo angle ${i + 1}">
                    <img src="${imgSrc}" alt="Angle ${i + 1}">
                </button>
            `).join("");

            thumbsStrip.querySelectorAll(".qv-thumb-item").forEach(thumb => {
                thumb.onclick = (e) => {
                    e.stopPropagation();
                    currentGalleryIndex = Number(thumb.dataset.index);
                    updateQuickViewImage();
                };
            });
        }
    }
}

function closeQuickView() {
    const modal = document.getElementById("quickview-modal");
    if (modal) modal.classList.remove("active");
    currentQuickViewProduct = null;
    currentQuickViewQty = 1;
    document.body.style.overflow = "";
}

function initQuickViewModal() {
    const modal = document.getElementById("quickview-modal");
    if (!modal) return;

    // Close button
    const closeBtn = document.getElementById("close-quickview-btn");
    if (closeBtn) {
        closeBtn.onclick = closeQuickView;
    }

    // Click backdrop to close
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeQuickView();
        }
    };

    // Escape key
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            closeQuickView();
        }
    });

    // Quantity Minus
    const minusBtn = document.getElementById("qv-qty-minus");
    if (minusBtn) {
        minusBtn.onclick = function() {
            if (currentQuickViewQty > 1) {
                currentQuickViewQty--;
                const qtyVal = document.getElementById("qv-qty-value");
                if (qtyVal) qtyVal.textContent = currentQuickViewQty;
            }
        };
    }

    // Quantity Plus
    const plusBtn = document.getElementById("qv-qty-plus");
    if (plusBtn) {
        plusBtn.onclick = function() {
            if (currentQuickViewQty < 10) {
                currentQuickViewQty++;
                const qtyVal = document.getElementById("qv-qty-value");
                if (qtyVal) qtyVal.textContent = currentQuickViewQty;
            }
        };
    }

    // Add to Cart from Quick View
    const addCartBtn = document.getElementById("qv-add-cart-btn");
    if (addCartBtn) {
        addCartBtn.onclick = function() {
            if (!currentQuickViewProduct) return;

            for (let i = 0; i < currentQuickViewQty; i++) {
                cartItems.push(currentQuickViewProduct.id);
            }
            localStorage.setItem("cart", JSON.stringify(cartItems));
            updateCartCount();
            displayCart();
            showToast(`Added ${currentQuickViewQty} × "${currentQuickViewProduct.name}" to cart!`, "🛒");

            addCartBtn.textContent = `✅ Added ${currentQuickViewQty} to Cart!`;
            setTimeout(function() {
                addCartBtn.textContent = "🛒 Add to Cart";
            }, 1800);
        };
    }

    // Wishlist from Quick View
    const wishBtn = document.getElementById("qv-wishlist-btn");
    if (wishBtn) {
        wishBtn.onclick = function() {
            if (!currentQuickViewProduct) return;
            const pid = currentQuickViewProduct.id;

            wishBtn.classList.remove("heart-pop");
            void wishBtn.offsetWidth;
            wishBtn.classList.add("heart-pop");

            if (savedProducts.includes(pid)) {
                savedProducts = savedProducts.filter(item => item !== pid);
                wishBtn.textContent = "🤍";
                wishBtn.classList.remove("saved");
                showToast(`Removed "${currentQuickViewProduct.name}" from wishlist`, "🤍");
            } else {
                savedProducts.push(pid);
                wishBtn.textContent = "❤️";
                wishBtn.classList.add("saved");
                showToast(`Saved "${currentQuickViewProduct.name}" to wishlist!`, "❤️");
            }

            localStorage.setItem("wishlist", JSON.stringify(savedProducts));
            updateWishlistCount();
            displayWishlist();
            initWishlistButtons(); // sync cards on storefront
        };
    }

    // Sold Out Custom Order bridge
    const customReqBtn = document.getElementById("qv-custom-request-btn");
    if (customReqBtn) {
        customReqBtn.onclick = function() {
            const productName = currentQuickViewProduct ? currentQuickViewProduct.name : "";
            closeQuickView();

            const customModal = document.getElementById("custom-modal");
            const customIdea = document.getElementById("custom-idea");
            if (customModal) {
                if (customIdea && productName) {
                    customIdea.value = `I would love a custom order for "${productName}".`;
                }
                customModal.classList.add("active");
            }
        };
    }

    // Initialize Interactive Zoom & Lightbox
    initQuickViewZoom();
    initLightboxModal();
}

// ==========================================
// INTERACTIVE ZOOM & CAROUSEL NAVIGATION
// ==========================================
function initQuickViewZoom() {
    const container = document.getElementById("qv-zoom-container");
    const img = document.getElementById("qv-image");
    if (!container || !img) return;

    // Desktop hover pan zoom
    container.addEventListener("mousemove", (e) => {
        // Only run on pointer fine devices (desktop/mouse)
        if (window.matchMedia("(pointer: fine)").matches) {
            const rect = container.getBoundingClientRect();
            const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
            const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
            img.style.transformOrigin = `${x}% ${y}%`;
            img.style.transform = "scale(2.2)";
            container.classList.add("zoomed");
        }
    });

    container.addEventListener("mouseleave", () => {
        img.style.transformOrigin = "center center";
        img.style.transform = "scale(1)";
        container.classList.remove("zoomed");
    });

    // Touch tap-to-zoom on mobile devices
    container.addEventListener("click", (e) => {
        // Prevent toggle if clicking on navigation arrows or lightbox btn
        if (e.target.closest(".carousel-nav-btn") || e.target.closest(".qv-zoom-toggle-btn")) {
            return;
        }

        if (window.innerWidth <= 820) {
            isZoomMagnified = !isZoomMagnified;
            if (isZoomMagnified) {
                const rect = container.getBoundingClientRect();
                const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                img.style.transformOrigin = `${x}% ${y}%`;
                img.style.transform = "scale(2)";
                container.classList.add("zoomed");
            } else {
                img.style.transformOrigin = "center center";
                img.style.transform = "scale(1)";
                container.classList.remove("zoomed");
            }
        }
    });

    // Carousel Navigation Arrows
    const prevBtn = document.getElementById("qv-prev-img");
    const nextBtn = document.getElementById("qv-next-img");

    if (prevBtn) {
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            if (currentGalleryImages.length <= 1) return;
            currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
            updateQuickViewImage();
        };
    }

    if (nextBtn) {
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            if (currentGalleryImages.length <= 1) return;
            currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
            updateQuickViewImage();
        };
    }

    // Lightbox open button
    const lightboxBtn = document.getElementById("qv-zoom-toggle-btn");
    if (lightboxBtn) {
        lightboxBtn.onclick = (e) => {
            e.stopPropagation();
            openLightbox(currentGalleryIndex);
        };
    }
}

// ==========================================
// LIGHTBOX FULLSCREEN MODAL
// ==========================================
let currentLightboxIndex = 0;

function openLightbox(index = 0) {
    const lightbox = document.getElementById("lightbox-modal");
    const lightboxImg = document.getElementById("lightbox-image");
    if (!lightbox || !lightboxImg) return;

    currentLightboxIndex = index;
    updateLightboxImage();
    lightbox.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function updateLightboxImage() {
    const lightboxImg = document.getElementById("lightbox-image");
    const captionEl = document.getElementById("lightbox-caption");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");

    if (!lightboxImg || currentGalleryImages.length === 0) return;

    lightboxImg.src = currentGalleryImages[currentLightboxIndex];
    if (captionEl && currentQuickViewProduct) {
        const countText = currentGalleryImages.length > 1 ? ` (${currentLightboxIndex + 1}/${currentGalleryImages.length})` : "";
        captionEl.textContent = `${currentQuickViewProduct.name}${countText} - Handcrafted Crochet Texture`;
    }

    const hasMultiple = currentGalleryImages.length > 1;
    if (prevBtn) prevBtn.style.display = hasMultiple ? "flex" : "none";
    if (nextBtn) nextBtn.style.display = hasMultiple ? "flex" : "none";
}

function closeLightbox() {
    const lightbox = document.getElementById("lightbox-modal");
    if (lightbox) {
        lightbox.style.display = "none";
        const qvModal = document.getElementById("quickview-modal");
        if (!qvModal || !qvModal.classList.contains("active")) {
            document.body.style.overflow = "";
        }
    }
}

function initLightboxModal() {
    const lightbox = document.getElementById("lightbox-modal");
    if (!lightbox) return;

    const closeBtn = document.getElementById("close-lightbox-btn");
    if (closeBtn) closeBtn.onclick = closeLightbox;

    const prevBtn = document.getElementById("lightbox-prev");
    if (prevBtn) {
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            if (currentGalleryImages.length <= 1) return;
            currentLightboxIndex = (currentLightboxIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
            updateLightboxImage();
        };
    }

    const nextBtn = document.getElementById("lightbox-next");
    if (nextBtn) {
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            if (currentGalleryImages.length <= 1) return;
            currentLightboxIndex = (currentLightboxIndex + 1) % currentGalleryImages.length;
            updateLightboxImage();
        };
    }

    lightbox.onclick = (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    };

    document.addEventListener("keydown", (e) => {
        if (lightbox.style.display === "flex") {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft" && currentGalleryImages.length > 1) {
                currentLightboxIndex = (currentLightboxIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
                updateLightboxImage();
            }
            if (e.key === "ArrowRight" && currentGalleryImages.length > 1) {
                currentLightboxIndex = (currentLightboxIndex + 1) % currentGalleryImages.length;
                updateLightboxImage();
            }
        }
    });
}

// ==========================================
// WISHLIST FUNCTIONALITY
// ==========================================
function updateWishlistCount() {
    const wishlistCount = document.getElementById("wishlist-count");
    if (wishlistCount) {
        wishlistCount.textContent = savedProducts.length;
        wishlistCount.classList.remove("badge-bounce");
        void wishlistCount.offsetWidth;
        wishlistCount.classList.add("badge-bounce");
    }
    const mobileWishlistCount = document.getElementById("mobile-wishlist-count");
    if (mobileWishlistCount) {
        mobileWishlistCount.textContent = savedProducts.length;
    }
    const bottomWishlistBadge = document.getElementById("bottom-wishlist-badge");
    if (bottomWishlistBadge) {
        const count = savedProducts.length;
        bottomWishlistBadge.textContent = count;
        bottomWishlistBadge.style.display = count > 0 ? "inline-flex" : "none";
        bottomWishlistBadge.classList.remove("badge-bounce");
        void bottomWishlistBadge.offsetWidth;
        bottomWishlistBadge.classList.add("badge-bounce");
    }
    if (typeof syncUserCartAndWishlist === "function") {
        syncUserCartAndWishlist();
    }
}

function initWishlistButtons() {
    const wishlistButtons = document.querySelectorAll(".wishlist-btn");
    wishlistButtons.forEach(function(button) {
        const card = button.closest(".product-card");
        if (!card) return;
        const productId = card.dataset.id;
        if (!productId) return;

        if (savedProducts.includes(productId)) {
            button.classList.add("saved");
            button.textContent = "❤️ Saved";
        } else {
            button.classList.remove("saved");
            button.textContent = "🤍 Wishlist";
        }

        button.onclick = function() {
            const product = getProduct(productId);
            const name = product ? product.name : "Crochet Item";

            button.classList.remove("heart-pop");
            void button.offsetWidth;
            button.classList.add("heart-pop");

            if (button.classList.contains("saved")) {
                button.classList.remove("saved");
                button.textContent = "🤍 Wishlist";
                savedProducts = savedProducts.filter(item => item !== productId);
                showToast(`Removed "${name}" from wishlist`, "🤍");
            } else {
                button.classList.add("saved");
                button.textContent = "❤️ Saved";
                if (!savedProducts.includes(productId)) {
                    savedProducts.push(productId);
                }
                showToast(`Saved "${name}" to your wishlist!`, "❤️");
            }

            localStorage.setItem("wishlist", JSON.stringify(savedProducts));
            updateWishlistCount();
            displayWishlist();
        };
    });
}

function displayWishlist() {
    const wishlistContainer = document.getElementById("wishlist-items");
    if (!wishlistContainer) return;

    wishlistContainer.innerHTML = "";

    if (savedProducts.length === 0) {
        wishlistContainer.innerHTML = `
            <div class="empty-state-box">
                <span class="empty-icon">🤍</span>
                <h3>Your Wishlist is Empty</h3>
                <p>You haven't saved any handcrafted crochet items yet.</p>
                <a href="index.html#products" class="empty-action-btn">← Explore Handcrafted Items</a>
            </div>
        `;
        return;
    }

    savedProducts.forEach(function(itemKey) {
        const product = getProduct(itemKey);
        if (!product) return;

        const wishItem = document.createElement("div");
        wishItem.classList.add("cart-item");

        wishItem.innerHTML = `
            <img
                src="${product.image}"
                alt="${product.name}"
                class="cart-product-image"
            >

            <div class="cart-product-info">
                <h3>${product.name}</h3>
                <p>₹${product.price}</p>
            </div>

            <div class="quantity-controls">
                <button class="cart-btn move-to-cart-btn" style="margin: 0; padding: 10px 20px; font-size: 14px;">
                    🛒 Add to Cart
                </button>
                <button class="remove-btn">
                    🗑️ Remove
                </button>
            </div>
        `;

        // Add to Cart from Wishlist
        const addBtn = wishItem.querySelector(".move-to-cart-btn");
        addBtn.addEventListener("click", function() {
            cartItems.push(product.id || itemKey);
            localStorage.setItem("cart", JSON.stringify(cartItems));
            updateCartCount();
            displayCart();
            showToast(`Added "${product.name}" to cart!`, "🛒");

            addBtn.textContent = "✅ Added!";
            setTimeout(function() {
                addBtn.textContent = "🛒 Add to Cart";
            }, 1500);
        });

        // Remove from Wishlist
        const removeBtn = wishItem.querySelector(".remove-btn");
        removeBtn.addEventListener("click", function() {
            savedProducts = savedProducts.filter(function(item) {
                return item !== itemKey && item !== product.id;
            });
            localStorage.setItem("wishlist", JSON.stringify(savedProducts));
            updateWishlistCount();
            displayWishlist();
            showToast(`Removed "${product.name}" from wishlist`, "🤍");
        });

        wishlistContainer.appendChild(wishItem);
    });
}

// ==========================================
// CART FUNCTIONALITY
// ==========================================
function updateCartCount() {
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        cartCount.textContent = cartItems.length;
        cartCount.classList.remove("badge-bounce");
        void cartCount.offsetWidth;
        cartCount.classList.add("badge-bounce");
    }
    const mobileCartCount = document.getElementById("mobile-cart-count");
    if (mobileCartCount) {
        mobileCartCount.textContent = cartItems.length;
    }
    const bottomCartBadge = document.getElementById("bottom-cart-badge");
    if (bottomCartBadge) {
        const count = cartItems.length;
        bottomCartBadge.textContent = count;
        bottomCartBadge.style.display = count > 0 ? "inline-flex" : "none";
        bottomCartBadge.classList.remove("badge-bounce");
        void bottomCartBadge.offsetWidth;
        bottomCartBadge.classList.add("badge-bounce");
    }
    if (typeof syncUserCartAndWishlist === "function") {
        syncUserCartAndWishlist();
    }
}

function initCartButtons() {
    const cartButtons = document.querySelectorAll(".cart-btn");
    cartButtons.forEach(function(button) {
        if (button.disabled) return;
        const card = button.closest(".product-card");
        if (!card) return;
        const productId = card.dataset.id;
        if (!productId) return;

        button.onclick = function() {
            const product = getProduct(productId);
            const name = product ? product.name : "Crochet Creation";

            cartItems.push(productId);
            localStorage.setItem("cart", JSON.stringify(cartItems));
            updateCartCount();
            displayCart();
            showToast(`Added "${name}" to your cart!`, "🛒");

            button.textContent = "✅ Added to Cart";
            setTimeout(function() {
                button.textContent = "🛒 Add to Cart";
            }, 1500);
        };
    });
}

function displayCart() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const checkoutBtn = document.querySelector(".checkout-btn");
    const clearCartBtn = document.getElementById("clear-cart-btn");
    const cartTotalBox = document.querySelector(".cart-total");

    // Only run on cart.html
    if (!cartItemsContainer || !cartTotal) {
        return;
    }

    cartItemsContainer.innerHTML = "";

    // Empty Cart State
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-state-box">
                <span class="empty-icon">🧶</span>
                <h3>Your Yarn Basket is Empty</h3>
                <p>Looks like you haven't added any handmade crochet creations yet.</p>
                <a href="index.html#products" class="empty-action-btn">← Explore Handcrafted Items</a>
            </div>
        `;

        cartTotal.textContent = "0";
        if (checkoutBtn) checkoutBtn.style.display = "none";
        if (clearCartBtn) clearCartBtn.style.display = "none";
        if (cartTotalBox) cartTotalBox.style.display = "none";
        return;
    }

    // Active Cart: Show controls
    if (checkoutBtn) checkoutBtn.style.display = "inline-block";
    if (clearCartBtn) clearCartBtn.style.display = "inline-block";
    if (cartTotalBox) cartTotalBox.style.display = "block";

    // Group items
    const quantities = {};
    cartItems.forEach(function(itemKey) {
        quantities[itemKey] = (quantities[itemKey] || 0) + 1;
    });

    let total = 0;

    Object.keys(quantities).forEach(function(itemKey) {
        const product = getProduct(itemKey);
        const quantity = quantities[itemKey];

        if (!product) return;

        const itemTotal = product.price * quantity;
        total += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");

        cartItem.innerHTML = `
            <img
                src="${product.image}"
                alt="${product.name}"
                class="cart-product-image"
            >

            <div class="cart-product-info">
                <h3>${product.name}</h3>
                <p>₹${product.price}</p>
            </div>

            <div class="quantity-controls">
                <button class="quantity-btn decrease-btn">−</button>
                <span class="quantity">${quantity}</span>
                <button class="quantity-btn increase-btn">+</button>
                <button class="remove-btn">🗑️ Remove</button>
            </div>
        `;

        // Decrease quantity
        const decreaseButton = cartItem.querySelector(".decrease-btn");
        decreaseButton.addEventListener("click", function() {
            let index = cartItems.indexOf(itemKey);
            if (index === -1) index = cartItems.indexOf(Number(itemKey));

            if (index !== -1) {
                cartItems.splice(index, 1);
            }

            localStorage.setItem("cart", JSON.stringify(cartItems));
            updateCartCount();
            displayCart();
        });

        // Increase quantity
        const increaseButton = cartItem.querySelector(".increase-btn");
        increaseButton.addEventListener("click", function() {
            cartItems.push(product.id || itemKey);
            localStorage.setItem("cart", JSON.stringify(cartItems));
            updateCartCount();
            displayCart();
        });

        // Remove item entirely
        const removeButton = cartItem.querySelector(".remove-btn");
        removeButton.addEventListener("click", function() {
            cartItems = cartItems.filter(function(item) {
                return item !== itemKey && item !== Number(itemKey) && item !== product.id;
            });
            localStorage.setItem("cart", JSON.stringify(cartItems));
            updateCartCount();
            displayCart();
            showToast(`Removed "${product.name}" from cart`, "🗑️");
        });

        cartItemsContainer.appendChild(cartItem);
    });

    cartTotal.textContent = total;
}


// ==========================================
// CLEAR CART
// ==========================================

const clearCartButton =
    document.getElementById("clear-cart-btn");

if (clearCartButton) {

    clearCartButton.addEventListener(
        "click",
        function() {

            // Empty cart
            cartItems = [];

            // Save empty cart
            localStorage.setItem(
                "cart",
                JSON.stringify(cartItems)
            );

            // Update cart count
            updateCartCount();

            // Refresh cart
            displayCart();

        }
    );

}


// ==========================================
// CHECKOUT PAGE
// ==========================================

function displayCheckout() {

    const checkoutItems =
        document.getElementById("checkout-items");

    const checkoutTotal =
        document.getElementById("checkout-total");

    const placeOrderBtn =
        document.getElementById("place-order-btn");

    if (!checkoutItems || !checkoutTotal) {
        return;
    }

    checkoutItems.innerHTML = "";

    if (cartItems.length === 0) {
        checkoutItems.innerHTML = `
            <div class="empty-state-box" style="margin: 20px 0;">
                <span class="empty-icon">🛒</span>
                <h3>Your Cart is Empty</h3>
                <p>Please add handcrafted items to your basket before checkout.</p>
                <a href="index.html#products" class="empty-action-btn">← Explore Handcrafted Items</a>
            </div>
        `;
        checkoutTotal.textContent = "0";
        if (placeOrderBtn) {
            placeOrderBtn.disabled = true;
            placeOrderBtn.style.opacity = "0.5";
            placeOrderBtn.style.cursor = "not-allowed";
        }
        return;
    }

    if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.style.opacity = "1";
        placeOrderBtn.style.cursor = "pointer";
    }

    const quantities = {};

    cartItems.forEach(function(itemKey) {

        if (quantities[itemKey]) {

            quantities[itemKey]++;

        } else {

            quantities[itemKey] = 1;

        }

    });

    let checkoutAmount = 0;

    Object.keys(quantities).forEach(function(itemKey) {

        const product =
            getProduct(itemKey);

        const quantity =
            quantities[itemKey];

        if (!product) {

            return;

        }

        const itemTotal =
            product.price * quantity;

        checkoutAmount += itemTotal;

        const checkoutItem =
            document.createElement("div");

        checkoutItem.classList.add(
            "checkout-item"
        );

        checkoutItem.innerHTML = `

            <div class="checkout-item-info">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    class="checkout-product-image"
                >

                <div>

                    <h3>
                        ${product.name}
                    </h3>

                    <p>
                        ₹${product.price} × ${quantity}
                    </p>

                </div>

            </div>

            <strong>
                ₹${itemTotal}
            </strong>

        `;

        checkoutItems.appendChild(
            checkoutItem
        );

    });

    checkoutTotal.textContent =
        checkoutAmount;

    // Prefill customer details if user is logged in
    let currentUser = null;
    try {
        const rawUser = localStorage.getItem("tangled_user");
        if (rawUser) currentUser = JSON.parse(rawUser);
    } catch(e) {}

    const nameInput = document.getElementById("customer-name");
    const phoneInput = document.getElementById("customer-phone");
    const emailInput = document.getElementById("customer-email");
    const addressInput = document.getElementById("customer-address");
    const checkoutForm = document.querySelector(".checkout-form");

    if (checkoutForm) {
        let existingBanner = document.getElementById("checkout-user-banner");
        if (!existingBanner) {
            existingBanner = document.createElement("div");
            existingBanner.id = "checkout-user-banner";
            const formHeading = checkoutForm.querySelector("h2");
            if (formHeading && formHeading.nextSibling) {
                checkoutForm.insertBefore(existingBanner, formHeading.nextSibling);
            } else {
                checkoutForm.prepend(existingBanner);
            }
        }

        if (currentUser && currentUser.id) {
            existingBanner.className = "checkout-user-banner";
            existingBanner.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                    <span style="background:#4E5D34; color:#FFFFFF; font-size:11px; font-weight:700; padding:3px 9px; border-radius:12px; letter-spacing:0.5px;">SIGNED IN</span>
                    <span><strong>${currentUser.name || "Customer"}</strong> <span style="opacity:0.85; font-size:13px;">(${currentUser.email || ""})</span></span>
                </div>
                <a href="account.html" style="background:#4E5D34; color:#FFFFFF; text-decoration:none; padding:6px 14px; border-radius:20px; font-size:13px; font-weight:600; display:inline-flex; align-items:center; gap:4px; box-shadow:0 2px 6px rgba(78,93,52,0.2);">Manage Account →</a>
            `;
            if (nameInput && !nameInput.value) nameInput.value = currentUser.name || "";
            if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.phone || "";
            if (emailInput && !emailInput.value) emailInput.value = currentUser.email || "";
            if (addressInput && !addressInput.value) addressInput.value = currentUser.address || "";
        } else {
            existingBanner.className = "checkout-user-banner";
            existingBanner.style.background = "#FDF9EE";
            existingBanner.style.borderColor = "#EAD9B8";
            existingBanner.style.color = "#6F5524";
            existingBanner.innerHTML = `
                <span>Have a Tangled account? <a href="login.html?redirect=checkout.html">Sign In</a> for saved delivery details & order history.</span>
            `;
        }
    }

}


// ==========================================
// MOBILE NAVIGATION DRAWER
// ==========================================

function initMobileNavigation() {
    const toggleBtn = document.getElementById("mobile-menu-toggle");
    const closeBtn = document.getElementById("mobile-menu-close");
    const drawer = document.getElementById("mobile-nav-drawer");

    if (!toggleBtn || !drawer) return;

    function openDrawer() {
        drawer.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeDrawer() {
        drawer.classList.remove("active");
        document.body.style.overflow = "";
    }

    toggleBtn.onclick = openDrawer;
    if (closeBtn) closeBtn.onclick = closeDrawer;

    drawer.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeDrawer);
    });

    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && drawer.classList.contains("active")) {
            closeDrawer();
        }
    });
}

initMobileNavigation();


// ==========================================
// SCROLL REVEAL & MICRO-ANIMATIONS
// ==========================================
function initScrollReveal() {
    const targets = document.querySelectorAll(
        ".hero-content, .hero-image, .store-filter-bar, .product-card, .custom-content, .custom-feature, .about-text, .about-image, .review-card, .contact-card"
    );

    if (!("IntersectionObserver" in window)) {
        targets.forEach(el => el.classList.add("is-revealed"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-revealed");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: "0px 0px -25px 0px"
    });

    targets.forEach((el, idx) => {
        el.classList.add("reveal-on-scroll");
        if (el.classList.contains("product-card") || el.classList.contains("review-card") || el.classList.contains("custom-feature")) {
            el.style.transitionDelay = `${(idx % 4) * 0.08}s`;
        }
        observer.observe(el);
    });
}

// ==========================================
// CUSTOMER AUTH & USER NAVIGATION
// ==========================================

function initAuthNav() {
    let currentUser = null;
    try {
        const raw = localStorage.getItem("tangled_user");
        if (raw) currentUser = JSON.parse(raw);
    } catch(e) {}

    const authNavLinks = document.querySelectorAll("#auth-nav-link");
    const mobileAuthLinks = document.querySelectorAll("#mobile-auth-nav-link");
    const bottomAuthLinks = document.querySelectorAll("#bottom-auth-link");

    if (currentUser && currentUser.id) {
        const firstName = (currentUser.name || "Customer").trim().split(" ")[0];
        const initial = firstName.charAt(0).toUpperCase();

        authNavLinks.forEach(link => {
            link.href = "account.html";
            link.className = "nav-user-pill";
            link.innerHTML = `<span class="nav-avatar-circle">${initial}</span><span class="nav-user-name">${firstName}</span><span class="nav-user-chevron">▾</span>`;
            link.title = `Signed in as ${currentUser.name} (View Account)`;
        });

        mobileAuthLinks.forEach(link => {
            link.href = "account.html";
            link.textContent = `👤 ${firstName}'s Account`;
        });

        bottomAuthLinks.forEach(link => {
            link.href = "account.html";
            const label = link.querySelector(".bottom-label");
            if (label) label.textContent = firstName;
        });
    } else {
        authNavLinks.forEach(link => {
            link.href = "login.html";
            link.className = "nav-auth-btn";
            link.innerHTML = `<span class="auth-icon">👤</span><span class="auth-text">Sign In</span>`;
            link.title = "Sign In / Register";
        });
        mobileAuthLinks.forEach(link => {
            link.href = "login.html";
            link.textContent = `👤 Sign In / Account`;
        });
        bottomAuthLinks.forEach(link => {
            link.href = "login.html";
            const label = link.querySelector(".bottom-label");
            if (label) label.textContent = "Account";
        });
    }
}

// Helper to keep user's cart & wishlist in sync on backend
function syncUserCartAndWishlist() {
    try {
        const raw = localStorage.getItem("tangled_user");
        if (!raw) return;
        const u = JSON.parse(raw);
        if (!u || !u.id) return;

        fetch(`/api/users/${u.id}/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cart: typeof cartItems !== "undefined" ? cartItems : [],
                wishlist: typeof wishlist !== "undefined" ? wishlist : []
            })
        }).catch(() => {});
    } catch(e) {}
}

document.addEventListener("DOMContentLoaded", initAuthNav);

// ==========================================
// LOAD STORE DATA (DYNAMIC PRODUCTS & STORAGE)
// ==========================================

async function loadStoreData() {

    try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
            products = data.products;
        }
    } catch (err) {
        console.log("Backend offline, using local catalog fallback.");
    }

    renderStorefrontProducts();
    initWishlistButtons();
    initCartButtons();
    initQuickViewModal();
    initMobileNavigation();
    initScrollReveal();
    initAuthNav();
    updateCartCount();
    displayCart();
    updateWishlistCount();
    displayWishlist();
    displayCheckout();

}

loadStoreData();


// ==========================================
// PLACE ORDER
// ==========================================

const placeOrderButton =
    document.getElementById("place-order-btn");

if (placeOrderButton) {

    placeOrderButton.addEventListener(
        "click",
        async function() {

            // Cart empty safeguard
            if (cartItems.length === 0) {
                showToast("Your cart is empty! Add items first.", "⚠️");
                alert("Your cart is empty! Please add some handcrafted items to your basket before placing an order.");
                return;
            }

            // ==========================================
            // GET CUSTOMER DETAILS
            // ==========================================

            const name =
                document.getElementById("customer-name").value.trim();

            const phone =
                document.getElementById("customer-phone").value.trim();

            const email =
                document.getElementById("customer-email").value.trim();

            const address =
                document.getElementById("customer-address").value.trim();

            const note =
                document.getElementById("customer-note").value.trim();


            // ==========================================
            // VALIDATION
            // ==========================================

            if (name === "") {

                alert("Please enter your name.");
                return;

            }

            if (phone === "") {

                alert("Please enter your phone number.");
                return;

            }

            if (email === "") {

                alert("Please enter your email address.");
                return;

            }

            if (address === "") {

                alert("Please enter your delivery address.");
                return;

            }


            // ==========================================
            // CREATE ORDER DETAILS
            // ==========================================

            const quantities = {};

            cartItems.forEach(function(itemKey) {

                if (quantities[itemKey]) {

                    quantities[itemKey]++;

                } else {

                    quantities[itemKey] = 1;

                }

            });


            let orderDetails = "";
            let orderTotal = 0;


            Object.keys(quantities).forEach(
                function(itemKey) {

                    const product =
                        getProduct(itemKey);

                    const quantity =
                        quantities[itemKey];

                    if (!product) {

                        return;

                    }

                    const itemTotal =
                        product.price * quantity;

                    orderTotal += itemTotal;


                    orderDetails +=
                        product.name +
                        " × " +
                        quantity +
                        " - ₹" +
                        itemTotal +
                        "\n";

                }
            );


            // ==========================================
            // SEND ORDER TO BACKEND
            // ==========================================

            let currentUserId = null;
            try {
                const rawUser = localStorage.getItem("tangled_user");
                if (rawUser) {
                    const u = JSON.parse(rawUser);
                    currentUserId = u.id || null;
                }
            } catch(e) {}

            const order = {
                userId: currentUserId,

                customer: {
                    userId: (() => {
                        try {
                            const u = JSON.parse(localStorage.getItem("tangled_user"));
                            return u ? u.id : null;
                        } catch(e) { return null; }
                    })(),
                    name: name,
                    phone: phone,
                    email: email,
                    address: address,
                    note: note
                },

                items: quantities,

                orderDetails: orderDetails,

                total: orderTotal,

                paymentMethod: "Direct Email Chat (UPI / GPay / Bank Transfer)",

                paymentStatus: "Pending Email Chat"

            };


            try {

                const response =
                    await fetch(
                        "/api/orders",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify(order)
                        }
                    );


                const result =
                    await response.json();


                if (!result.success) {

                    alert(
                        "Could not place the order."
                    );

                    return;

                }


                console.log(
                    "Order sent to backend:",
                    result
                );


                // ==========================================
                // CREATE GMAIL MESSAGE
                // ==========================================

                const subject =
                    "New Tangled Order - " + name;


                const body =
                    "Hello Tangled!\n\n" +

                    "I would like to place an order.\n\n" +

                    "ORDER DETAILS\n" +
                    "-------------------------\n" +

                    orderDetails +

                    "\nTotal: ₹" +
                    orderTotal +

                    "\n\nCUSTOMER DETAILS\n" +
                    "-------------------------\n" +

                    "Name: " +
                    name +

                    "\nPhone: " +
                    phone +

                    "\nEmail: " +
                    email +

                    "\nAddress: " +
                    address +

                    "\nOrder Note: " +
                    (note || "None") +

                    "\n\nPAYMENT DETAILS (SAFE EMAIL CHAT)\n" +
                    "-------------------------\n" +
                    "Payment Mode: To be completed via Email Chat with Tangled\n" +
                    "Accepted: UPI / GPay / PhonePe / Bank Transfer (Direct & 100% Safe)\n" +
                    "Tangled will review your handcrafted order and reply with payment options to confirm your slot.\n" +

                    "\nDELIVERY TIMEFRAME\n" +
                    "-------------------------\n" +
                    "Estimated Delivery: 5 to 20 days (Handcrafted with love based on the crochet work required)" +

                    "\n\nThank you!";


                // ==========================================
                // OPEN GMAIL
                // ==========================================

                const gmailURL =
                    "https://mail.google.com/mail/?view=cm" +
                    "&fs=1" +
                    "&to=moonthread2026@gmail.com" +
                    "&su=" +
                    encodeURIComponent(subject) +
                    "&body=" +
                    encodeURIComponent(body);


                window.open(
                    gmailURL,
                    "_blank"
                );


                // ==========================================
                // CLEAR CART AFTER ORDER
                // ==========================================

                cartItems = [];

                localStorage.setItem(
                    "cart",
                    JSON.stringify(cartItems)
                );

                updateCartCount();

                if (currentUserId) {
                    try {
                        const raw = localStorage.getItem("tangled_user");
                        if (raw) {
                            const u = JSON.parse(raw);
                            u.cart = [];
                            localStorage.setItem("tangled_user", JSON.stringify(u));
                        }
                        syncUserCartAndWishlist();
                    } catch(e) {}
                }


                const orderId = result.orderId || "";
                const orderIdText = orderId ? " (Order ID: " + orderId + ")" : "";

                alert(
                    "🎉 Thank you, " + name + "!\n\n" +
                    "Your order request" + orderIdText + " has been placed successfully.\n\n" +
                    "💬 Safe Payment via Email Chat:\n" +
                    "No payment was collected on the website! We have opened an email chat to moonthread2026@gmail.com where we will review your order details and share easy payment instructions (UPI / GPay / QR Code / Bank Transfer) directly with you.\n\n" +
                    "🧶 Handmade Delivery Notice:\n" +
                    "Because each piece is lovingly crocheted by hand, your order will be delivered within 5 to 20 days.\n\n" +
                    "You will now be taken to your Order Tracking page where you can follow its handmade journey! 💕"
                );

                if (orderId) {
                    window.location.href = `track-order.html?id=${encodeURIComponent(orderId)}`;
                }

            }

            catch (error) {

                console.error(
                    "Order error:",
                    error
                );

                alert(
                    "Could not connect to the Tangled server. " +
                    "Please make sure the backend is running."
                );

            }

        }
    );

}


// ==========================================
// CUSTOM ORDER MODAL & PHOTO UPLOAD
// ==========================================

(function initCustomOrderModal() {
    const openCustomModalBtn = document.getElementById("open-custom-modal-btn");
    const closeCustomModalBtn = document.getElementById("close-modal-btn");
    const customModal = document.getElementById("custom-modal");
    const customForm = document.getElementById("custom-order-form");
    const dropzone = document.getElementById("custom-upload-dropzone");
    const fileInput = document.getElementById("custom-image-file");
    const previewWrapper = document.getElementById("custom-preview-wrapper");
    const previewImg = document.getElementById("custom-img-preview");
    const previewName = document.getElementById("custom-img-name");
    const removeImgBtn = document.getElementById("remove-custom-img-btn");
    const submitBtn = document.getElementById("submit-custom-order-btn");

    let currentBase64Image = null;
    let currentImageName = null;

    function prefillUserInfo() {
        try {
            const user = JSON.parse(localStorage.getItem("tangled_user"));
            if (user) {
                const nameInput = document.getElementById("custom-name");
                const emailInput = document.getElementById("custom-email");
                const phoneInput = document.getElementById("custom-phone");
                if (nameInput && !nameInput.value) nameInput.value = user.name || "";
                if (emailInput && !emailInput.value) emailInput.value = user.email || "";
                if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || "";
            }
        } catch (e) {
            console.warn("Could not prefill user details:", e);
        }
    }

    function resetCustomImage() {
        currentBase64Image = null;
        currentImageName = null;
        if (fileInput) fileInput.value = "";
        if (previewImg) previewImg.src = "";
        if (previewName) previewName.textContent = "";
        if (previewWrapper) previewWrapper.style.display = "none";
        if (dropzone) dropzone.style.display = "block";
    }

    function processSelectedFile(file) {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file (JPG, PNG, WebP).");
            return;
        }

        // Limit size to 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert("Image is larger than 5MB. Please choose a smaller photo.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            currentBase64Image = e.target.result;
            currentImageName = file.name;

            if (previewImg) previewImg.src = currentBase64Image;
            if (previewName) {
                const kb = Math.round(file.size / 1024);
                previewName.textContent = "📸 " + file.name + " (" + kb + " KB)";
            }
            if (previewWrapper) previewWrapper.style.display = "block";
            if (dropzone) dropzone.style.display = "none";
        };
        reader.readAsDataURL(file);
    }

    if (openCustomModalBtn && customModal) {
        openCustomModalBtn.addEventListener("click", function() {
            prefillUserInfo();
            customModal.classList.add("active");
        });

        if (closeCustomModalBtn) {
            closeCustomModalBtn.addEventListener("click", function() {
                customModal.classList.remove("active");
            });
        }

        customModal.addEventListener("click", function(e) {
            if (e.target === customModal) {
                customModal.classList.remove("active");
            }
        });

        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape" && customModal.classList.contains("active")) {
                customModal.classList.remove("active");
            }
        });
    }

    // Photo Dropzone and Input listeners
    if (dropzone && fileInput) {
        dropzone.addEventListener("click", function() {
            fileInput.click();
        });

        dropzone.addEventListener("keydown", function(e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInput.click();
            }
        });

        fileInput.addEventListener("change", function() {
            if (fileInput.files && fileInput.files[0]) {
                processSelectedFile(fileInput.files[0]);
            }
        });

        // Drag & Drop
        dropzone.addEventListener("dragover", function(e) {
            e.preventDefault();
            dropzone.classList.add("drag-over");
        });

        dropzone.addEventListener("dragleave", function(e) {
            e.preventDefault();
            dropzone.classList.remove("drag-over");
        });

        dropzone.addEventListener("drop", function(e) {
            e.preventDefault();
            dropzone.classList.remove("drag-over");
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
                processSelectedFile(e.dataTransfer.files[0]);
            }
        });
    }

    if (removeImgBtn) {
        removeImgBtn.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            resetCustomImage();
        });
    }

    // Form Submission
    if (customForm) {
        customForm.addEventListener("submit", async function(e) {
            e.preventDefault();

            const name = document.getElementById("custom-name").value.trim();
            const phone = document.getElementById("custom-phone").value.trim();
            const email = document.getElementById("custom-email") ? document.getElementById("custom-email").value.trim() : "";
            const idea = document.getElementById("custom-idea").value.trim();
            const colors = document.getElementById("custom-colors") ? document.getElementById("custom-colors").value.trim() : "";
            const neededBy = document.getElementById("custom-needed-by") ? document.getElementById("custom-needed-by").value.trim() : "";

            if (!name || !phone || !idea) {
                alert("Please fill in your name, WhatsApp/phone number, and custom crochet idea.");
                return;
            }

            let userId = null;
            try {
                const u = JSON.parse(localStorage.getItem("tangled_user"));
                if (u && u.id) userId = u.id;
            } catch (err) {}

            const submitOriginalText = submitBtn ? submitBtn.innerHTML : "Submit";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = "⏳ Submitting for Review...";
            }

            try {
                const response = await fetch("/api/custom-orders", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: userId,
                        name: name,
                        phone: phone,
                        email: email,
                        contact: phone || email,
                        idea: idea,
                        colors: colors,
                        neededBy: neededBy,
                        referenceImageBase64: currentBase64Image,
                        referenceImageName: currentImageName
                    })
                });

                const result = await response.json();

                if (result.success) {
                    const orderId = result.orderId;
                    alert(
                        "✨ Custom Request Submitted Successfully!\n\n" +
                        "Order ID: " + orderId + "\n\n" +
                        "Our artisan will review your design pattern & schedule availability, and reach out to your WhatsApp (" + phone + ") or Email within 24 hours with an availability confirmation & price quote.\n\n" +
                        "You can track review progress anytime on our Track Order page!"
                    );

                    customForm.reset();
                    resetCustomImage();
                    if (customModal) customModal.classList.remove("active");
                } else {
                    alert("Submission issue: " + (result.message || "Please try again."));
                }
            } catch (err) {
                console.error("Backend error submitting custom order:", err);
                // Fallback to WhatsApp chat directly
                const fallbackMsg = encodeURIComponent(
                    "Hello Tangled! 🧶\n\n" +
                    "I would like to place a custom crochet order:\n" +
                    "• Name: " + name + "\n" +
                    "• Phone: " + phone + "\n" +
                    (email ? "• Email: " + email + "\n" : "") +
                    "• Idea: " + idea + "\n" +
                    "• Colors: " + (colors || "Open to suggestions") + "\n" +
                    (neededBy ? "• Needed by: " + neededBy + "\n" : "")
                );
                alert("Thank you! Connecting you directly to Tangled on WhatsApp to send your request details.");
                window.open("https://wa.me/919495841611?text=" + fallbackMsg, "_blank");
                customForm.reset();
                resetCustomImage();
                if (customModal) customModal.classList.remove("active");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = submitOriginalText;
                }
            }
        });
    }
})();
