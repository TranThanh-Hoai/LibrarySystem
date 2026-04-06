document.addEventListener("DOMContentLoaded", function initAdminDashboard() {
    const app = window.LibraryApp;
    const session = app.requireAuth("admin");
    if (!session) return;

    const state = {
        books: [],
        categories: [],
        authors: [],
        publishers: [],
        users: [],
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
        metricUsers: document.getElementById("metricUsers"),
        metricLoans: document.getElementById("metricLoans"),
        metricNotifications: document.getElementById("metricNotifications"),
        searchInput: document.getElementById("searchInput"),
        categoryFilter: document.getElementById("categoryFilter"),
        booksTableBody: document.getElementById("booksTableBody"),
        bookSummary: document.getElementById("bookSummary"),
        usersTableBody: document.getElementById("usersTableBody"),
        loansList: document.getElementById("loansList"),
        loanSummary: document.getElementById("loanSummary"),
        notificationsList: document.getElementById("notificationsList"),
        notificationSummary: document.getElementById("notificationSummary"),
        socketEvents: document.getElementById("socketEvents"),
        refreshBooksBtn: document.getElementById("refreshBooksBtn"),
        refreshUsersBtn: document.getElementById("refreshUsersBtn"),
        refreshLoansBtn: document.getElementById("refreshLoansBtn"),
        refreshNotificationsBtn: document.getElementById("refreshNotificationsBtn"),
        bookForm: document.getElementById("bookForm"),
        bookId: document.getElementById("bookId"),
        bookTitle: document.getElementById("bookTitle"),
        bookIsbn: document.getElementById("bookIsbn"),
        bookAuthor: document.getElementById("bookAuthor"),
        bookCategory: document.getElementById("bookCategory"),
        bookPublisher: document.getElementById("bookPublisher"),
        bookYear: document.getElementById("bookYear"),
        bookQuantity: document.getElementById("bookQuantity"),
        bookAvailableCopies: document.getElementById("bookAvailableCopies"),
        bookCover: document.getElementById("bookCover"),
        coverInfo: document.getElementById("coverInfo"),
        bookCoverPreview: document.getElementById("bookCoverPreview"),
        newBookBtn: document.getElementById("newBookBtn"),
        deleteBookBtn: document.getElementById("deleteBookBtn"),
        userForm: document.getElementById("userForm"),
        userId: document.getElementById("userId"),
        userFullName: document.getElementById("userFullName"),
        userUsername: document.getElementById("userUsername"),
        userEmail: document.getElementById("userEmail"),
        userRole: document.getElementById("userRole"),
        userPassword: document.getElementById("userPassword"),
        newUserBtn: document.getElementById("newUserBtn"),
        deleteUserBtn: document.getElementById("deleteUserBtn"),
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

    function updateMetrics() {
        el.metricBooks.textContent = String(getFilteredBooks().length);
        el.metricUsers.textContent = String(state.users.length);
        el.metricLoans.textContent = String(state.loans.length);
        el.metricNotifications.textContent = String(unreadCount());
    }

    function setSocketStatus(status) {
        state.socketStatus = status;
        el.socketStatus.className = "pill " + status;
        el.socketStatus.textContent = status === "online" ? "Online" : status === "connecting" ? "Đang kết nối" : "Offline";
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

    function renderCategoryFilter() {
        const options = ['<option value="">Tất cả</option>']
            .concat(state.categories.map(function mapCategory(item) {
                return '<option value="' + item._id + '">' + app.escapeHtml(item.name) + '</option>';
            }))
            .join("");
        el.categoryFilter.innerHTML = options;
        el.categoryFilter.value = state.categoryId;
    }

    function renderBookFormOptions() {
        el.bookAuthor.innerHTML = ['<option value="">Chọn tác giả</option>'].concat(
            state.authors.map(function mapAuthor(item) {
                return '<option value="' + item._id + '">' + app.escapeHtml(item.name) + '</option>';
            })
        ).join("");

        el.bookCategory.innerHTML = ['<option value="">Chọn thể loại</option>'].concat(
            state.categories.map(function mapCategory(item) {
                return '<option value="' + item._id + '">' + app.escapeHtml(item.name) + '</option>';
            })
        ).join("");

        el.bookPublisher.innerHTML = ['<option value="">Chọn nhà xuất bản</option>'].concat(
            state.publishers.map(function mapPublisher(item) {
                return '<option value="' + item._id + '">' + app.escapeHtml(item.name) + '</option>';
            })
        ).join("");
    }

    function renderBooks() {
        const filtered = getFilteredBooks();
        el.bookSummary.textContent = "Tổng " + filtered.length + " / " + state.books.length + " sách";
        updateMetrics();

        if (!filtered.length) {
            el.booksTableBody.innerHTML = '<tr><td colspan="7"><div class="empty">Không có sách phù hợp bộ lọc.</div></td></tr>';
            return;
        }

        el.booksTableBody.innerHTML = filtered.map(function mapBook(book) {
            const available = Number(book.available_copies || 0);
            const stockClass = available < 3 ? "tag low" : "tag";
            const cover = book.cover_url
                ? '<img class="book-cover-inline" src="' + app.escapeHtml(book.cover_url) + '" alt="' + app.escapeHtml(book.title) + '">'
                : '<span class="muted">Chưa có ảnh bìa</span>';

            return '' +
                '<tr>' +
                '<td><div class="title-stack"><button class="book-title-btn" type="button" onclick="window.AdminUI.editBook(\'' + book._id + '\')">' + app.escapeHtml(book.title) + '</button><div>' + cover + '</div></div></td>' +
                '<td>' + app.escapeHtml(book.isbn) + '</td>' +
                '<td>' + app.escapeHtml(book.author_id && book.author_id.name) + '</td>' +
                '<td>' + app.escapeHtml(book.category_id && book.category_id.name) + '</td>' +
                '<td>' + app.escapeHtml(book.publisher_id && book.publisher_id.name) + '</td>' +
                '<td><span class="' + stockClass + '">' + available + '/' + Number(book.quantity || 0) + '</span></td>' +
                '<td>' +
                '<div class="row-actions">' +
                '<button class="btn btn-soft" type="button" onclick="window.AdminUI.editBook(\'' + book._id + '\')">Sửa</button>' +
                '<button class="btn btn-soft" type="button" onclick="window.AdminUI.fillReturnByBook(\'' + book._id + '\')">Trả nhanh</button>' +
                '</div>' +
                '</td>' +
                '</tr>';
        }).join("");
    }

    function renderUsers() {
        updateMetrics();

        if (!state.users.length) {
            el.usersTableBody.innerHTML = '<tr><td colspan="5"><div class="empty">Chưa có tài khoản nào.</div></td></tr>';
            return;
        }

        el.usersTableBody.innerHTML = state.users.map(function mapUser(user) {
            const roleName = user.role_id && user.role_id.name ? user.role_id.name : (user.role || "user");
            return '' +
                '<tr>' +
                '<td>' + app.escapeHtml(user.full_name) + '</td>' +
                '<td>' + app.escapeHtml(user.username) + '</td>' +
                '<td>' + app.escapeHtml(user.email) + '</td>' +
                '<td>' + app.escapeHtml(roleName) + '</td>' +
                '<td><button class="btn btn-soft" type="button" onclick="window.AdminUI.editUser(\'' + user._id + '\')">Sửa</button></td>' +
                '</tr>';
        }).join("");
    }

    function renderLoans() {
        el.loanSummary.textContent = state.loans.length + " phiếu mượn";
        updateMetrics();

        if (!state.loans.length) {
            el.loansList.innerHTML = '<div class="empty">Chưa có phiếu mượn nào.</div>';
            return;
        }

        el.loansList.innerHTML = state.loans.map(function mapLoan(loan) {
            const userInfo = loan.user_id
                ? (loan.user_id.full_name || loan.user_id.username || "") + " - " + (loan.user_id.email || "")
                : "Không rõ";

            const details = (loan.details || []).map(function mapDetail(detail) {
                const bookId = detail.book_id && detail.book_id._id ? detail.book_id._id : detail.book_id;
                const title = detail.book_id && detail.book_id.title ? detail.book_id.title : bookId;
                return '' +
                    '<div class="meta" style="margin-top:6px;">' +
                    '<strong>' + app.escapeHtml(title) + '</strong>' +
                    '<span>Book ID: ' + app.escapeHtml(bookId) + '</span>' +
                    '<span>Ngày trả: ' + app.toVNDate(detail.return_date) + '</span>' +
                    '<button class="btn btn-soft" type="button" onclick="window.AdminUI.fillReturn(\'' + loan._id + '\', \'' + bookId + '\')">Điền vào form trả</button>' +
                    '</div>';
            }).join("");

            return '' +
                '<article class="list-item">' +
                '<h3>Loan ' + app.escapeHtml(loan._id) + '</h3>' +
                '<div class="meta">' +
                '<span>Người mượn: ' + app.escapeHtml(userInfo) + '</span>' +
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
                (item.is_read ? "" : '<button class="btn btn-soft" type="button" onclick="window.AdminUI.markRead(\'' + item._id + '\')">Đánh dấu đã đọc</button>') +
                '</div>' +
                '</article>';
        }).join("");
    }

    async function loadReferenceData() {
        const response = await Promise.all([
            app.request("/categories"),
            app.request("/authors"),
            app.request("/publishers")
        ]);

        state.categories = app.getData(response[0]) || [];
        state.authors = app.getData(response[1]) || [];
        state.publishers = app.getData(response[2]) || [];

        renderCategoryFilter();
        renderBookFormOptions();
    }

    async function loadBooks() {
        const payload = await app.request("/books?limit=200");
        const data = app.getData(payload);
        state.books = Array.isArray(data && data.books) ? data.books : (Array.isArray(data) ? data : []);
        renderBooks();
    }

    async function loadUsers() {
        const payload = await app.request("/users");
        state.users = Array.isArray(payload) ? payload : (app.getData(payload) || []);
        renderUsers();
    }

    async function loadLoans() {
        const payload = await app.request("/loans");
        state.loans = app.getData(payload) || [];
        renderLoans();
    }

    async function loadNotifications() {
        const payload = await app.request("/notifications");
        state.notifications = app.getData(payload) || [];
        renderNotifications();
    }

    async function markRead(notificationId) {
        await app.request("/notifications/" + notificationId + "/read", { method: "PUT" });
        state.notifications = state.notifications.map(function markItem(item) {
            if (item._id === notificationId) {
                return Object.assign({}, item, { is_read: true });
            }
            return item;
        });
        renderNotifications();
    }

    function resetBookForm() {
        el.bookForm.reset();
        el.bookId.value = "";
        el.coverInfo.textContent = "";
        el.bookCoverPreview.src = "";
        el.bookCoverPreview.classList.add("hidden");
        el.deleteBookBtn.classList.add("hidden");
    }

    function resetUserForm() {
        el.userForm.reset();
        el.userId.value = "";
        el.deleteUserBtn.classList.add("hidden");
    }

    function setSessionInfo() {
        const name = session.user.full_name || session.user.username || session.user.email;
        el.sessionInfo.textContent = name + " (admin)";
    }

    async function submitBook(event) {
        event.preventDefault();

        const id = el.bookId.value;
        const payload = {
            title: el.bookTitle.value.trim(),
            isbn: el.bookIsbn.value.trim(),
            author_id: el.bookAuthor.value,
            category_id: el.bookCategory.value,
            publisher_id: el.bookPublisher.value,
            published_year: el.bookYear.value ? Number(el.bookYear.value) : undefined,
            quantity: Number(el.bookQuantity.value),
            available_copies: Number(el.bookAvailableCopies.value)
        };

        let savedId = id;
        if (id) {
            const updated = await app.request("/books/" + id, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            const data = app.getData(updated);
            savedId = data && data._id ? data._id : id;
            app.showToast("Cap nhat sach thanh cong", "success");
        } else {
            const created = await app.request("/books", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            const data = app.getData(created);
            savedId = data && data._id ? data._id : "";
            app.showToast("Tạo sách thành công", "success");
        }

        if (savedId && el.bookCover.files && el.bookCover.files[0]) {
            const formData = new FormData();
            formData.append("cover", el.bookCover.files[0]);
            await app.request("/books/" + savedId + "/cover", {
                method: "POST",
                body: formData
            });
            app.showToast("Upload ảnh bìa thành công", "success");
        }

        await loadBooks();
        resetBookForm();
    }

    async function deleteBook() {
        const id = el.bookId.value;
        if (!id) {
            app.showToast("Bạn chưa chọn sách", "error");
            return;
        }
        if (!window.confirm("Xác nhận xóa sách này?")) return;
        await app.request("/books/" + id, { method: "DELETE" });
        app.showToast("Đã xóa sách", "success");
        await loadBooks();
        resetBookForm();
    }

    async function submitUser(event) {
        event.preventDefault();

        const id = el.userId.value;
        const body = {
            username: el.userUsername.value.trim(),
            full_name: el.userFullName.value.trim(),
            email: el.userEmail.value.trim(),
            role_name: el.userRole.value
        };

        if (id) {
            await app.request("/users/" + id, {
                method: "PUT",
                body: JSON.stringify(body)
            });
            app.showToast("Cập nhật user thành công", "success");
        } else {
            const password = el.userPassword.value;
            if (!password) {
                app.showToast("Mật khẩu bắt buộc khi tạo user", "error");
                return;
            }
            await app.request("/users", {
                method: "POST",
                body: JSON.stringify(Object.assign({}, body, { password: password }))
            });
            app.showToast("Tạo user thành công", "success");
        }

        await loadUsers();
        resetUserForm();
    }

    async function deleteUser() {
        const id = el.userId.value;
        if (!id) {
            app.showToast("Bạn chưa chọn user", "error");
            return;
        }
        if (!window.confirm("Xác nhận xóa user này?")) return;

        await app.request("/users/" + id, { method: "DELETE" });
        app.showToast("Đã xóa user", "success");
        await loadUsers();
        resetUserForm();
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
        el.refreshUsersBtn.addEventListener("click", wrapAsync(loadUsers));
        el.refreshLoansBtn.addEventListener("click", wrapAsync(loadLoans));
        el.refreshNotificationsBtn.addEventListener("click", wrapAsync(loadNotifications));

        el.bookForm.addEventListener("submit", wrapAsync(submitBook));
        el.newBookBtn.addEventListener("click", resetBookForm);
        el.deleteBookBtn.addEventListener("click", wrapAsync(deleteBook));

        el.userForm.addEventListener("submit", wrapAsync(submitUser));
        el.newUserBtn.addEventListener("click", resetUserForm);
        el.deleteUserBtn.addEventListener("click", wrapAsync(deleteUser));

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

    window.AdminUI = {
        editBook: function editBook(bookId) {
            const book = state.books.find(function findBook(item) {
                return item._id === bookId;
            });
            if (!book) return;

            el.bookId.value = book._id;
            el.bookTitle.value = book.title || "";
            el.bookIsbn.value = book.isbn || "";
            el.bookAuthor.value = book.author_id && book.author_id._id ? book.author_id._id : "";
            el.bookCategory.value = book.category_id && book.category_id._id ? book.category_id._id : "";
            el.bookPublisher.value = book.publisher_id && book.publisher_id._id ? book.publisher_id._id : "";
            el.bookYear.value = book.published_year || "";
            el.bookQuantity.value = Number(book.quantity || 0);
            el.bookAvailableCopies.value = Number(book.available_copies || 0);
            el.coverInfo.textContent = book.cover_url ? "Ảnh hiện tại: " + book.cover_url : "";
            if (book.cover_url) {
                el.bookCoverPreview.src = book.cover_url;
                el.bookCoverPreview.classList.remove("hidden");
            } else {
                el.bookCoverPreview.src = "";
                el.bookCoverPreview.classList.add("hidden");
            }
            el.deleteBookBtn.classList.remove("hidden");
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        editUser: function editUser(userId) {
            const user = state.users.find(function findUser(item) {
                return item._id === userId;
            });
            if (!user) return;

            const roleName = user.role_id && user.role_id.name ? user.role_id.name : (user.role || "user");
            el.userId.value = user._id;
            el.userFullName.value = user.full_name || "";
            el.userUsername.value = user.username || "";
            el.userEmail.value = user.email || "";
            el.userRole.value = roleName;
            el.userPassword.value = "";
            el.deleteUserBtn.classList.remove("hidden");
            el.userPassword.placeholder = "Bỏ trống nếu không đổi mật khẩu";
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        fillReturn: function fillReturn(loanId, bookId) {
            el.returnLoanId.value = loanId;
            el.returnBookId.value = bookId;
            el.returnCondition.focus();
        },
        fillReturnByBook: function fillReturnByBook(bookId) {
            el.returnBookId.value = bookId;
            el.returnLoanId.focus();
        },
        markRead: function markRead(notificationId) {
            markRead(notificationId).catch(function onError(error) {
                app.showToast(error.message || "Không cập nhật được thông báo", "error");
            });
        }
    };

    async function firstLoad() {
        setSessionInfo();
        setSocketStatus("offline");
        renderSocketEvents();
        bindEvents();

        state.socket = app.connectSocket(
            function onNotification(notification) {
                state.notifications.unshift(notification);
                renderNotifications();
                app.showToast(notification.message || "Có thông báo mới", "success");
            },
            setSocketStatus,
            addSocketEvent
        );

        await loadReferenceData();
        await Promise.all([loadBooks(), loadUsers(), loadLoans(), loadNotifications()]);
    }

    firstLoad().catch(function onInitError(error) {
        app.showToast(error.message || "Không tải được dữ liệu dashboard", "error");
    });
});
