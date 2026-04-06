document.addEventListener("DOMContentLoaded", function initRegister() {
    const app = window.LibraryApp;
    app.routeIfSignedIn();

    const form = document.getElementById("registerForm");
    form.addEventListener("submit", async function onSubmit(event) {
        event.preventDefault();

        try {
            await app.request("/auth/register", {
                method: "POST",
                auth: false,
                body: JSON.stringify({
                    full_name: document.getElementById("fullName").value.trim(),
                    username: document.getElementById("username").value.trim(),
                    email: document.getElementById("email").value.trim(),
                    role_name: document.getElementById("role").value,
                    password: document.getElementById("password").value
                })
            });

            app.showToast("Đăng ký thành công", "success");
            setTimeout(function redirectAfterRegister() {
                window.location.href = "/login.html?registered=1";
            }, 500);
        } catch (error) {
            app.showToast(error.message || "Đăng ký thất bại", "error");
        }
    });
});
