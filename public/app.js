const state = {
    token: localStorage.getItem("token") || "",
    user: JSON.parse(localStorage.getItem("user") || "null"),
    books: [],
    categories: [],
    authors: [],
    publishers: [],
    loans: [],
    notifications: [],
    search: "",
    categoryId: "",
    socket: null,
    socketStatus: "offline",
    socketEvents: []
};

const elements = {
    sessionInfo: document.getElementById("sessionInfo"),
    logoutBtn: document.getElementById("logoutBtn"),
    loginForm: document.getElementById("loginForm"),
    registerForm: document.getElementById("registerForm"),
    borrowForm: document.getElementById("borrowForm"),
    returnForm: document.getElementById("returnForm"),
    bookForm: document.getElementById("bookForm"),
    adminPanel: document.getElementById("adminPanel"),
    deleteBookBtn: document.getElementById("deleteBookBtn"),
    uploadCoverBtn: document.getElementById("uploadCoverBtn"),
    resetBookFormBtn: document.getElementById("resetBookFormBtn"),
    refreshBooksBtn: document.getElementById("refreshBooksBtn"),
    refreshLoansBtn: document.getElementById("refreshLoansBtn"),
    refreshNotificationsBtn: document.getElementById("refreshNotificationsBtn"),
    searchInput: document.getElementById("searchInput"),
    categoryFilter: document.getElementById("categoryFilter"),
    booksTableBody: document.getElementById("booksTableBody"),
    bookSummary: document.getElementById("bookSummary"),
    loanSummary: document.getElementById("loanSummary"),
    notificationSummary: document.getElementById("notificationSummary"),
    loansList: document.getElementById("loansList"),
    notificationsList: document.getElementById("notificationsList"),
    socketEventLog: document.getElementById("socketEventLog"),
    socketStatusDot: document.getElementById("socketStatusDot"),
    socketStatusText: document.getElementById("socketStatusText"),
    realtimeStatePill: document.getElementById("realtimeStatePill"),
    notificationBadge: document.getElementById("notificationBadge"),
    bookCountMetric: document.getElementById("bookCountMetric"),
    loanCountMetric: document.getElementById("loanCountMetric"),
    socketMetric: document.getElementById("socketMetric"),
    socketMetricNote: document.getElementById("socketMetricNote"),
    toast: document.getElementById("toast"),
    borrowBookId: document.getElementById("borrowBookId"),
    borrowDueDate: document.getElementById("borrowDueDate"),
    returnLoanId: document.getElementById("returnLoanId"),
    returnBookId: document.getElementById("returnBookId"),
    bookId: document.getElementById("bookId"),
    bookTitle: document.getElementById("bookTitle"),
    bookIsbn: document.getElementById("bookIsbn"),
    bookAuthor: document.getElementById("bookAuthor"),
    bookCategory: document.getElementById("bookCategory"),
    bookPublisher: document.getElementById("bookPublisher"),
    bookYear: document.getElementById("bookYear"),
    bookQuantity: document.getElementById("bookQuantity"),
    bookAvailableCopies: document.getElementById("bookAvailableCopies"),
    bookCoverFile: document.getElementById("bookCoverFile"),
    coverUploadInfo: document.getElementById("coverUploadInfo")
};

const api = {
    baseUrl: "/api",

    async request(endpoint, options = {}) {
        const headers = {
            ...(options.headers || {})
        };

        const isFormData = options.body instanceof FormData;
        if (!isFormData && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }

        if (state.token) {
            headers.Authorization = `Bearer ${state.token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers
        });

        const contentType = response.headers.get("content-type") || "";
        const payload = contentType.includes("application/json")
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            const message =
                payload?.message ||
                payload?.error ||
                (typeof payload === "string" ? payload : "Yêu cầu thất bại");
            throw new Error(message);
        }

        return payload;
    }
};

function getData(payload) {
    return payload && typeof payload === "object" && "data" in payload ? payload.data : payload;
}

function getBooks(payload) {
    const data = getData(payload);
    return Array.isArray(data?.books) ? data.books : Array.isArray(data) ? data : [];
}

function getUnreadNotificationCount() {
    return state.notifications.filter((notification) => !notification.is_read).length;
}

function showToast(message, type = "success") {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type}`;
    elements.toast.classList.remove("hidden");

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
        elements.toast.classList.add("hidden");
    }, 3000);
}

