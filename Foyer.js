// ======================
// CONFIG & INITIALIZATION
// ======================
let paymentHistory = JSON.parse(localStorage.getItem("paymentHistory")) || {};
const building = document.getElementById("building");

const floors = 6;
const apartments = 4;
const rooms = 3;
const beds = 2;
const totalBeds = floors * apartments * rooms * beds;
const MONTHLY_RENT = 235;

// ======================
// EXPENSE STATE
// ======================
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// ======================
// CUSTOMER STATE
// ======================
let customers = JSON.parse(localStorage.getItem("customers"));

if (!customers) {
    customers = new Array(totalBeds).fill(null);
}

let selectedBed = null;

// Modals
const modal = document.getElementById("customerModal");
const editModal = document.getElementById("editModal");
const confirmModal = document.getElementById("confirmModal");
const kpiModal = document.getElementById("kpiModal");
const expenseModal = document.getElementById("expenseModal");

// Buttons
const saveBtn = document.getElementById("saveCustomer");
const cancelBtn = document.getElementById("cancelCustomer");
const checkoutBtn = document.getElementById("checkoutCustomer");
const updateBtn = document.getElementById("updateCustomer");
const confirmOk = document.getElementById("confirmOk");
const confirmCancel = document.getElementById("confirmCancel");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const saveExpenseBtn = document.getElementById("saveExpense");
const cancelExpenseBtn = document.getElementById("cancelExpense");
const expenseTableBody = document.getElementById("expenseTableBody");

// ======================
// BUILD UI (BUILDING GRID)
// ======================
let index = 0;

for (let floor = 1; floor <= floors; floor++) {
    const floorDiv = document.createElement("div");
    floorDiv.className = "floor";
    floorDiv.innerHTML = `<h2>Floor ${floor}</h2>`;

    const apartmentContainer = document.createElement("div");
    apartmentContainer.className = "apartments";

    for (let apartment = 1; apartment <= apartments; apartment++) {
        const apartmentDiv = document.createElement("div");
        apartmentDiv.className = "apartment";

        apartmentDiv.innerHTML = `
            <div class="apartment-header">
                🏢 Apartment ${apartment}
            </div>
        `;

        for (let room = 1; room <= rooms; room++) {
            const roomDiv = document.createElement("div");
            roomDiv.className = "room";
            roomDiv.innerHTML = `<h4>Room ${room}</h4>`;

            for (let bed = 1; bed <= beds; bed++) {
                const button = document.createElement("button");
                button.className = "available";
                button.innerText = `Bed ${bed}`;

                button.dataset.index = index;
                button.dataset.bedName = `Bed ${bed}`;

                // LEFT CLICK
                button.onclick = function () {
                    selectedBed = button;
                    const i = button.dataset.index;
                    const customer = customers[i];

                    if (customer) {
                        document.getElementById("editName").value = customer.name;
                        document.getElementById("editPhone").value = customer.phone;
                        document.getElementById("editPaid").value = customer.paid;
                        document.getElementById("editParentPhone").value = customer.parentPhone || "";
                        editModal.style.display = "flex";
                        return;
                    }

                    modal.style.display = "flex";
                };

                // RIGHT CLICK EDIT
                button.oncontextmenu = function (e) {
                    e.preventDefault();
                    selectedBed = button;
                    const i = button.dataset.index;
                    const customer = customers[i];

                    if (!customer) return;

                    document.getElementById("editName").value = customer.name;
                    document.getElementById("editPhone").value = customer.phone;
                    document.getElementById("editPaid").value = customer.paid;
                    document.getElementById("editParentPhone").value = customer.parentPhone || "";

                    editModal.style.display = "flex";
                };

                roomDiv.appendChild(button);
                index++;
            }

            apartmentDiv.appendChild(roomDiv);
        }

        apartmentContainer.appendChild(apartmentDiv);
    }

    floorDiv.appendChild(apartmentContainer);
    if (building) building.appendChild(floorDiv);
}

