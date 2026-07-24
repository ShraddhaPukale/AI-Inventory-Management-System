async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {

        const response = await fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem("token", data.access_token);

            window.location.href="dashboard.html";

        } else {

            document.getElementById("message").innerText =
                data.detail;

        }

    } catch (error) {

        document.getElementById("message").innerText =
            "Server not running.";

    }

}