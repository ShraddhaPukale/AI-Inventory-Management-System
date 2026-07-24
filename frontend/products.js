let editId = null;
let allProducts = [];

const API_URL = "http://127.0.0.1:8000/products";
const token = localStorage.getItem("token");
let currentPage = 1;
const rowsPerPage = 5;

// Token Check
if (!token) {
    window.location.href = "index.html";
}

// ==========================
// Update Product
// ==========================

async function updateProduct() {

    const product = {

        product_name: document.getElementById("product_name").value,
        quantity: parseInt(document.getElementById("quantity").value),
        price: parseFloat(document.getElementById("price").value)

    };

    const response = await fetch(API_URL + "/" + editId, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },

        body: JSON.stringify(product)

    });

    const data = await response.json();

    if (response.ok) {

        alert("✅ Product Updated Successfully!");

        editId = null;

        document.getElementById("product_name").value = "";
        document.getElementById("quantity").value = "";
        document.getElementById("price").value = "";

        document.getElementById("updateBtn").style.display = "none";

        loadProducts();

    } else {

        alert(data.detail);

    }

}

// ==========================
// Load Products
// ==========================

async function loadProducts() {

    const response = await fetch(API_URL + "/", {

        headers: {
            "Authorization": "Bearer " + token
        }

    });

    if (response.status === 401) {

        alert("Please Login Again!");

        localStorage.clear();

        window.location.href = "index.html";

        return;

    }

    const products = await response.json();

    allProducts = products;

    const table = document.querySelector("#productTable tbody");

    table.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    products.slice(start, end).forEach(product => {
        table.innerHTML += `
        <tr>
            <td>${product.id}</td>

            <td>${product.product_name}</td>

            <td style="
                color:${product.quantity <= 5 ? 'red' : 'green'};
                font-weight:bold;
            ">
                ${product.quantity}
            </td>

            <td>₹${product.price}</td>

            <td>

                <button onclick="editProduct(${product.id})">
                    ✏ Edit
                </button>

                <button onclick="deleteProduct(${product.id})">
                    🗑 Delete
                </button>

            </td>

        </tr>
        `;

    });
    document.getElementById("pageNumber").innerText =
    `Page ${currentPage}`;

}
// ==========================
// Add Product
// ==========================

async function addProduct() {

    const product = {

        product_name: document.getElementById("product_name").value,
        quantity: parseInt(document.getElementById("quantity").value),
        price: parseFloat(document.getElementById("price").value)

    };

    const response = await fetch(API_URL + "/", {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },

        body: JSON.stringify(product)

    });

    const data = await response.json();

    if (response.ok) {

        alert("✅ Product Added Successfully!");

        document.getElementById("product_name").value = "";
        document.getElementById("quantity").value = "";
        document.getElementById("price").value = "";

        loadProducts();

    } else {

        alert(data.detail);

    }

}

// ==========================
// Delete Product
// ==========================

async function deleteProduct(id) {

    if (!confirm("⚠️ Are you sure you want to delete this product?")) {
        return;
    }

    const response = await fetch(API_URL + "/" + id, {

        method: "DELETE",

        headers: {
            "Authorization": "Bearer " + token
        }

    });

    if (response.ok) {

        alert("🗑️ Product Deleted Successfully!");

        loadProducts();

    } else {

        const data = await response.json();

        alert(data.detail);

    }

}

// ==========================
// Edit Product
// ==========================

async function editProduct(id) {

    editId = id;

    const product = allProducts.find(p => p.id === id);

    document.getElementById("product_name").value = product.product_name;
    document.getElementById("quantity").value = product.quantity;
    document.getElementById("price").value = product.price;

    document.getElementById("updateBtn").style.display = "inline-block";

}

// ==========================
// Search Products
// ==========================

function searchProducts() {

    const input = document.getElementById("search").value.toLowerCase();

    const rows = document.querySelectorAll("#productTable tbody tr");

    rows.forEach(row => {

        const productName = row.cells[1].innerText.toLowerCase();

        row.style.display = productName.includes(input) ? "" : "none";

    });

}

// ==========================
// Sort Products
// ==========================

function sortProducts() {

    const option = document.getElementById("sortOption").value;

    const tbody = document.querySelector("#productTable tbody");

    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((a, b) => {

        if (option === "name") {
            return a.cells[1].innerText.localeCompare(b.cells[1].innerText);
        }

        if (option === "price") {
            return parseFloat(a.cells[3].innerText.replace("₹", "")) -
                   parseFloat(b.cells[3].innerText.replace("₹", ""));
        }

        if (option === "quantity") {
            return parseInt(a.cells[2].innerText) -
                   parseInt(b.cells[2].innerText);
        }

        return 0;

    });

    tbody.innerHTML = "";

    rows.forEach(row => tbody.appendChild(row));

}

// ==========================
// Filter Products
// ==========================

function filterProducts() {

    const option = document.getElementById("filterStock").value;

    const rows = document.querySelectorAll("#productTable tbody tr");

    rows.forEach(row => {

        const quantity = parseInt(row.cells[2].innerText);

        if (option === "all") {

            row.style.display = "";

        }

        else if (option === "healthy") {

            row.style.display = quantity > 5 ? "" : "none";

        }

        else if (option === "low") {

            row.style.display =
                (quantity > 0 && quantity <= 5) ? "" : "none";

        }

        else if (option === "out") {

            row.style.display = quantity === 0 ? "" : "none";

        }

    });

}

// ==========================
// Export CSV
// ==========================

function exportCSV() {

    let csv = "ID,Product Name,Quantity,Price\n";

    allProducts.forEach(product => {

        csv += `${product.id},${product.product_name},${product.quantity},${product.price}\n`;

    });

    const blob = new Blob([csv], { type: "text/csv" });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "products.csv";

    a.click();

    window.URL.revokeObjectURL(url);

}

// ==========================
// Logout
// ==========================

function logout() {

    localStorage.clear();

    window.location.href = "index.html";

}

// Initial Load

loadProducts();

function nextPage() {
    currentPage++;
    loadProducts();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadProducts();
    }
}