// ======================
// AUTHENTICATION
// ======================
// ==========================================
// AUTHENTICATION & LOCALSTORAGE SESSION
// ==========================================

// 1. دالة تسجيل الدخول
function login() {
    const userInput = document.getElementById("loginUser").value.trim();
    const passInput = document.getElementById("loginPass").value.trim();

    if (userInput === "admin" && passInput === "1234") {
        // حفظ الجلسة في LocalStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", userInput);

        showMainApp();
    } else {
        document.getElementById("loginError").innerHTML = "❌ Wrong Username or Password";
    }
}

// 2. دالة إظهار الواجهة الرئيسية وتأكيد تفعيلها
function showMainApp() {
    const loginPage = document.getElementById("loginPage");
    const appContent = document.getElementById("appContent");

    if (loginPage) loginPage.style.display = "none";

    if (appContent) {
        appContent.classList.remove("hidden");
        appContent.style.display = "block";
    }

    // فتح تبويب السكان افتراضياً عند الدخول
    openTab("residents");
}

// 3. دالة تسجيل الخروج (Logout)
function logout() {
    showConfirm("Are you sure you want to log out?", function () {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");

        const loginPage = document.getElementById("loginPage");
        const appContent = document.getElementById("appContent");

        if (loginPage) loginPage.style.display = "flex";
        if (appContent) appContent.style.display = "none";

        document.getElementById("loginUser").value = "";
        document.getElementById("loginPass").value = "";
        document.getElementById("loginError").innerHTML = "";
    });
}

// 4. دالة التحقق من الجلسة
function checkAuthOnLoad() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
        showMainApp();
    } else {
        const loginPage = document.getElementById("loginPage");
        const appContent = document.getElementById("appContent");

        if (loginPage) loginPage.style.display = "flex";
        if (appContent) appContent.style.display = "none";
    }
}

// ==========================================
// CENTRAL INITIALIZATION (ON LOAD)
// ==========================================
// استخدام حدث واحد موحد لمنع أي تضارب
window.addEventListener("DOMContentLoaded", function () {
    // 1. التحقق الفوري من حالة تسجيل الدخول
    checkAuthOnLoad();

    // 2. تحميل استعراض البيانات
    loadCustomers();
    resetMonthlyPayments();
    updateDashboard();

    // 3. تحميل بيانات المالية والمصاريف
    if (typeof renderExpenses === "function" && document.getElementById("expenseTableBody")) {
        renderExpenses();
    }
    updateFinanceDashboard();
});


const loginPassInput = document.getElementById("loginPass");
if (loginPassInput) {
    loginPassInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            login();
        }
    });
}

function togglePassword() {
    const input = document.getElementById("loginPass");
    const icon = document.getElementById("eyeIcon");

    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    }
}

// ======================
// SAVE CUSTOMER
// ======================
if (saveBtn) {
    saveBtn.onclick = function () {
        const parentPhone = document.getElementById("customerParentPhone").value;
        const name = document.getElementById("customerName").value;
        const phone = document.getElementById("customerPhone").value;
        const fileInput = document.getElementById("customerIdImage");

        if (!name) {
            alert("Enter customer name");
            return;
        }

        const i = selectedBed.dataset.index;
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function () {
                customers[i] = {
                    name,
                    phone,
                    parentPhone,
                    paid: "Unpaid",
                    date: new Date().toLocaleString(),
                    idImage: reader.result
                };
                finishSave(i);
            };
            reader.readAsDataURL(file);
        } else {
            customers[i] = {
                name,
                phone,
                parentPhone,
                paid: "Unpaid",
                date: new Date().toLocaleString(),
                idImage: null
            };
            finishSave(i);
        }
    };
}

function finishSave(i) {
    selectedBed.className = "occupied";
    updateBedUI(i);
    saveCustomers();

    selectedBed.style.pointerEvents = "auto";
    modal.style.display = "none";

    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    if (document.getElementById("customerParentPhone")) {
        document.getElementById("customerParentPhone").value = "";
    }
    document.getElementById("customerIdImage").value = "";

    updateDashboard();
}