function persistSession() {
    if (state.token && state.user) {
        localStorage.setItem("token", state.token);
        localStorage.setItem("user", JSON.stringify(state.user));
        return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

function renderSelectOptions(selectElement, items, placeholder) {
    selectElement.innerHTML = [`<option value="">${placeholder}</option>`]
        .concat(items.map((item) => `<option value="${item._id}">${item.name}</option>`))
        .join("");
}

function renderCategoryFilter() {
    renderSelectOptions(elements.categoryFilter, state.categories, "Tất cả");
    if (state.categoryId) {
        elements.categoryFilter.value = state.categoryId;
    }
}

function renderBookFormOptions() {
    renderSelectOptions(elements.bookAuthor, state.authors, "Chọn tác giả");
    renderSelectOptions(elements.bookCategory, state.categories, "Chọn thể loại");
    renderSelectOptions(elements.bookPublisher, state.publishers, "Chọn nhà xuất bản");
}

function addSocketEvent(title, detail = "") {
    state.socketEvents.unshift({
        title,
        detail,
        createdAt: new Date().toISOString()
    });

    state.socketEvents = state.socketEvents.slice(0, 12);
    renderSocketEvents();
}

function renderSocketEvents() {
    if (!state.socketEvents.length) {
        elements.socketEventLog.innerHTML = `<div class="empty-state">Chưa có sự kiện kết nối.</div>`;
        return;
    }

    elements.socketEventLog.innerHTML = state.socketEvents.map((event) => `
        <article class="event-item">
            <strong>${event.title}</strong>
            <span>${event.detail || "Không có chi tiết bổ sung."}</span>
            <span class="event-time">${new Date(event.createdAt).toLocaleString("vi-VN")}</span>
        </article>
    `).join("");
}

function renderSocketStatus() {
    const variants = {
        offline: {
            dot: "offline",
            text: "WebSocket: chưa kết nối",
            pillClass: "state-offline",
            pillText: "Offline",
            metric: "Offline",
            note: "Đang chờ đăng nhập để mở kênh WebSocket."
        },
        connecting: {
            dot: "connecting",
            text: "WebSocket: đang kết nối",
            pillClass: "state-connecting",
            pillText: "Đang kết nối",
            metric: "Connecting",
            note: "Đang tạo kết nối realtime với server."
        },
        online: {
            dot: "online",
            text: "WebSocket: đã kết nối",
            pillClass: "state-online",
            pillText: "Online",
            metric: "Online",
            note: "Thông báo sẽ xuất hiện ngay khi server gửi xuống."
        }
    };

    const current = variants[state.socketStatus] || variants.offline;
    elements.socketStatusDot.className = `status-dot ${current.dot}`;
    elements.socketStatusText.textContent = current.text;
    elements.realtimeStatePill.className = `state-pill ${current.pillClass}`;
    elements.realtimeStatePill.textContent = current.pillText;
    elements.socketMetric.textContent = current.metric;
    elements.socketMetricNote.textContent = current.note;
}

function bookMatchesFilter(book) {
    const search = state.search.trim().toLowerCase();
    const matchesSearch =
        !search ||
        [
            book.title,
            book.isbn,
            book.author_id?.name,
            book.category_id?.name,
            book.publisher_id?.name
        ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search));

    const matchesCategory = !state.categoryId || book.category_id?._id === state.categoryId;
    return matchesSearch && matchesCategory;
}

function renderOverview() {
    elements.bookCountMetric.textContent = String(state.books.filter(bookMatchesFilter).length);
    elements.loanCountMetric.textContent = String(state.loans.length);
    elements.notificationBadge.textContent = `${getUnreadNotificationCount()} mới`;
}

function clearUserPanels() {
    state.loans = [];
    state.notifications = [];
    state.socketEvents = [];
    state.socketStatus = "offline";
    elements.loanSummary.textContent = "Đăng nhập để xem phiếu mượn.";
    elements.notificationSummary.textContent = "Đăng nhập để nhận thông báo realtime.";
    elements.loansList.innerHTML = `<div class="empty-state">Chưa đăng nhập.</div>`;
    elements.notificationsList.innerHTML = `<div class="empty-state">Đăng nhập để nhận thông báo realtime.</div>`;
    renderSocketStatus();
    renderSocketEvents();
    renderOverview();
}

function updateSessionView() {
    if (!state.user) {
        elements.sessionInfo.textContent = "Chưa đăng nhập";
        elements.logoutBtn.classList.add("hidden");
        elements.adminPanel.classList.add("hidden");
        elements.deleteBookBtn.classList.add("hidden");
        elements.uploadCoverBtn.classList.add("hidden");
        elements.coverUploadInfo.textContent = "";
        clearUserPanels();
        return;
    }

    const role = state.user.role || "user";
    const name = state.user.full_name || state.user.username || state.user.email;
    elements.sessionInfo.textContent = `${name} (${role})`;
    elements.logoutBtn.classList.remove("hidden");

    if (role === "admin") {
        elements.adminPanel.classList.remove("hidden");
    } else {
        elements.adminPanel.classList.add("hidden");
        resetBookForm();
    }

    renderOverview();
}

function renderBooks() {
    const filteredBooks = state.books.filter(bookMatchesFilter);
    elements.bookSummary.textContent = `Tổng ${filteredBooks.length} / ${state.books.length} sách`;
    renderOverview();

    if (!filteredBooks.length) {
        elements.booksTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">Không có sách phù hợp bộ lọc hiện tại.</td>
            </tr>
        `;
        return;
    }

    elements.booksTableBody.innerHTML = filteredBooks.map((book) => {
        const available = Number(book.available_copies || 0);
        const stockClass = available < 3 ? "tag low" : "tag";
        const canAdmin = state.user?.role === "admin";
        const cover = book.cover_url
            ? `<img class="cover-thumb" src="${book.cover_url}" alt="${book.title}">`
            : "";

        return `
            <tr>
                <td>${cover}<div>${book.title || ""}</div></td>
                <td>${book.isbn || ""}</td>
                <td>${book.author_id?.name || ""}</td>
                <td>${book.category_id?.name || ""}</td>
                <td>${book.publisher_id?.name || ""}</td>
                <td><span class="${stockClass}">${available}/${book.quantity || 0}</span></td>
                <td>${book._id}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-secondary" type="button" onclick="window.app.fillBorrowForm('${book._id}')">Mượn</button>
                        ${canAdmin ? `<button class="btn btn-secondary" type="button" onclick="window.app.editBook('${book._id}')">Sửa</button>` : ""}
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function renderLoans() {
    if (!state.user) {
        clearUserPanels();
        return;
    }

    elements.loanSummary.textContent = `${state.loans.length} phiếu mượn`;
    renderOverview();

    if (!state.loans.length) {
        elements.loansList.innerHTML = `<div class="empty-state">Chưa có phiếu mượn nào.</div>`;
        return;
    }

    elements.loansList.innerHTML = state.loans.map((loan) => {
        const userInfo = loan.user_id
            ? `${loan.user_id.full_name || loan.user_id.username || ""} - ${loan.user_id.email || ""}`
            : "";

        const details = (loan.details || []).map((detail) => {
            const title = detail.book_id?.title || detail.book_id || "Không rõ tên sách";
            const returnDate = detail.return_date
                ? new Date(detail.return_date).toLocaleDateString("vi-VN")
                : "Chưa trả";

            return `
                <div class="list-meta">
                    <strong>${title}</strong>
                    <span>Book ID: ${detail.book_id?._id || detail.book_id}</span>
                    <span>Tình trạng: ${detail.condition || "-"}</span>
                    <span>Ngày trả: ${returnDate}</span>
                    <button class="btn btn-secondary" type="button" onclick="window.app.fillReturnForm('${loan._id}', '${detail.book_id?._id || detail.book_id}')">Điền vào form trả</button>
                </div>
            `;
        }).join("");

        return `
            <article class="list-item">
                <h3>Loan ID: ${loan._id}</h3>
                <div class="list-meta">
                    ${state.user?.role === "admin" && userInfo ? `<span>Người mượn: ${userInfo}</span>` : ""}
                    <span>Ngày mượn: ${new Date(loan.loan_date).toLocaleDateString("vi-VN")}</span>
                    <span>Hạn trả: ${new Date(loan.due_date).toLocaleDateString("vi-VN")}</span>
                    <span>Trạng thái: ${loan.status}</span>
                </div>
                <div class="list-block">${details}</div>
            </article>
        `;
    }).join("");
}

function renderNotifications() {
    if (!state.user) {
        clearUserPanels();
        return;
    }

    const unreadCount = getUnreadNotificationCount();
    elements.notificationSummary.textContent = state.notifications.length
        ? `Tổng ${state.notifications.length} thông báo, ${unreadCount} chưa đọc.`
        : "Không có thông báo nào. Kênh realtime vẫn sẵn sàng.";
    renderOverview();

    if (!state.notifications.length) {
        elements.notificationsList.innerHTML = `<div class="empty-state">Chưa có thông báo.</div>`;
        return;
    }

    elements.notificationsList.innerHTML = state.notifications.map((notification) => `
        <article class="list-item ${notification.is_read ? "" : "unread"}">
            <h4>${notification.type || "Thông báo"}</h4>
            <div class="list-meta">
                <span>${notification.message}</span>
                <span>Trạng thái: ${notification.is_read ? "Đã đọc" : "Chưa đọc"}</span>
                ${notification.is_read ? "" : `<button class="btn btn-secondary" type="button" onclick="window.app.markNotificationRead('${notification._id}')">Đánh dấu đã đọc</button>`}
            </div>
        </article>
    `).join("");
}

async function loadReferenceData() {
    const [categoriesPayload, authorsPayload, publishersPayload] = await Promise.all([
        api.request("/categories"),
        api.request("/authors"),
        api.request("/publishers")
    ]);

    state.categories = getData(categoriesPayload) || [];
    state.authors = getData(authorsPayload) || [];
    state.publishers = getData(publishersPayload) || [];

    renderCategoryFilter();
    renderBookFormOptions();
}

async function loadBooks() {
    elements.booksTableBody.innerHTML = `
        <tr>
            <td colspan="8" class="empty-state">Đang tải sách...</td>
        </tr>
    `;

    const payload = await api.request("/books?limit=100");
    state.books = getBooks(payload);
    renderBooks();
}

async function loadLoans() {
    if (!state.user) {
        clearUserPanels();
        return;
    }

    elements.loansList.innerHTML = `<div class="empty-state">Đang tải phiếu mượn...</div>`;
    const payload = await api.request("/loans");
    state.loans = getData(payload) || [];
    renderLoans();
}

async function loadNotifications() {
    if (!state.user) {
        clearUserPanels();
        return;
    }

    elements.notificationsList.innerHTML = `<div class="empty-state">Đang tải thông báo...</div>`;
    const payload = await api.request("/notifications");
    state.notifications = getData(payload) || [];
    renderNotifications();
}

function connectSocket() {
    if (!state.token || typeof io === "undefined") {
        state.socketStatus = "offline";
        renderSocketStatus();
        return;
    }

    if (state.socket) {
        state.socket.disconnect();
    }

    state.socketStatus = "connecting";
    renderSocketStatus();
    addSocketEvent("Bắt đầu kết nối", "Đang tạo kết nối WebSocket bằng token hiện tại.");

    state.socket = io({
        auth: {
            token: state.token
        }
    });

    state.socket.on("connect", () => {
        state.socketStatus = "online";
        renderSocketStatus();
        addSocketEvent("Kết nối thành công", `Socket ID: ${state.socket.id}`);
    });

    state.socket.on("connect_error", (error) => {
        state.socketStatus = "offline";
        renderSocketStatus();
        addSocketEvent("Kết nối thất bại", error.message || "Không xác định được lý do.");
    });

    state.socket.on("disconnect", (reason) => {
        state.socketStatus = "offline";
        renderSocketStatus();
        addSocketEvent("Đã ngắt kết nối", reason || "Không xác định.");
    });

    state.socket.on("notification", (notification) => {
        state.notifications.unshift(notification);
        renderNotifications();
        addSocketEvent("Nhận thông báo mới", notification.message || notification.type || "Thông báo mới");
        showToast(notification.message || "Có thông báo mới");
    });
}

function disconnectSocket() {
    if (state.socket) {
        state.socket.disconnect();
        state.socket = null;
    }

    state.socketStatus = "offline";
    renderSocketStatus();
}

async function refreshAuthenticatedData() {
    if (!state.user) {
        clearUserPanels();
        disconnectSocket();
        return;
    }

    connectSocket();
    await Promise.all([loadLoans(), loadNotifications()]);
}

async function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;
    const payload = await api.request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
    });

    state.token = payload.token;
    state.user = payload.user;
    persistSession();
    updateSessionView();
    await refreshAuthenticatedData();
    showToast("Đăng nhập thành công");
    elements.loginForm.reset();
}

