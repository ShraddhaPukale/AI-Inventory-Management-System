const API_URL = "http://127.0.0.1:8000/products/sales";
const PRODUCT_API = "http://127.0.0.1:8000/products/";

const token = localStorage.getItem("token");

// Token Check
if (!token) {
    window.location.href = "index.html";
}

// ==========================
// Load Products
// ==========================

async function loadProducts() {

    const response = await fetch(PRODUCT_API, {

        headers: {
            "Authorization": "Bearer " + token
        }

    });

    const products = await response.json();

    const select = document.getElementById("productSelect");

    select.innerHTML = "";

    products.forEach(product => {

        select.innerHTML += `
            <option value="${product.id}">
                ${product.product_name}
            </option>
        `;

    });

}

// ==========================
// Add Sale
// ==========================

async function addSale() {

    const product_id = document.getElementById("productSelect").value;
    const quantity_sold = document.getElementById("quantity").value;

    if (quantity_sold === "" || Number(quantity_sold) <= 0) {
        alert("Enter a valid quantity.");
        return;
    }

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },

        body: JSON.stringify({
            product_id: Number(product_id),
            quantity_sold: Number(quantity_sold),
            sale_date:new Date().toISOString().split("T")[0]
        })

    });

    if (response.ok) {

        alert("Sale Added Successfully!");

        document.getElementById("quantity").value = "";

        loadSales();

    } else {

        const error = await response.json();
        console.log(error);
        alert(JSON.stringify(error));

    }

}

// ==========================
// Load Sales
// ==========================

async function loadSales() {

    const response = await fetch(API_URL, {

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

    const sales = await response.json();

    const table = document.querySelector("#salesTable tbody");

    table.innerHTML = "";

    sales.forEach(sale => {

        table.innerHTML += `
        <tr>
            <td>${sale.sale_id}</td>
            <td>${sale.product_id}</td>
            <td>${sale.quantity_sold}</td>
            <td>${sale.sale_date}</td>
        </tr>
        `;

    });

}

// ==========================
// Initial Load
// ==========================

loadProducts();
loadSales();