if (cancelBtn) {
    cancelBtn.onclick = function () {
        modal.style.display = "none";
        document.getElementById("customerName").value = "";
        document.getElementById("customerPhone").value = "";
        if (document.getElementById("customerParentPhone")) {
            document.getElementById("customerParentPhone").value = "";
        }
        document.getElementById("customerIdImage").value = "";
    };
}

document.addEventListener("DOMContentLoaded", function () {
    const cancelEditBtn = document.getElementById("cancelEdit");
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener("click", function () {
            editModal.style.display = "none";
        });
    }
});

// ======================
// CHECKOUT & UPDATE
// ======================
if (checkoutBtn) {
    checkoutBtn.onclick = function () {
        const i = selectedBed.dataset.index;
        if (customers[i]) {
            customers[i].checkOut = new Date().toLocaleDateString();
        }
        customers[i] = null;
        saveCustomers();

        selectedBed.className = "available";
        selectedBed.innerHTML = selectedBed.dataset.bedName;
        selectedBed.disabled = false;

        editModal.style.display = "none";
        updateDashboard();
    };
}

if (updateBtn) {
    updateBtn.onclick = function () {
        const i = selectedBed.dataset.index;

        if (!customers[i]) return;

        customers[i].name = document.getElementById("editName").value;
        customers[i].phone = document.getElementById("editPhone").value;
        customers[i].paid = document.getElementById("editPaid").value;
        customers[i].parentPhone = document.getElementById("editParentPhone").value;

        updateBedUI(i);
        editModal.style.display = "none";

        updateDashboard();
        saveCustomers();
    };
}

// ======================
// DASHBOARD & KPIS
// ======================
function updateDashboard() {
    let occupied = 0;
    let paid = 0;
    let unpaid = 0;
    let revenue = 0;

    for (let i = 0; i < customers.length; i++) {
        const c = customers[i];
        if (c) {
            occupied++;
            if (c.paid === "Paid") {
                paid++;
                revenue += MONTHLY_RENT;
            } else {
                unpaid++;
            }
        }
    }

    if (document.getElementById("occupiedBeds")) document.getElementById("occupiedBeds").innerText = occupied;
    if (document.getElementById("availableBeds")) document.getElementById("availableBeds").innerText = totalBeds - occupied;
    if (document.getElementById("paidCustomers")) document.getElementById("paidCustomers").innerText = paid;
    if (document.getElementById("unpaidCustomers")) document.getElementById("unpaidCustomers").innerText = unpaid;
    if (document.getElementById("revenue")) document.getElementById("revenue").innerText = `$${revenue}`;

    updateFinanceDashboard();
    renderPaidClients();
}

function togglePaid(button, index) {
    if (!customers[index]) return;

    customers[index].paid = customers[index].paid === "Paid" ? "Unpaid" : "Paid";
    const status = customers[index].paid;

    const paidBtn = button.querySelector(".paid-btn");
    paidBtn.innerText = status;
    paidBtn.className = "paid-btn " + (status === "Paid" ? "paid" : "unpaid");

    saveMonthlyPaidRecord();
    updateDashboard();
}

function createPaidButton(index) {
    const btn = document.createElement("button");
    const status = customers[index].paid;

    btn.className = "paid-btn " + (status === "Paid" ? "paid" : "unpaid");
    btn.innerText = status;

    btn.onclick = function (e) {
        e.stopPropagation();

        if (customers[index].paid === "Paid") {
            showConfirm(
                "Are you sure you want to change this customer to Unpaid?",
                function () {
                    customers[index].paid = "Unpaid";
                    saveCustomers();
                    updateBedUI(index);
                    updateDashboard();
                    saveMonthlyPaidRecord();
                }
            );
        } else {
            customers[index].paid = "Paid";
            saveCustomers();
            updateBedUI(index);
            updateDashboard();
            saveMonthlyPaidRecord();
        }
    };
    return btn;
}

