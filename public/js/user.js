document.addEventListener("DOMContentLoaded", function initUserDashboard() {
    const app = window.LibraryApp;
    const session = app.requireAuth("user");
    if (!session) return;

    const state = {
        books: [],
        categories: [],
        loans: [],
        notifications: [],
        socketEvents: [],
        socketStatus: "offline",
        search: "",
        categoryId: "",
        socket: null
    };

    const el = {
        sessionInfo: document.getElementById("sessionInfo"),
        socketStatus: document.getElementById("socketStatus"),
        metricBooks: document.getElementById("metricBooks"),
        metricLoans: document.getElementById("metricLoans"),
        metricNotifications: document.getElementById("metricNotifications"),
        metricSocket: document.getElementById("metricSocket"),
        bookSummary: document.getElementById("bookSummary"),
        loanSummary: document.getElementById("loanSummary"),
        notificationSummary: document.getElementById("notificationSummary"),
        searchInput: document.getElementById("searchInput"),
        categoryFilter: document.getElementById("categoryFilter"),
        booksTableBody: document.getElementById("booksTableBody"),
        loansList: document.getElementById("loansList"),
        notificationsList: document.getElementById("notificationsList"),
        socketEvents: document.getElementById("socketEvents"),
        refreshBooksBtn: document.getElementById("refreshBooksBtn"),
        refreshLoansBtn: document.getElementById("refreshLoansBtn"),
        refreshNotificationsBtn: document.getElementById("refreshNotificationsBtn"),
        borrowForm: document.getElementById("borrowForm"),
        borrowBookId: document.getElementById("borrowBookId"),
        borrowDueDate: document.getElementById("borrowDueDate"),
        borrowCondition: document.getElementById("borrowCondition"),
        returnForm: document.getElementById("returnForm"),
        returnLoanId: document.getElementById("returnLoanId"),
        returnBookId: document.getElementById("returnBookId"),
        returnCondition: document.getElementById("returnCondition")
    };

    function unreadCount() {
        return state.notifications.filter(function onlyUnread(item) {
            return !item.is_read;
        }).length;
    }

    function setSocketStatus(status) {
        state.socketStatus = status;
        el.socketStatus.className = "pill " + status;
        el.socketStatus.textContent = status === "online" ? "Online" : status === "connecting" ? "Đang kết nối" : "Offline";
        el.metricSocket.textContent = status === "online" ? "Online" : status === "connecting" ? "Connecting" : "Offline";
    }

    function addSocketEvent(title, detail) {
        state.socketEvents.unshift({ title: title, detail: detail || "", at: new Date().toISOString() });
        state.socketEvents = state.socketEvents.slice(0, 12);
        renderSocketEvents();
    }

    function renderSocketEvents() {
        if (!state.socketEvents.length) {
            el.socketEvents.innerHTML = '<div class="empty">Chưa có sự kiện kết nối.</div>';
            return;
        }

        el.socketEvents.innerHTML = state.socketEvents.map(function mapEvent(item) {
            return '' +
                '<article class="list-item">' +
                '<h4>' + app.escapeHtml(item.title) + '</h4>' +
                '<div class="meta">' +
                '<span>' + app.escapeHtml(item.detail || "Không có chi tiết") + '</span>' +
                '<span>' + app.toVNDateTime(item.at) + '</span>' +
                '</div>' +
                '</article>';
        }).join("");
    }

    function getFilteredBooks() {
        const keyword = state.search.trim().toLowerCase();
        return state.books.filter(function matchBook(book) {
            const inCategory = !state.categoryId || (book.category_id && book.category_id._id === state.categoryId);
            if (!inCategory) return false;
            if (!keyword) return true;

            const candidate = [
                book.title,
                book.isbn,
                book.author_id && book.author_id.name,
                book.publisher_id && book.publisher_id.name,
                book.category_id && book.category_id.name
            ].join(" ").toLowerCase();

            return candidate.includes(keyword);
        });
    }

    function updateMetrics() {
        el.metricBooks.textContent = String(getFilteredBooks().length);
        el.metricLoans.textContent = String(state.loans.length);
        el.metricNotifications.textContent = String(unreadCount());
    }

    function renderCategoryFilter() {
        el.categoryFilter.innerHTML = ['<option value="">Tất cả</option>']
            .concat(state.categories.map(function mapCategory(category) {
                return '<option value="' + category._id + '">' + app.escapeHtml(category.name) + '</option>';
            })).join("");
        el.categoryFilter.value = state.categoryId;
    }

    function renderBooks() {
        const books = getFilteredBooks();
        el.bookSummary.textContent = "Tổng " + books.length + " / " + state.books.length + " sách";
        updateMetrics();

        if (!books.length) {
            el.booksTableBody.innerHTML = '<tr><td colspan="7"><div class="empty">Không có sách phù hợp bộ lọc.</div></td></tr>';
            return;
        }

        el.booksTableBody.innerHTML = books.map(function mapBook(book) {
            const available = Number(book.available_copies || 0);
            const stockClass = available < 3 ? "tag low" : "tag";
            const cover = book.cover_url
                ? '<img class="book-cover-inline" src="' + app.escapeHtml(book.cover_url) + '" alt="' + app.escapeHtml(book.title) + '">'
                : '<span class="muted">Chưa có ảnh bìa</span>';

            return '' +
                '<tr>' +
                '<td><div class="title-stack"><strong>' + app.escapeHtml(book.title) + '</strong><div>' + cover + '</div></div></td>' +
                '<td>' + app.escapeHtml(book.isbn) + '</td>' +
                '<td>' + app.escapeHtml(book.author_id && book.author_id.name) + '</td>' +
                '<td>' + app.escapeHtml(book.category_id && book.category_id.name) + '</td>' +
                '<td>' + app.escapeHtml(book.publisher_id && book.publisher_id.name) + '</td>' +
                '<td><span class="' + stockClass + '">' + available + '/' + Number(book.quantity || 0) + '</span></td>' +
                '<td><button class="btn btn-soft" type="button" onclick="window.UserUI.fillBorrow(\'' + book._id + '\')">Mượn</button></td>' +
                '</tr>';
        }).join("");
    }

    function renderLoans() {
        el.loanSummary.textContent = state.loans.length + " phiếu mượn";
        updateMetrics();

        if (!state.loans.length) {
            el.loansList.innerHTML = '<div class="empty">Bạn chưa có phiếu mượn nào.</div>';
            return;
        }

        el.loansList.innerHTML = state.loans.map(function mapLoan(loan) {
            const details = (loan.details || []).map(function mapDetail(detail) {
                const bookId = detail.book_id && detail.book_id._id ? detail.book_id._id : detail.book_id;
                const title = detail.book_id && detail.book_id.title ? detail.book_id.title : bookId;
                return '' +
                    '<div class="meta" style="margin-top:6px;">' +
                    '<strong>' + app.escapeHtml(title) + '</strong>' +
                    '<span>Book ID: ' + app.escapeHtml(bookId) + '</span>' +
                    '<span>Ngày trả: ' + app.toVNDate(detail.return_date) + '</span>' +
                    '<button class="btn btn-soft" type="button" onclick="window.UserUI.fillReturn(\'' + loan._id + '\', \'' + bookId + '\')">Điền vào form trả</button>' +
                    '</div>';
            }).join("");

            return '' +
                '<article class="list-item">' +
                '<h3>Loan ' + app.escapeHtml(loan._id) + '</h3>' +
                '<div class="meta">' +
                '<span>Ngày mượn: ' + app.toVNDate(loan.loan_date) + '</span>' +
                '<span>Hạn trả: ' + app.toVNDate(loan.due_date) + '</span>' +
                '<span>Trạng thái: ' + app.escapeHtml(loan.status) + '</span>' +
                '</div>' +
                details +
                '</article>';
        }).join("");
    }

    function renderNotifications() {
        const unread = unreadCount();
        el.notificationSummary.textContent = "Tổng " + state.notifications.length + " thông báo, " + unread + " chưa đọc";
        updateMetrics();

        if (!state.notifications.length) {
            el.notificationsList.innerHTML = '<div class="empty">Chưa có thông báo.</div>';
            return;
        }

        el.notificationsList.innerHTML = state.notifications.map(function mapNotification(item) {
            return '' +
                '<article class="list-item">' +
                '<h4>' + app.escapeHtml(item.type || "Thông báo") + '</h4>' +
                '<div class="meta">' +
                '<span>' + app.escapeHtml(item.message) + '</span>' +
                '<span>Trạng thái: ' + (item.is_read ? "Đã đọc" : "Chưa đọc") + '</span>' +
                '<span>' + app.toVNDateTime(item.createdAt) + '</span>' +
                (item.is_read ? "" : '<button class="btn btn-soft" type="button" onclick="window.UserUI.markRead(\'' + item._id + '\')">Đánh dấu đã đọc</button>') +
                '</div>' +
                '</article>';
        }).join("");
    }

    async function loadCategories() {
        const payload = await app.request("/categories");
        state.categories = app.getData(payload) || [];
        renderCategoryFilter();
    }

    async function loadBooks() {
        const payload = await app.request("/books?limit=200");
        const data = app.getData(payload);
        state.books = Array.isArray(data && data.books) ? data.books : (Array.isArray(data) ? data : []);
        renderBooks();
    }

    async function loadLoans() {
        const payload = await app.request("/loans/my-loans");
        state.loans = app.getData(payload) || [];
        renderLoans();
    }

    async function loadNotifications() {
        const payload = await app.request("/notifications");
        state.notifications = app.getData(payload) || [];
        renderNotifications();
    }

    async function submitBorrow(event) {
        event.preventDefault();
        await app.request("/loans/borrow", {
            method: "POST",
            body: JSON.stringify({
                due_date: el.borrowDueDate.value,
                books: [{
                    book_id: el.borrowBookId.value.trim(),
                    condition: el.borrowCondition.value.trim() || "New"
                }]
            })
        });
        app.showToast("Tạo phiếu mượn thành công", "success");
        el.borrowForm.reset();

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        el.borrowDueDate.value = dueDate.toISOString().split("T")[0];

        await Promise.all([loadBooks(), loadLoans()]);
    }

    async function submitReturn(event) {
        event.preventDefault();
        await app.request("/loans/return-book", {
            method: "POST",
            body: JSON.stringify({
                loan_id: el.returnLoanId.value.trim(),
                book_id: el.returnBookId.value.trim(),
                condition: el.returnCondition.value.trim()
            })
        });
        app.showToast("Trả sách thành công", "success");
        el.returnForm.reset();
        await Promise.all([loadBooks(), loadLoans(), loadNotifications()]);
    }

    async function markRead(notificationId) {
        await app.request("/notifications/" + notificationId + "/read", { method: "PUT" });
        state.notifications = state.notifications.map(function mapNotification(item) {
            if (item._id === notificationId) return Object.assign({}, item, { is_read: true });
            return item;
        });
        renderNotifications();
    }

    function bindEvents() {
        app.attachLogout("logoutBtn");

        el.searchInput.addEventListener("input", function onSearch(event) {
            state.search = event.target.value;
            renderBooks();
        });

        el.categoryFilter.addEventListener("change", function onCategory(event) {
            state.categoryId = event.target.value;
            renderBooks();
        });

        el.refreshBooksBtn.addEventListener("click", wrapAsync(loadBooks));
        el.refreshLoansBtn.addEventListener("click", wrapAsync(loadLoans));
        el.refreshNotificationsBtn.addEventListener("click", wrapAsync(loadNotifications));

        el.borrowForm.addEventListener("submit", wrapAsync(submitBorrow));
        el.returnForm.addEventListener("submit", wrapAsync(submitReturn));
    }

    function wrapAsync(handler) {
        return async function wrapped(event) {
            try {
                await handler(event);
            } catch (error) {
                app.showToast(error.message || "Có lỗi xảy ra", "error");
            }
        };
    }

    window.UserUI = {
        fillBorrow: function fillBorrow(bookId) {
            el.borrowBookId.value = bookId;
            el.borrowDueDate.focus();
        },
        fillReturn: function fillReturn(loanId, bookId) {
            el.returnLoanId.value = loanId;
            el.returnBookId.value = bookId;
            el.returnCondition.focus();
        },
        markRead: function markReadAction(notificationId) {
            markRead(notificationId).catch(function onError(error) {
                app.showToast(error.message || "Không cập nhật được thông báo", "error");
            });
        }
    };

    function setSessionInfo() {
        const name = session.user.full_name || session.user.username || session.user.email;
        el.sessionInfo.textContent = name + " (user)";
    }

    async function firstLoad() {
        setSessionInfo();
        setSocketStatus("offline");
        renderSocketEvents();
        bindEvents();

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        el.borrowDueDate.value = dueDate.toISOString().split("T")[0];

        state.socket = app.connectSocket(
            function onNotification(notification) {
                state.notifications.unshift(notification);
                renderNotifications();
                app.showToast(notification.message || "Có thông báo mới", "success");
            },
            setSocketStatus,
            addSocketEvent
        );

        await loadCategories();
        await Promise.all([loadBooks(), loadLoans(), loadNotifications()]);
    }

    firstLoad().catch(function onError(error) {
        app.showToast(error.message || "Không tải được dữ liệu dashboard", "error");
    });
});