async function handleRegister(event) {
    event.preventDefault();

    const body = {
        full_name: document.getElementById("registerFullName").value.trim(),
        username: document.getElementById("registerUsername").value.trim(),
        email: document.getElementById("registerEmail").value.trim(),
        password: document.getElementById("registerPassword").value,
        role_name: document.getElementById("registerRole").value
    };

    await api.request("/auth/register", {
        method: "POST",
        body: JSON.stringify(body)
    });

    showToast("Tạo tài khoản thành công");
    elements.registerForm.reset();
}

async function handleBorrow(event) {
    event.preventDefault();

    if (!state.token) {
        throw new Error("Cần đăng nhập trước khi mượn sách");
    }

    const bookId = elements.borrowBookId.value.trim();
    const dueDate = elements.borrowDueDate.value;
    const condition = document.getElementById("borrowCondition").value.trim() || "New";

    await api.request("/loans/borrow", {
        method: "POST",
        body: JSON.stringify({
            due_date: dueDate,
            books: [{ book_id: bookId, condition }]
        })
    });

    showToast("Tạo phiếu mượn thành công");
    elements.borrowForm.reset();
    await Promise.all([loadBooks(), loadLoans()]);
}

async function handleReturn(event) {
    event.preventDefault();

    if (!state.token) {
        throw new Error("Cần đăng nhập trước khi trả sách");
    }

    const body = {
        loan_id: elements.returnLoanId.value.trim(),
        book_id: elements.returnBookId.value.trim(),
        condition: document.getElementById("returnCondition").value.trim()
    };

    await api.request("/loans/return-book", {
        method: "POST",
        body: JSON.stringify(body)
    });

    showToast("Trả sách thành công");
    elements.returnForm.reset();
    await Promise.all([loadBooks(), loadLoans(), loadNotifications()]);
}