function showConfirm(message, callback) {
    document.getElementById("confirmText").innerText = message;
    confirmModal.style.display = "flex";

    confirmOk.onclick = function () {
        confirmModal.style.display = "none";
        callback();
    };

    confirmCancel.onclick = function () {
        confirmModal.style.display = "none";
    };
}

function updateBedUI(index) {
    const button = document.querySelector(`[data-index="${index}"]`);
    const c = customers[index];

    if (!button || !c) return;

    button.className = c.paid === "Unpaid" ? "occupied unpaid-card" : "occupied paid-card";

    button.innerHTML = `
        ${c.idImage ? `<img src="${c.idImage}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;">` : ""}
        <b>${c.name}</b><br>
        ${c.phone || "-"}<br>
        Parent: ${c.parentPhone || "-"}<br>
        ${c.date}<br>
    `;
    button.appendChild(createPaidButton(index));
}

function showKpi(type) {
    const kpiTitle = document.getElementById("kpiTitle");
    const kpiList = document.getElementById("kpiList");
    kpiList.innerHTML = "";

    let title = "";
    let list = [];

    for (let i = 0; i < customers.length; i++) {
        const c = customers[i];

        const bedsPerApartment = rooms * beds;
        const bedsPerFloor = apartments * rooms * beds;

        const floorNumber = Math.floor(i / bedsPerFloor) + 1;
        const apartmentNumber = Math.floor((i % bedsPerFloor) / bedsPerApartment) + 1;
        const roomNumber = Math.floor((i % bedsPerApartment) / beds) + 1;
        const bedNumber = (i % beds) + 1;

        if (type === "available" && !c) {
            list.push({
                type: "available",
                floor: floorNumber,
                apartment: apartmentNumber,
                room: roomNumber,
                bed: bedNumber,
                index: i
            });
        }

        if (c) {
            if (type === "occupied") {
                list.push({ ...c, floor: floorNumber, apartment: apartmentNumber, room: roomNumber, bed: bedNumber });
            }
            if (type === "paid" && c.paid === "Paid") {
                list.push({ ...c, floor: floorNumber, apartment: apartmentNumber, room: roomNumber, bed: bedNumber });
            }
            if (type === "unpaid" && c.paid !== "Paid") {
                list.push({ ...c, floor: floorNumber, apartment: apartmentNumber, room: roomNumber, bed: bedNumber });
            }
        }
    }

    if (type === "occupied") title = "Occupied Customers";
    if (type === "available") title = "Available Beds";
    if (type === "paid") title = "Paid Customers";
    if (type === "unpaid") title = "Unpaid Customers";

    kpiTitle.innerText = title;

    list.forEach(item => {
        const div = document.createElement("div");
        div.className = "kpi-item";

        if (item.type === "available") {
            div.innerHTML = `
                <div class="kpi-title">🛏 Empty Bed</div>
                <div class="kpi-row"><span>Floor</span><b>${item.floor}</b></div>
                <div class="kpi-row"><span>Apartment</span><b>${item.apartment}</b></div>
                <div class="kpi-row"><span>Room</span><b>${item.room}</b></div>
                <div class="kpi-row"><span>Bed</span><b>${item.bed}</b></div>
            `;
        } else {
            div.innerHTML = `
                <div class="kpi-title">${item.name}</div>
                <div class="kpi-row"><span>Floor</span><b>${item.floor}</b></div>
                <div class="kpi-row"><span>Apartment</span><b>${item.apartment}</b></div>
                <div class="kpi-row"><span>Room</span><b>${item.room}</b></div>
                <div class="kpi-row"><span>Bed</span><b>${item.bed}</b></div>
                <div class="kpi-row"><span>Phone</span><b>${item.phone || "-"}</b></div>
                <div class="kpi-row"><span>Status</span><b style="color:${item.paid == "Paid" ? "#22c55e" : "#ef4444"}">${item.paid}</b></div>
            `;
        }
        kpiList.appendChild(div);
    });

    kpiModal.style.display = "flex";
}

