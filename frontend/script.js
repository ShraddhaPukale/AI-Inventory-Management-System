const API_URL = "http://127.0.0.1:8000/products";

let allProducts = [];

// ================= DASHBOARD =================

function updateDashboard() {
    document.getElementById("totalProducts").innerText = allProducts.length;

    let inventoryValue = 0;

    allProducts.forEach(product => {
        inventoryValue += product.quantity * product.price;
    });

    document.getElementById("inventoryValue").innerText =
        "₹" + inventoryValue.toLocaleString();
}

// ================= DROPDOWN =================

function populateProductDropdown(products) {

    const dropdown = document.getElementById("product_id");

    dropdown.innerHTML =
        '<option value="">Select Product</option>';

    products.forEach(product => {

        dropdown.innerHTML += `

        <option value="${product.id}">
            ${product.product_name}
        </option>

        `;

    });

}

// ================= LOAD PRODUCTS =================

async function loadProducts() {

    const response =
        await fetch(API_URL + "/");

    allProducts =
        await response.json();

    const table =
        document.getElementById("productTable");

    table.innerHTML = "";

    populateProductDropdown(allProducts);

    updateDashboard();

    allProducts.forEach(product => {

        table.innerHTML += `

        <tr>

            <td>${product.id}</td>

            <td>${product.product_name}</td>

            <td>${product.quantity}</td>

            <td>₹${product.price}</td>

            <td>₹${product.price}</td>

            <td>

                <button onclick="editProduct(
                    ${product.id},
                    '${product.product_name}',
                    ${product.quantity},
                    ${product.price}
                )">
                    Edit
                </button>

                <button onclick="deleteProduct(${product.id})">
                    Delete
                </button>

            </td>

        </tr>

        `;

    });

}

// ================= SEARCH =================

function searchProducts() {

    const keyword =
        document
        .getElementById("searchProduct")
        .value
        .toLowerCase();

    const table =
        document.getElementById("productTable");

    table.innerHTML = "";

    allProducts
    .filter(product =>
        product.product_name
        .toLowerCase()
        .includes(keyword)
    )

    .forEach(product => {

        table.innerHTML += `

        <tr>

            <td>${product.id}</td>

            <td>${product.product_name}</td>

            <td>${product.quantity}</td>

            <td>₹${product.price}</td>

        </tr>

        `;

    });

}

// ================= ADD PRODUCT =================

async function addProduct() {

    const product = {

        product_name:
        document.getElementById("product_name").value,

        quantity:
        parseInt(
            document.getElementById("quantity").value
        ),

        price:
        parseFloat(
            document.getElementById("price").value
        )

    };

    const response =
        await fetch(API_URL + "/", {

        method: "POST",

        headers: {
            "Content-Type":
            "application/json"
        },

        body:
        JSON.stringify(product)

    });

    if(response.ok){

        alert("Product Added Successfully!");

        document.getElementById("product_name").value="";
        document.getElementById("quantity").value="";
        document.getElementById("price").value="";

        loadProducts();

    }

}
// ================= LOAD SALES =================

let totalSalesCount = 0;

async function loadSales() {

    try {

        const response = await fetch(API_URL + "/sales");

        if (!response.ok) {
            throw new Error("Failed to load sales");
        }

        const sales = await response.json();

        totalSalesCount = sales.length;

        document.getElementById("totalSales").innerText = totalSalesCount;

        const table = document.getElementById("salesTable");

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

    catch(error){

        console.error(error);

        alert("Unable to load sales.");

    }

}

// ================= ADD SALE =================

async function addSale(){

    const productId =
        document.getElementById("product_id").value;

    const quantitySold =
        document.getElementById("quantity_sold").value;

    const saleDate =
        document.getElementById("sale_date").value;

    if(productId==="" || quantitySold==="" || saleDate===""){

        alert("Please fill all fields.");

        return;

    }

    const sale = {

        product_id: parseInt(productId),

        quantity_sold: parseInt(quantitySold),

        sale_date: saleDate

    };

    try{

        const response =
        await fetch(API_URL + "/sales",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(sale)

        });

        if(!response.ok){

            throw new Error("Sale failed");

        }

        alert("Sale Added Successfully!");

        document.getElementById("product_id").value="";

        document.getElementById("quantity_sold").value="";

        document.getElementById("sale_date").value="";

        await loadSales();

        await loadProducts();

    }

    catch(error){

        console.error(error);

        alert("Unable to add sale.");

    }

}


// ================= EDIT PRODUCT =================

async function editProduct(id, name, quantity, price) {

    const newName = prompt("Enter Product Name", name);

    if (newName === null) return;

    const newQuantity = prompt("Enter Quantity", quantity);

    if (newQuantity === null) return;

    const newPrice = prompt("Enter Price", price);

    if (newPrice === null) return;

    const updatedProduct = {

        product_name: newName,

        quantity: parseInt(newQuantity),

        price: parseFloat(newPrice)

    };

    const response = await fetch(API_URL + "/" + id, {

        method: "PUT",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(updatedProduct)

    });

    if (response.ok) {

        alert("Product Updated Successfully!");

        await loadProducts();

    } else {

        alert("Failed to update product.");

    }

}


// ================= DELETE PRODUCT =================

async function deleteProduct(productId) {

    const confirmDelete = confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) {
        return;
    }

    const response = await fetch(API_URL + "/" + productId, {
        method: "DELETE"
    });

    if (response.ok) {

        alert("Product Deleted Successfully!");

        await loadProducts();

    } else {

        alert("Failed to delete product.");

    }

}

// ================= PAGE LOAD =================

window.onload = async function(){

    await loadProducts();

    await loadSales();

};