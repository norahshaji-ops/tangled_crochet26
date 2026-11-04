const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// Database file paths
const ORDERS_FILE = path.join(__dirname, "orders.json");
const PRODUCTS_FILE = path.join(__dirname, "products.json");
const USERS_FILE = path.join(__dirname, "users.json");

// Middleware
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.static(path.join(__dirname, "..")));

// ==========================================
// DATABASE HELPERS (ORDERS)
// ==========================================

function getSavedOrders() {
    try {
        if (!fs.existsSync(ORDERS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(ORDERS_FILE, "utf-8");
        return JSON.parse(data) || [];
    } catch (error) {
        console.error("Error reading orders file:", error);
        return [];
    }
}

function saveOrders(orders) {
    try {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
    } catch (error) {
        console.error("Error saving orders file:", error);
    }
}

// ==========================================
// DATABASE HELPERS (PRODUCTS)
// ==========================================

function getSavedProducts() {
    try {
        if (!fs.existsSync(PRODUCTS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
        return JSON.parse(data) || [];
    } catch (error) {
        console.error("Error reading products file:", error);
        return [];
    }
}

function saveProducts(products) {
    try {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
    } catch (error) {
        console.error("Error saving products file:", error);
    }
}

// ==========================================
// DATABASE HELPERS (USERS)
// ==========================================

function getSavedUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(USERS_FILE, "utf-8");
        return JSON.parse(data) || [];
    } catch (error) {
        console.error("Error reading users file:", error);
        return [];
    }
}

function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
    } catch (error) {
        console.error("Error saving users file:", error);
    }
}

function hashPassword(password, salt) {
    if (!salt) {
        salt = crypto.randomBytes(16).toString("hex");
    }
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return { salt, hash };
}

function sanitizeUser(user) {
    if (!user) return null;
    const { passwordHash, passwordSalt, ...safeUser } = user;
    return safeUser;
}

// ==========================================
// GENERAL ENDPOINTS
// ==========================================

app.get("/api/health", (req, res) => {
    res.send("Tangled backend is working! 🧶");
});

// ==========================================
// ORDER ENDPOINTS
// ==========================================

// GET all orders (for Admin Dashboard)
app.get("/api/orders", (req, res) => {
    const orders = getSavedOrders();
    res.json({
        success: true,
        orders: orders
    });
});

// POST a standard checkout order
app.post("/api/orders", (req, res) => {
    const orderData = req.body;
    const orders = getSavedOrders();
    const standardCount = orders.filter(o => o.type !== "custom").length;
    const orderId = "TGL-" + (1001 + standardCount);

    const newOrder = {
        id: orderId,
        userId: orderData.userId || null,
        type: "standard",
        createdAt: new Date().toISOString(),
        status: "Pending", // Pending, Confirmed, Making, Ready, Delivered
        paymentMethod: orderData.paymentMethod || "Direct Email Chat (UPI / Bank Transfer)",
        paymentStatus: orderData.paymentStatus || "Pending Email Chat",
        customer: orderData.customer,
        items: orderData.items,
        orderDetails: orderData.orderDetails,
        total: orderData.total
    };

    orders.push(newOrder);
    saveOrders(orders);

    console.log(`Saved new order ${orderId} permanently to orders.json:`);
    console.log(newOrder);

    res.json({
        success: true,
        message: `Order ${orderId} saved successfully! 🧶`,
        orderId: orderId,
        order: newOrder
    });
});

