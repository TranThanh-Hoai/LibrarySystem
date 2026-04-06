document.addEventListener("DOMContentLoaded", function initLogin() {
    const app = window.LibraryApp;
    app.routeIfSignedIn();

    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "1") {
        app.showToast("Đăng ký thành công, mời bạn đăng nhập", "success");
    }

    const form = document.getElementById("loginForm");
    form.addEventListener("submit", async function onSubmit(event) {
        event.preventDefault();

        try {
            const payload = await app.request("/auth/login", {
                method: "POST",
                auth: false,
                body: JSON.stringify({
                    username: document.getElementById("username").value.trim(),
                    password: document.getElementById("password").value
                })
            });

            app.setSession(payload.token, payload.user);
            app.showToast("Đăng nhập thành công", "success");

            const target = payload.user.role === "admin" ? "/admin.html" : "/user.html";
            window.location.href = target;
        } catch (error) {
            app.showToast(error.message || "Đăng nhập thất bại", "error");
        }
    });
});