function closeKpi() {
    kpiModal.style.display = "none";
}

// ======================
// SEARCH FUNCTIONALITY
// ======================
const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("input", function () {
        const value = this.value.toLowerCase().trim();

        document.querySelectorAll(".floor").forEach(floor => {
            let floorHasResult = false;

            floor.querySelectorAll(".apartment").forEach(apartment => {
                let apartmentHasResult = false;

                apartment.querySelectorAll(".room").forEach(room => {
                    let roomHasResult = false;

                    room.querySelectorAll("button").forEach(btn => {
                        const i = btn.dataset.index;
                        const c = customers[i];

                        const bedsPerApartment = rooms * beds;
                        const bedsPerFloor = apartments * rooms * beds;

                        const floorNumber = Math.floor(i / bedsPerFloor) + 1;
                        const apartmentNumber = Math.floor((i % bedsPerFloor) / bedsPerApartment) + 1;
                        const roomNumber = Math.floor((i % bedsPerApartment) / beds) + 1;
                        const bedNumber = (i % beds) + 1;

                        let match = false;

                        if (value === "") {
                            match = true;
                        } else {
                            if (c) {
                                if (c.name.toLowerCase().includes(value)) match = true;
                                if (c.phone && c.phone.includes(value)) match = true;
                                if (c.paid.toLowerCase().includes(value)) match = true;
                            }

                            if (`floor ${floorNumber}`.toLowerCase().includes(value)) match = true;
                            if (`apartment ${apartmentNumber}`.toLowerCase().includes(value)) match = true;
                            if (`room ${roomNumber}`.toLowerCase().includes(value)) match = true;
                            if (`bed ${bedNumber}`.toLowerCase().includes(value)) match = true;

                            if (floorNumber.toString() === value) match = true;
                            if (apartmentNumber.toString() === value) match = true;
                            if (roomNumber.toString() === value) match = true;
                            if (bedNumber.toString() === value) match = true;
                        }

                        btn.style.visibility = match ? "visible" : "hidden";
                        if (match) roomHasResult = true;
                    });

                    room.style.display = roomHasResult ? "" : "none";
                    if (roomHasResult) apartmentHasResult = true;
                });

                apartment.style.display = apartmentHasResult ? "" : "none";
                if (apartmentHasResult) floorHasResult = true;
            });

            floor.style.display = floorHasResult ? "" : "none";
        });
    });
}