// POST a custom order request
app.post("/api/custom-orders", (req, res) => {
    const { name, phone, email, contact, idea, colors, neededBy, referenceImageBase64, referenceImageName, userId } = req.body;
    const orders = getSavedOrders();
    const customCount = orders.filter(o => o.type === "custom").length;
    const orderId = "CST-" + (1001 + customCount);

    let savedRefImagePath = "";

    // Save uploaded reference image if provided
    if (referenceImageBase64) {
        try {
            let ext = ".jpg";
            if (referenceImageName && referenceImageName.includes(".")) {
                ext = path.extname(referenceImageName).toLowerCase() || ".jpg";
            } else if (referenceImageBase64.startsWith("data:image/png")) {
                ext = ".png";
            } else if (referenceImageBase64.startsWith("data:image/webp")) {
                ext = ".webp";
            }

            const cleanBase64 = referenceImageBase64.replace(/^data:image\/\w+;base64,/, "");
            const imageBuffer = Buffer.from(cleanBase64, "base64");

            const savedFileName = `${orderId}${ext}`;
            const targetDir = path.join(__dirname, "..", "images", "custom");

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const targetFilePath = path.join(targetDir, savedFileName);
            fs.writeFileSync(targetFilePath, imageBuffer);

            savedRefImagePath = `images/custom/${savedFileName}`;
            console.log(`Saved custom order reference photo to: ${savedRefImagePath}`);
        } catch (uploadErr) {
            console.error("Error saving custom reference photo:", uploadErr);
        }
    }

    const cleanEmail = email || (contact && contact.includes("@") ? contact.trim() : "");
    const cleanPhone = phone || (contact && !contact.includes("@") ? contact.trim() : "");

    const newCustomOrder = {
        id: orderId,
        userId: userId || null,
        type: "custom",
        createdAt: new Date().toISOString(),
        status: "Under Review", // "Under Review", "Accepted", "Declined", "Confirmed", "Making", "Ready", "Delivered"
        paymentMethod: "Direct Email Chat (UPI / Bank Transfer)",
        paymentStatus: "Pending Availability Review",
        customer: {
            name: name ? name.trim() : "Valued Customer",
            contact: contact || cleanEmail || cleanPhone,
            phone: cleanPhone,
            email: cleanEmail,
            address: "To be confirmed via DM / Email",
            note: `Colors: ${colors || "Open to suggestions"}${neededBy ? ` | Needed by: ${neededBy}` : ""}`
        },
        items: {
            "custom-piece": 1
        },
        idea: idea ? idea.trim() : "Custom Crochet Piece",
        colors: colors ? colors.trim() : "Open to suggestions",
        neededBy: neededBy ? neededBy.trim() : "",
        referenceImage: savedRefImagePath,
        quotedPrice: null,
        estimatedDays: null,
        declineReason: null,
        orderDetails: `🧶 CUSTOM CROCHET PIECE\nIdea: ${idea}\nColors: ${colors || "Open to suggestions"}${neededBy ? `\nTarget Date: ${neededBy}` : ""}`,
        total: "Awaiting Quote"
    };

    orders.push(newCustomOrder);
    saveOrders(orders);

    console.log(`Saved new custom request ${orderId} (Status: Under Review) to orders.json:`);
    console.log(newCustomOrder);

    res.json({
        success: true,
        message: `Custom request ${orderId} submitted! Tangled will review your design and check availability. 🧶`,
        orderId: orderId,
        order: newCustomOrder
    });
});

// PATCH decision on custom order (Accept or Decline)
app.patch("/api/custom-orders/:id/decision", (req, res) => {
    const { id } = req.params;
    const { decision, quotedPrice, estimatedDays, declineReason } = req.body;

    const orders = getSavedOrders();
    const orderIndex = orders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
        return res.status(404).json({ success: false, message: "Custom order not found" });
    }

    const order = orders[orderIndex];

    if (decision === "accept") {
        order.status = "Accepted";
        order.quotedPrice = quotedPrice ? Number(quotedPrice) : null;
        order.total = quotedPrice ? Number(quotedPrice) : "Custom Quote";
        order.estimatedDays = estimatedDays || "7–14 days";
        order.paymentStatus = "Quote Sent (Pending Payment)";
        order.declineReason = null;
    } else if (decision === "decline") {
        order.status = "Declined";
        order.declineReason = declineReason || "Pattern or crafting schedule currently unavailable";
        order.paymentStatus = "Order Declined";
    } else {
        return res.status(400).json({ success: false, message: "Invalid decision. Must be 'accept' or 'decline'." });
    }

    saveOrders(orders);

    console.log(`Custom order ${id} decision: ${decision.toUpperCase()}`);

    res.json({
        success: true,
        message: `Custom order ${id} has been ${decision === "accept" ? "Accepted" : "Declined"}.`,
        order: order
    });
});

