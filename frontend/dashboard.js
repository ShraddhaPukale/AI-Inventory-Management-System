const PRODUCT_API = "http://127.0.0.1:8000/products/";
const SALES_API = "http://127.0.0.1:8000/products/sales";
const PREDICTION_API = "http://127.0.0.1:8000/products/prediction";

const token = localStorage.getItem("token");
console.log("Token=",token);

if (!token) {
    window.location.href = "index.html";
}

async function loadDashboard() {

    const headers = {
        "Authorization": "Bearer " + token
    };

    try {

        // Products
        const productResponse = await fetch(PRODUCT_API, { headers });
        const products = await productResponse.json();

        console.log(products);
        console.log("Products=",products);

        document.getElementById("products").innerText =
            Array.isArray(products) ? products.length : 0;

        // Sales
        const salesResponse = await fetch(SALES_API, { headers });
        const sales = await salesResponse.json();
        console.log("Sales Data =", sales);
        console.log("Is Array?", Array.isArray(sales));
        console.log(sales);

        console.log(sales);

        document.getElementById("sales").innerText =
            Array.isArray(sales) ? sales.length : 0;

        // Prediction
        const predictionResponse = await fetch(PREDICTION_API, { headers });
        const prediction = await predictionResponse.json();

        document.getElementById("totalProducts").innerText = prediction.total_products;
        document.getElementById("lowStock").innerText = prediction.low_stock_count;
        document.getElementById("outOfStock").innerText = prediction.out_of_stock_count;

        const healthy =
            prediction.total_products -
            prediction.low_stock_count -
            prediction.out_of_stock_count;

        document.getElementById("healthyProducts").innerText = healthy;

        const stockAlert = document.getElementById("stockAlert");

        if (prediction.out_of_stock_count > 0) {
            stockAlert.innerHTML =
                "🔴 Warning! " + prediction.out_of_stock_count + " product(s) are Out of Stock.";
            stockAlert.style.background = "#f8d7da";
            stockAlert.style.color = "#721c24";
        }
        else if (prediction.low_stock_count > 0) {
            stockAlert.innerHTML =
                "🟡 Alert! " + prediction.low_stock_count + " product(s) are Low Stock.";
            stockAlert.style.background = "#fff3cd";
            stockAlert.style.color = "#856404";
        }
        else {
            stockAlert.innerHTML =
                "🟢 All Products are in Stock.";
            stockAlert.style.background = "#d4edda";
            stockAlert.style.color = "#155724";
        }

        // ==========================
    // Recent Sales Activity
    // ==========================

    const recentSales = document.getElementById("recentSales");
    recentSales.innerHTML = "";

    sales.slice().reverse().slice(0, 5).forEach((sale) => {

        const product = products.find(p => p.id === sale.product_id);

        recentSales.innerHTML += `
            <tr>
                <td>${product ? product.product_name : "Unknown Product"}</td>
                <td>${sale.quantity_sold}</td>
                <td>${sale.sale_date}</td>
            </tr>
        `;

    });

        // Chart
        // Top Selling Products

        const topProducts = document.getElementById("topProducts");
topProducts.innerHTML = "";

// Product wise total sales
const productSales = {};

sales.forEach((sale) => {

    if (!productSales[sale.product_id]) {
        productSales[sale.product_id] = 0;
    }

    productSales[sale.product_id] += sale.quantity_sold;

});

// Sort by total sold
const sortedProducts = Object.entries(productSales)
.sort((a, b) => b[1] - a[1]);

sortedProducts.forEach(([productId, totalSold], index) => {

    const product = products.find(p => p.id == productId);

    topProducts.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${product ? product.product_name : "Unknown Product"}</td>
            <td>${totalSold}</td>
        </tr>
    `;

});
        // ==========================
// Monthly Sales Trend
// ==========================

const monthLabels = [];
const monthSales = [];

sales.forEach((sale) => {
    monthLabels.push(sale.sale_date);
    monthSales.push(sale.quantity_sold);
});

const monthlyCtx = document.getElementById("monthlySalesChart");

if (window.monthlySalesChart instanceof Chart) {
    window.monthlySalesChart.destroy();
}

window.monthlySalesChart = new Chart(monthlyCtx, {
    type: "line",
    data: {
        labels: monthLabels,
        datasets: [{
            label: "Sales Trend",
            data: monthSales,
            fill: false,
            tension: 0.3,
            borderWidth: 3
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

        const labels = [];
        const quantities = [];

        sales.forEach((sale) => {
            labels.push("Sale " + sale.sale_id);
            quantities.push(sale.quantity_sold);
        });

        const ctx = document.getElementById("salesChart");

        if (window.salesChart instanceof Chart) {
            window.salesChart.destroy();
        }

        window.salesChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Quantity Sold",
                    data: quantities,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    // ==========================
// Stock Distribution Chart
// ==========================

const stockCtx = document.getElementById("stockChart");

if (window.stockChart instanceof Chart) {
    window.stockChart.destroy();
}

window.stockChart = new Chart(stockCtx, {

    type: "pie",

    data: {

        labels: [
            "Healthy",
            "Low Stock",
            "Out Of Stock"
        ],

        datasets: [{

            data: [
                healthy,
                prediction.low_stock_count,
                prediction.out_of_stock_count
            ],

            backgroundColor: [
                "#28a745",
                "#ffc107",
                "#dc3545"
            ]

        }]

    },

    options: {

        responsive: true,

        plugins: {

            legend: {

                position: "bottom"

            }

        }

    }

});

    } catch (err) {
        console.log(err);
        alert("Dashboard Load Error");
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

loadDate();
loadDashboard();

function loadDate() {

    const today = new Date();

    document.getElementById("currentDate").innerText =
        today.toDateString();

}