// ======================
// LOCAL STORAGE & RESET
// ======================
function resetMonthlyPayments() {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${now.getMonth()}`;
    const lastReset = localStorage.getItem("lastPaymentReset");

    if (lastReset !== currentKey) {
        saveMonthlyPaidRecord();

        for (let i = 0; i < customers.length; i++) {
            if (customers[i]) {
                customers[i].paid = "Unpaid";
                updateBedUI(i);
            }
        }

        localStorage.setItem("lastPaymentReset", currentKey);
        saveCustomers();
        updateDashboard();
    }
}

function saveCustomers() {
    localStorage.setItem("customers", JSON.stringify(customers));
}

function loadCustomers() {
    for (let i = 0; i < customers.length; i++) {
        if (customers[i]) {
            updateBedUI(i);
        }
    }
    updateDashboard();
}
function getStayDays(dateString) {
    if (!dateString) return "-";

    const start = new Date(dateString);
    const today = new Date();

    const diff = today - start;

    return Math.floor(diff / (1000 * 60 * 60 * 24));
}
// ======================
// HISTORY & RECORDS
// ======================
function saveMonthlyPaidRecord() {
    const now = new Date();
    const key = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const paidCustomers = [];

    for (let i = 0; i < customers.length; i++) {
        const c = customers[i];
        if (!c || c.paid !== "Paid") continue;

        const bedsPerApartment = rooms * beds;
        const bedsPerFloor = apartments * rooms * beds;

        const floor = Math.floor(i / bedsPerFloor) + 1;
        const apartment = Math.floor((i % bedsPerFloor) / bedsPerApartment) + 1;
        const room = Math.floor((i % bedsPerApartment) / beds) + 1;
        const bed = (i % beds) + 1;

        paidCustomers.push({ ...c, floor, apartment, room, bed });
    }

    paymentHistory[key] = paidCustomers;
    localStorage.setItem("paymentHistory", JSON.stringify(paymentHistory));
}

function showHistory() {
    const modalHistory = document.getElementById("historyModal");
    const container = document.getElementById("historyContainer");

    container.innerHTML = "";
    const months = Object.keys(paymentHistory).sort().reverse();

    if (months.length === 0) {
        container.innerHTML = "<p style='padding:15px;'>No payment history available.</p>";
        modalHistory.style.display = "flex";
        return;
    }

    months.forEach(month => {
        const monthTitle = document.createElement("div");
        monthTitle.className = "history-month-title";
        monthTitle.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span>📅 ${month}</span>
                <button class="delete-history-btn" onclick="deleteHistory('${month}')">
                    🗑 Delete
                </button>
            </div>
        `;

        const table = document.createElement("table");
        table.className = "history-table";
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Floor</th>
                    <th>Apartment</th>
                    <th>Room</th>
                    <th>Bed</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        paymentHistory[month].forEach(c => {
            const tr = document.createElement("tr");
            const stayDays = getStayDays(c.date);

let rowColor = "";

if (stayDays >= 90)
    rowColor = "#dcfce7";
else if (stayDays >= 30)
    rowColor = "#fef9c3";
else
    rowColor = "#ffffff";

tr.style.background = rowColor;

tr.innerHTML = `
<td>

<div style="display:flex;align-items:center;gap:12px">

${c.idImage
? `<img src="${c.idImage}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;">`
: `<div style="width:42px;height:42px;border-radius:50%;background:#e2e8f0;
display:flex;align-items:center;justify-content:center;">👤</div>`
}

<div>

<div style="font-weight:700">
${c.name}
</div>

<div style="font-size:11px;color:#94a3b8">
Client #${1000+i}
</div>

</div>

</div>

</td>

<td>

${c.phone || "-"}

<button onclick="navigator.clipboard.writeText('${c.phone || ""}')"
style="
margin-left:8px;
padding:4px 8px;
border:none;
border-radius:6px;
cursor:pointer;
background:#2563eb;
color:white;
">

Copy

</button>

</td>

<td>${c.parentPhone || "-"}</td>

<td>

Floor ${floor}<br>
Apartment ${apartment}<br>
Room ${room}

</td>

<td>Bed ${bed}</td>

<td>

${stayDays} Days

</td>

<td>

${c.lastPayment || "-"}

</td>

<td>

<span class="status-pill-paid">

PAID

</span>

</td>
`;
            tbody.appendChild(tr);
        });

        container.appendChild(monthTitle);
        container.appendChild(table);
    });

    modalHistory.style.display = "flex";
}

function closeHistory() {
    document.getElementById("historyModal").style.display = "none";
}

function deleteHistory(month) {
    showConfirm(
        `Are you sure you want to delete payment history for ${month}?`,
        function () {
            delete paymentHistory[month];
            localStorage.setItem("paymentHistory", JSON.stringify(paymentHistory));
            showHistory();
        }
    );
}

// ======================
// NAVIGATION TABS
// ======================
function openTab(tab) {
    document.getElementById("residentsPage").style.display = "none";
    document.getElementById("financePage").style.display = "none";
    document.getElementById("paidClientsPage").style.display = "none";

    const buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(b => b.classList.remove("active"));

    if (tab === "residents") {
        document.getElementById("residentsPage").style.display = "block";
        if (buttons[0]) buttons[0].classList.add("active");
    }

    if (tab === "finance") {
        document.getElementById("financePage").style.display = "block";
        if (buttons[1]) buttons[1].classList.add("active");
    }

    if (tab === "paidClients") {
        document.getElementById("paidClientsPage").style.display = "block";
        if (buttons[2]) buttons[2].classList.add("active");
        renderPaidClients();
    }
}

// ======================
// EXPENSE MANAGEMENT
// ======================
if (addExpenseBtn) {
    addExpenseBtn.onclick = function () {
        expenseModal.style.display = "flex";
    };
}

if (cancelExpenseBtn) {
    cancelExpenseBtn.onclick = function () {
        expenseModal.style.display = "none";
        document.getElementById("expenseCategory").value = "";
        document.getElementById("expenseDescription").value = "";
        document.getElementById("expenseAmount").value = "";
    };
}

if (saveExpenseBtn) {
    saveExpenseBtn.onclick = function () {
        const category = document.getElementById("expenseCategory").value;
        const description = document.getElementById("expenseDescription").value;
        const amount = Number(document.getElementById("expenseAmount").value);

        if (!category || !amount) {
            alert("Please enter category and amount");
            return;
        }

        const expense = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            category,
            description,
            amount
        };

        expenses.push(expense);
        saveExpenses();
        renderExpenses();

        expenseModal.style.display = "none";
        document.getElementById("expenseCategory").value = "";
        document.getElementById("expenseDescription").value = "";
        document.getElementById("expenseAmount").value = "";
    };
}

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function renderExpenses() {
    if (!expenseTableBody) return;
    expenseTableBody.innerHTML = "";

    expenses.forEach(expense => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${expense.date}</td>
            <td>${expense.category}</td>
            <td>${expense.description || "-"}</td>
            <td>$${expense.amount}</td>
            <td>
                <button onclick="deleteExpense(${expense.id})" style="background:#ef4444;color:white;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;">
                    Delete
                </button>
            </td>
        `;
        expenseTableBody.appendChild(row);
    });

    updateFinanceDashboard();
}