// PATCH order status (Pending, Confirmed, Making, Ready, Delivered)
app.patch("/api/orders/:id/status", (req, res) => {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const orders = getSavedOrders();
    const orderIndex = orders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Order not found"
        });
    }

    if (status) {
        orders[orderIndex].status = status;
    }
    if (paymentStatus) {
        orders[orderIndex].paymentStatus = paymentStatus;
    }

    saveOrders(orders);

    console.log(`Order ${id} status updated to: ${status || orders[orderIndex].status}, paymentStatus: ${orders[orderIndex].paymentStatus}`);

    res.json({
        success: true,
        message: `Order ${id} updated successfully`,
        order: orders[orderIndex]
    });
});

// GET track order by Order ID or Phone
app.get("/api/orders/track/:query", (req, res) => {
    const rawQuery = (req.params.query || "").trim();
    if (!rawQuery) {
        return res.status(400).json({
            success: false,
            message: "Please provide an Order ID or Phone number."
        });
    }

    const orders = getSavedOrders();
    const cleanQuery = rawQuery.toLowerCase();
    const cleanDigits = rawQuery.replace(/\D/g, "");

    const matched = orders.filter(o => {
        const idMatch = o.id && o.id.toLowerCase() === cleanQuery;
        const phoneMatch = cleanDigits.length >= 6 && o.customer && o.customer.phone && o.customer.phone.replace(/\D/g, "").includes(cleanDigits);
        return idMatch || phoneMatch;
    });

    if (matched.length === 0) {
        return res.status(404).json({
            success: false,
            message: `No order found matching "${rawQuery}". Please check your Order ID or phone number.`
        });
    }

    // Mask sensitive details for customer privacy
    const safeOrders = matched.map(o => {
        const cust = o.customer || {};
        const rawPhone = cust.phone || cust.contact || "";
        const maskedPhone = rawPhone.length > 4 ? rawPhone.slice(0, 2) + "••••••" + rawPhone.slice(-2) : "••••";
        const firstName = cust.name ? cust.name.split(" ")[0] : "Valued Customer";

        return {
            id: o.id,
            type: o.type || "standard",
            status: o.status || "Pending",
            paymentMethod: o.paymentMethod || "Direct Email Chat (UPI / Bank Transfer)",
            paymentStatus: o.paymentStatus || "Pending Email Chat",
            createdAt: o.createdAt,
            customerFirstName: firstName,
            maskedPhone: maskedPhone,
            orderDetails: o.orderDetails || "",
            total: o.total || "",
            referenceImage: o.referenceImage || "",
            idea: o.idea || "",
            colors: o.colors || "",
            neededBy: o.neededBy || "",
            quotedPrice: o.quotedPrice || null,
            estimatedDays: o.estimatedDays || "",
            declineReason: o.declineReason || "",
            estimatedDelivery: o.estimatedDays ? `${o.estimatedDays} Handcrafted Crafting` : "5–20 Days Handcrafted Delivery"
        };
    });

    res.json({
        success: true,
        orders: safeOrders
    });
});

// ==========================================
// USER & AUTH ENDPOINTS
// ==========================================

