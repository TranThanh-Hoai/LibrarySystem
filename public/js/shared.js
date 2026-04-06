(function bootstrapLibraryApp() {
    const STORAGE_TOKEN = "token";
    const STORAGE_USER = "user";
    const API_BASE = "/api";

    function safeParse(value) {
        try {
            return JSON.parse(value);
        } catch (error) {
            return null;
        }
    }

    function getSession() {
        const token = localStorage.getItem(STORAGE_TOKEN) || "";
        const user = safeParse(localStorage.getItem(STORAGE_USER) || "null");
        return { token, user };
    }

    function setSession(token, user) {
        localStorage.setItem(STORAGE_TOKEN, token || "");
        localStorage.setItem(STORAGE_USER, JSON.stringify(user || null));
    }

    function clearSession() {
        localStorage.removeItem(STORAGE_TOKEN);
        localStorage.removeItem(STORAGE_USER);
    }

    function getData(payload) {
        if (payload && typeof payload === "object" && "data" in payload) {
            return payload.data;
        }
        return payload;
    }

    function normalizeError(payload, fallback) {
        if (!payload) return fallback;
        if (typeof payload === "string") return payload;
        return payload.message || payload.error || fallback;
    }

    async function request(endpoint, options) {
        const config = options || {};
        const method = config.method || "GET";
        const headers = Object.assign({}, config.headers || {});
        const body = config.body;
        const auth = config.auth !== false;
        const session = getSession();

        if (!(body instanceof FormData) && body && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }

        if (auth && session.token) {
            headers.Authorization = "Bearer " + session.token;
        }

        const response = await fetch(API_BASE + endpoint, {
            method,
            headers,
            body
        });

        const contentType = response.headers.get("content-type") || "";
        const payload = contentType.includes("application/json")
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearSession();
            }
            throw new Error(normalizeError(payload, "Yêu cầu thất bại"));
        }

        return payload;
    }

    function requireAuth(requiredRole) {
        const session = getSession();
        if (!session.token || !session.user) {
            window.location.replace("/login.html");
            return null;
        }

        if (requiredRole && session.user.role !== requiredRole) {
            const target = session.user.role === "admin" ? "/admin.html" : "/user.html";
            window.location.replace(target);
            return null;
        }

        return session;
    }

    function routeIfSignedIn() {
        const session = getSession();
        if (!session.token || !session.user) return;
        const target = session.user.role === "admin" ? "/admin.html" : "/user.html";
        window.location.replace(target);
    }

    function logout() {
        clearSession();
        window.location.href = "/login.html";
    }

    function createToastRoot() {
        let toast = document.getElementById("toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toast";
            toast.className = "toast hidden";
            document.body.appendChild(toast);
        }
        return toast;
    }

    function showToast(message, type) {
        const toast = createToastRoot();
        toast.textContent = message;
        toast.className = "toast " + (type || "success");
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(function hideToast() {
            toast.classList.add("hidden");
        }, 2500);
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function toVNDate(value) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleDateString("vi-VN");
    }

    function toVNDateTime(value) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return date.toLocaleString("vi-VN");
    }

    function attachLogout(buttonId) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        button.addEventListener("click", function onLogout() {
            logout();
        });
    }

    function connectSocket(onNotification, onStatus, onEvent) {
        const session = getSession();
        if (!session.token || typeof io === "undefined") {
            if (typeof onStatus === "function") onStatus("offline");
            return null;
        }

        if (typeof onStatus === "function") onStatus("connecting");

        const socket = io({
            auth: { token: session.token }
        });

        socket.on("connect", function onConnect() {
            if (typeof onStatus === "function") onStatus("online");
            if (typeof onEvent === "function") onEvent("Kết nối thành công", "Socket ID: " + socket.id);
        });

        socket.on("disconnect", function onDisconnect(reason) {
            if (typeof onStatus === "function") onStatus("offline");
            if (typeof onEvent === "function") onEvent("Đã ngắt kết nối", reason || "Không rõ lý do");
        });

        socket.on("connect_error", function onError(error) {
            if (typeof onStatus === "function") onStatus("offline");
            if (typeof onEvent === "function") onEvent("Kết nối thất bại", error && error.message ? error.message : "Không rõ lỗi");
        });

        socket.on("notification", function onSocketNotification(notification) {
            if (typeof onNotification === "function") onNotification(notification);
            if (typeof onEvent === "function") onEvent("Thông báo mới", notification && notification.message ? notification.message : "Có thông báo mới");
        });

        return socket;
    }

    window.LibraryApp = {
        getSession,
        setSession,
        clearSession,
        request,
        getData,
        requireAuth,
        routeIfSignedIn,
        logout,
        showToast,
        escapeHtml,
        toVNDate,
        toVNDateTime,
        attachLogout,
        connectSocket
    };
})();