function deleteExpense(id) {
    showConfirm("Delete this expense?", function () {
        expenses = expenses.filter(e => e.id !== id);
        saveExpenses();
        renderExpenses();
    });
}

function updateFinanceDashboard() {
    let revenue = 0;
    customers.forEach(c => {
        if (c && c.paid === "Paid") {
            revenue += MONTHLY_RENT;
        }
    });

    let expensesTotal = 0;
    expenses.forEach(e => {
        expensesTotal += Number(e.amount);
    });

    const profit = revenue - expensesTotal;

    const financeRevenue = document.getElementById("financeRevenue");
    const financeExpenses = document.getElementById("financeExpenses");
    const profitBox = document.getElementById("financeProfit");

    if (financeRevenue) financeRevenue.innerHTML = "$" + revenue;
    if (financeExpenses) financeExpenses.innerHTML = "$" + expensesTotal;

    if (profitBox) {
        if (profit >= 0) {
            profitBox.innerHTML = "🟢 $" + profit;
            profitBox.style.color = "#22c55e";
        } else {
            profitBox.innerHTML = "🔴 -$" + Math.abs(profit);
            profitBox.style.color = "#ef4444";
        }
    }
}

// ======================
// PAID CLIENTS TAB (PROFESSIONAL RENDER & FILTER)
// ==========================================
// ENTERPRISE PAID CLIENTS RENDER & EXPORT
// ==========================================