// POST Sign Up (Create new customer account)
app.post("/api/auth/signup", (req, res) => {
    const { name, email, phone, address, password, cart, wishlist } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Please provide your full name." });
    }
    if (!email || !email.includes("@")) {
        return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = getSavedUsers();

    if (users.some(u => u.email && u.email.toLowerCase() === cleanEmail)) {
        return res.status(400).json({
            success: false,
            message: "An account with this email address already exists. Please sign in instead."
        });
    }

    const { salt, hash } = hashPassword(password);
    const userId = "usr_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 7);

    const newUser = {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : "",
        address: address ? address.trim() : "",
        passwordHash: hash,
        passwordSalt: salt,
        cart: Array.isArray(cart) ? cart : [],
        wishlist: Array.isArray(wishlist) ? wishlist : [],
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    console.log(`New user registered: ${newUser.name} (${newUser.email}) - ID: ${userId}`);

    res.json({
        success: true,
        message: "Welcome to Tangled! Your account has been created.",
        user: sanitizeUser(newUser)
    });
});

// POST Sign In (Customer login)
app.post("/api/auth/login", (req, res) => {
    const { identifier, password, cart, wishlist } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({
            success: false,
            message: "Please enter your email/phone and password."
        });
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, "");
    const users = getSavedUsers();

    const userIndex = users.findIndex(u => {
        const emailMatch = u.email && u.email.toLowerCase() === cleanId;
        const phoneMatch = cleanDigits.length >= 6 && u.phone && u.phone.replace(/\D/g, "") === cleanDigits;
        return emailMatch || phoneMatch;
    });

    if (userIndex === -1) {
        return res.status(401).json({
            success: false,
            message: "Incorrect email/phone or password. Please try again."
        });
    }

    const user = users[userIndex];
    const { hash } = hashPassword(password, user.passwordSalt);

    if (hash !== user.passwordHash) {
        return res.status(401).json({
            success: false,
            message: "Incorrect email/phone or password. Please try again."
        });
    }

    // Merge incoming guest cart/wishlist if provided
    let updated = false;
    if (Array.isArray(wishlist) && wishlist.length > 0) {
        const mergedWishlist = Array.from(new Set([...(user.wishlist || []), ...wishlist]));
        user.wishlist = mergedWishlist;
        updated = true;
    }
    if (Array.isArray(cart) && cart.length > 0) {
        const existingCart = user.cart || [];
        cart.forEach(incomingItem => {
            const idx = existingCart.findIndex(item => item.id === incomingItem.id);
            if (idx > -1) {
                existingCart[idx].quantity = Math.max(existingCart[idx].quantity, incomingItem.quantity);
            } else {
                existingCart.push(incomingItem);
            }
        });
        user.cart = existingCart;
        updated = true;
    }

    if (updated) {
        saveUsers(users);
    }

    console.log(`User logged in: ${user.name} (${user.email})`);

    res.json({
        success: true,
        message: `Welcome back, ${user.name.split(" ")[0]}!`,
        user: sanitizeUser(user)
    });
});

// GET user profile
app.get("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const users = getSavedUsers();
    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({
        success: true,
        user: sanitizeUser(user)
    });
});

// PUT update user profile
app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { name, phone, address, currentPassword, newPassword } = req.body;

    const users = getSavedUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: "User not found." });
    }

    const user = users[userIndex];

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();

    if (newPassword) {
        if (!currentPassword) {
            return res.status(400).json({ success: false, message: "Please provide your current password to change password." });
        }
        const { hash: checkHash } = hashPassword(currentPassword, user.passwordSalt);
        if (checkHash !== user.passwordHash) {
            return res.status(400).json({ success: false, message: "Current password does not match." });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters long." });
        }
        const { salt, hash } = hashPassword(newPassword);
        user.passwordSalt = salt;
        user.passwordHash = hash;
    }

    saveUsers(users);

    res.json({
        success: true,
        message: "Profile updated successfully!",
        user: sanitizeUser(user)
    });
});

// POST sync cart & wishlist to user profile
app.post("/api/users/:id/sync", (req, res) => {
    const { id } = req.params;
    const { cart, wishlist } = req.body;

    const users = getSavedUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: "User not found." });
    }

    const user = users[userIndex];
    if (Array.isArray(cart)) user.cart = cart;
    if (Array.isArray(wishlist)) user.wishlist = wishlist;

    saveUsers(users);

    res.json({
        success: true,
        message: "Account cart & wishlist synchronized.",
        user: sanitizeUser(user)
    });
});

// GET customer orders
app.get("/api/users/:id/orders", (req, res) => {
    const { id } = req.params;
    const users = getSavedUsers();
    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
    }

    const orders = getSavedOrders();
    const userEmail = (user.email || "").toLowerCase();
    const userPhoneDigits = (user.phone || "").replace(/\D/g, "");

    const customerOrders = orders.filter(o => {
        const idMatch = o.userId && o.userId === user.id;
        const emailMatch = userEmail && o.customer && o.customer.email && o.customer.email.toLowerCase() === userEmail;
        const phoneMatch = userPhoneDigits.length >= 6 && o.customer && o.customer.phone && o.customer.phone.replace(/\D/g, "") === userPhoneDigits;
        return idMatch || emailMatch || phoneMatch;
    });

    // Sort newest first
    customerOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    res.json({
        success: true,
        orders: customerOrders
    });
});

// ==========================================
// PRODUCT ENDPOINTS (CRUD & STOCK)
// ==========================================