function resetBookForm() {
    elements.bookForm.reset();
    elements.bookId.value = "";
    elements.deleteBookBtn.classList.add("hidden");
    elements.uploadCoverBtn.classList.add("hidden");
    elements.coverUploadInfo.textContent = "";
}

function getBookPayloadFromForm() {
    return {
        title: elements.bookTitle.value.trim(),
        isbn: elements.bookIsbn.value.trim(),
        author_id: elements.bookAuthor.value,
        category_id: elements.bookCategory.value,
        publisher_id: elements.bookPublisher.value,
        published_year: elements.bookYear.value ? Number(elements.bookYear.value) : undefined,
        quantity: Number(elements.bookQuantity.value),
        available_copies: Number(elements.bookAvailableCopies.value)
    };
}

async function uploadCoverForBook(bookId, file) {
    const formData = new FormData();
    formData.append("cover", file);

    const payload = await api.request(`/books/${bookId}/cover`, {
        method: "POST",
        body: formData
    });

    return getData(payload);
}

async function handleBookSubmit(event) {
    event.preventDefault();

    if (state.user?.role !== "admin") {
        throw new Error("Only admin can manage books");
    }

    const bookId = elements.bookId.value;
    const selectedCover = elements.bookCoverFile.files[0];
    const body = JSON.stringify(getBookPayloadFromForm());
    let savedBookId = bookId;

    if (bookId) {
        const payload = await api.request(`/books/${bookId}`, {
            method: "PUT",
            body
        });
        savedBookId = getData(payload)?._id || bookId;
        showToast("Book updated successfully");
    } else {
        const payload = await api.request("/books", {
            method: "POST",
            body
        });
        savedBookId = getData(payload)?._id || "";
        showToast("Book created successfully");
    }

    if (selectedCover && savedBookId) {
        const uploadData = await uploadCoverForBook(savedBookId, selectedCover);
        elements.coverUploadInfo.textContent = `Da upload: ${uploadData.file_name}`;
        showToast("Book saved and cover uploaded successfully");
    }

    await loadBooks();
    resetBookForm();
}