function renderPaidClients() {
    const body = document.getElementById("paidClientsBody");
    const countElem = document.getElementById("paidClientsCount");
    const totalRevElem = document.getElementById("paidClientsTotalRev");
    const rateElem = document.getElementById("paidRatePercentage");

    if (!body) return;

    body.innerHTML = "";
    let paidCount = 0;
    let totalOccupied = 0;

    for (let i = 0; i < customers.length; i++) {
        const c = customers[i];
        if (!c) continue;
        
        totalOccupied++;
        if (c.paid !== "Paid") continue;

        paidCount++;

        const bedsPerApartment = rooms * beds;
        const bedsPerFloor = apartments * rooms * beds;

        const floor = Math.floor(i / bedsPerFloor) + 1;
        const apartment = Math.floor((i % bedsPerFloor) / bedsPerApartment) + 1;
        const room = Math.floor((i % bedsPerApartment) / beds) + 1;
        const bed = (i % beds) + 1;

        const tr = document.createElement("tr");
        tr.dataset.floor = floor; // لتصفية الأدوار

        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:12px;">
                    ${c.idImage ? `<img src="${c.idImage}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:1px solid #e2e8f0;">` : '<div style="width:38px;height:38px;border-radius:50%;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:16px;">👤</div>'}
                    <div>
                        <strong style="color:#0f172a; font-size:14px;">${c.name}</strong>
                        <div style="font-size:11px; color:#94a3b8;">Ref: #${1000 + i}</div>
                    </div>
                </div>
            </td>
            <td><strong>${c.phone || "-"}</strong></td>
            <td><span style="color:#64748b;">${c.parentPhone || "-"}</span></td>
            <td>
                <span class="location-badge">
                    Fl ${floor} • Apt ${apartment} • Rm ${room}
                </span>
            </td>
            <td><b>Bed ${bed}</b></td>
            <td><span class="status-pill-paid">PAID</span></td>
        `;
        body.appendChild(tr);
    }

    // Update KPI Cards
    if (countElem) countElem.innerText = paidCount;
    if (totalRevElem) totalRevElem.innerText = `$${paidCount * MONTHLY_RENT}`;
    
    // Settlement Rate Percentage
    const rate = totalOccupied > 0 ? Math.round((paidCount / totalOccupied) * 100) : 0;
    if (rateElem) rateElem.innerText = `${rate}%`;

    filterPaidClients();
}

// Live Filter (Search Text + Floor Filter)
function filterPaidClients() {
    const input = document.getElementById("paidSearchInput");
    const floorSelect = document.getElementById("paidFloorFilter");
    
    const filterText = input ? input.value.toLowerCase().trim() : "";
    const selectedFloor = floorSelect ? floorSelect.value : "all";

    const rows = document.querySelectorAll("#paidClientsBody tr");

    rows.forEach(row => {
        const textMatch = row.innerText.toLowerCase().includes(filterText);
        const floorMatch = selectedFloor === "all" || row.dataset.floor === selectedFloor;

        row.style.display = (textMatch && floorMatch) ? "" : "none";
    });
}

// Export Paid Clients Data to CSV
function exportPaidToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Name,Phone,Parent Phone,Location,Bed,Status\n";

    for (let i = 0; i < customers.length; i++) {
        const c = customers[i];
        if (!c || c.paid !== "Paid") continue;

        const bedsPerApartment = rooms * beds;
        const bedsPerFloor = apartments * rooms * beds;

        const floor = Math.floor(i / bedsPerFloor) + 1;
        const apartment = Math.floor((i % bedsPerFloor) / bedsPerApartment) + 1;
        const room = Math.floor((i % bedsPerApartment) / beds) + 1;
        const bed = (i % beds) + 1;

        const location = `Floor ${floor} Apt ${apartment} Room ${room}`;
        csvContent += `"${c.name}","${c.phone || ''}","${c.parentPhone || ''}","${location}","Bed ${bed}","Paid"\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Paid_Clients_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ======================
// GLOBAL EVENT LISTENERS & INITIALIZATION
// ======================
window.addEventListener("click", function (e) {
    if (e.target === modal) modal.style.display = "none";
    if (e.target === editModal) editModal.style.display = "none";
    if (e.target === confirmModal) confirmModal.style.display = "none";
    if (e.target === kpiModal) kpiModal.style.display = "none";

    const historyModal = document.getElementById("historyModal");
    if (historyModal && e.target === historyModal) {
        historyModal.style.display = "none";
    }

    if (e.target === expenseModal) expenseModal.style.display = "none";
});