// GET all products
app.get("/api/products", (req, res) => {
    const products = getSavedProducts();
    res.json({
        success: true,
        products: products
    });
});

// POST add new product
app.post("/api/products", (req, res) => {
    const { name, price, description, image, imageBase64, imageName, badge, rating } = req.body;

    if (!name || !price) {
        return res.status(400).json({
            success: false,
            message: "Product name and price are required."
        });
    }

    const products = getSavedProducts();

    // Generate safe slug id (e.g. "Tulip Flower" -> "tulip-flower")
    let baseId = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!baseId) baseId = "product-" + Date.now();
    let id = baseId;
    let counter = 1;
    while (products.some(p => p.id === id)) {
        id = `${baseId}-${counter++}`;
    }

    let finalImagePath = image || "images/hero/hero.jpg";

    // If an image was uploaded from the computer (Base64)
    if (imageBase64) {
        try {
            let ext = ".jpg";
            if (imageName && imageName.includes(".")) {
                ext = path.extname(imageName).toLowerCase() || ".jpg";
            } else if (imageBase64.startsWith("data:image/png")) {
                ext = ".png";
            } else if (imageBase64.startsWith("data:image/webp")) {
                ext = ".webp";
            }

            const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
            const imageBuffer = Buffer.from(cleanBase64, "base64");

            const savedFileName = `${id}${ext}`;
            const targetDir = path.join(__dirname, "..", "images", "products");

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const targetFilePath = path.join(targetDir, savedFileName);
            fs.writeFileSync(targetFilePath, imageBuffer);

            finalImagePath = `images/products/${savedFileName}`;
            console.log(`Saved uploaded product image to: ${finalImagePath}`);
        } catch (uploadErr) {
            console.error("Error saving uploaded image:", uploadErr);
        }
    }

    const newProduct = {
        id: id,
        name: name.trim(),
        price: Number(price),
        description: description ? description.trim() : "",
        image: finalImagePath,
        images: [finalImagePath],
        badge: badge ? badge.trim() : "",
        rating: rating || "4.9",
        inStock: true
    };

    products.push(newProduct);
    saveProducts(products);

    console.log(`New product added: ${newProduct.name} (${newProduct.id})`);

    res.json({
        success: true,
        message: "Product added successfully! 🧶",
        product: newProduct
    });
});

// PUT edit product
app.put("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const { name, price, description, image, badge, inStock } = req.body;

    const products = getSavedProducts();
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Product not found."
        });
    }

    if (name) products[productIndex].name = name.trim();
    if (price !== undefined) products[productIndex].price = Number(price);
    if (description !== undefined) products[productIndex].description = description.trim();
    if (image) products[productIndex].image = image.trim();
    if (badge !== undefined) products[productIndex].badge = badge.trim();
    if (inStock !== undefined) products[productIndex].inStock = Boolean(inStock);

    saveProducts(products);

    console.log(`Product updated: ${id}`);

    res.json({
        success: true,
        message: "Product updated successfully!",
        product: products[productIndex]
    });
});

// PATCH toggle product availability (Available vs Not Available)
app.patch("/api/products/:id/stock", (req, res) => {
    const { id } = req.params;
    const { inStock } = req.body;

    const products = getSavedProducts();
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Product not found."
        });
    }

    products[productIndex].inStock = inStock !== undefined ? Boolean(inStock) : !products[productIndex].inStock;
    saveProducts(products);

    console.log(`Product ${id} inStock set to: ${products[productIndex].inStock}`);

    res.json({
        success: true,
        message: `Product is now ${products[productIndex].inStock ? "Available" : "Not Available"}`,
        product: products[productIndex]
    });
});

// DELETE remove product
app.delete("/api/products/:id", (req, res) => {
    const { id } = req.params;
    let products = getSavedProducts();
    const initialLength = products.length;

    products = products.filter(p => p.id !== id);

    if (products.length === initialLength) {
        return res.status(404).json({
            success: false,
            message: "Product not found."
        });
    }

    saveProducts(products);
    console.log(`Product deleted: ${id}`);

    res.json({
        success: true,
        message: `Product ${id} removed successfully.`
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Tangled backend running at http://localhost:${PORT}`);
});