async function handleDeleteBook() {
    const bookId = elements.bookId.value;
    if (!bookId) {
        throw new Error("Chưa có sách nào được chọn");
    }

    await api.request(`/books/${bookId}`, {
        method: "DELETE"
    });

    showToast("Xóa sách thành công");
    await loadBooks();
    resetBookForm();
}

async function handleCoverUpload() {
    const bookId = elements.bookId.value;
    const file = elements.bookCoverFile.files[0];

    if (!bookId) {
        throw new Error("Please select a book before uploading an image");
    }

    if (!file) {
        throw new Error("Please choose an image file");
    }

    const data = await uploadCoverForBook(bookId, file);
    elements.coverUploadInfo.textContent = `Da upload: ${data.file_name}`;
    showToast("Cover uploaded successfully");
    await loadBooks();
}

async function handleMarkNotificationRead(notificationId) {
    await api.request(`/notifications/${notificationId}/read`, {
        method: "PUT"
    });

    state.notifications = state.notifications.map((item) =>
        item._id === notificationId ? { ...item, is_read: true } : item
    );
    renderNotifications();
}

function attachEvents() {
    elements.loginForm.addEventListener("submit", wrapAsync(handleLogin));
    elements.registerForm.addEventListener("submit", wrapAsync(handleRegister));
    elements.borrowForm.addEventListener("submit", wrapAsync(handleBorrow));
    elements.returnForm.addEventListener("submit", wrapAsync(handleReturn));
    elements.bookForm.addEventListener("submit", wrapAsync(handleBookSubmit));
    elements.deleteBookBtn.addEventListener("click", wrapAsync(handleDeleteBook));
    elements.uploadCoverBtn.addEventListener("click", wrapAsync(handleCoverUpload));
    elements.resetBookFormBtn.addEventListener("click", resetBookForm);
    elements.refreshBooksBtn.addEventListener("click", wrapAsync(loadBooks));
    elements.refreshLoansBtn.addEventListener("click", wrapAsync(loadLoans));
    elements.refreshNotificationsBtn.addEventListener("click", wrapAsync(loadNotifications));
    elements.logoutBtn.addEventListener("click", () => {
        state.token = "";
        state.user = null;
        persistSession();
        disconnectSocket();
        updateSessionView();
        resetBookForm();
        showToast("Đã đăng xuất");
    });

    elements.searchInput.addEventListener("input", (event) => {
        state.search = event.target.value;
        renderBooks();
    });

    elements.categoryFilter.addEventListener("change", (event) => {
        state.categoryId = event.target.value;
        renderBooks();
    });
}

function wrapAsync(handler) {
    return async (event) => {
        try {
            await handler(event);
        } catch (error) {
            showToast(error.message || "Có lỗi xảy ra", "error");
        }
    };
}

async function init() {
    attachEvents();
    renderSocketStatus();
    renderSocketEvents();
    updateSessionView();
    renderOverview();

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    elements.borrowDueDate.value = dueDate.toISOString().split("T")[0];

    try {
        await loadReferenceData();
        await loadBooks();
        await refreshAuthenticatedData();
    } catch (error) {
        showToast(error.message || "Không tải được dữ liệu ban đầu", "error");
    }
}

window.app = {
    fillBorrowForm(bookId) {
        elements.borrowBookId.value = bookId;
        window.scrollTo({ top: 0, behavior: "smooth" });
    },

    fillReturnForm(loanId, bookId) {
        elements.returnLoanId.value = loanId;
        elements.returnBookId.value = bookId;
        window.scrollTo({ top: 0, behavior: "smooth" });
    },

    editBook(bookId) {
        const book = state.books.find((item) => item._id === bookId);
        if (!book) {
            showToast("Không tìm thấy sách", "error");
            return;
        }

        elements.bookId.value = book._id;
        elements.bookTitle.value = book.title || "";
        elements.bookIsbn.value = book.isbn || "";
        elements.bookAuthor.value = book.author_id?._id || "";
        elements.bookCategory.value = book.category_id?._id || "";
        elements.bookPublisher.value = book.publisher_id?._id || "";
        elements.bookYear.value = book.published_year || "";
        elements.bookQuantity.value = book.quantity || 0;
        elements.bookAvailableCopies.value = book.available_copies || 0;
        elements.coverUploadInfo.textContent = book.cover_url ? `Anh hien tai: ${book.cover_url}` : "";
        elements.deleteBookBtn.classList.remove("hidden");
        elements.uploadCoverBtn.classList.remove("hidden");
        document.getElementById("adminPanel").scrollIntoView({ behavior: "smooth" });
    },

    markNotificationRead(notificationId) {
        handleMarkNotificationRead(notificationId).catch((error) => {
            showToast(error.message || "Khong cap nhat duoc thong bao", "error");
        });
    }
};

document.addEventListener("DOMContentLoaded", init);

