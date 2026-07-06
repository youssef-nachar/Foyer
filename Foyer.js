// ======================
// CONFIG
// ======================

let paymentHistory = JSON.parse(localStorage.getItem("paymentHistory")) || {};
const building = document.getElementById("building");

const floors = 6;
const apartments = 4;
const rooms = 3;
const beds = 2;

const totalBeds = floors * apartments * rooms * beds;

// ======================
// STATE
// ======================
let customers = JSON.parse(localStorage.getItem("customers"));

if (!customers) {
    customers = new Array(totalBeds).fill(null);
}

let selectedBed = null;

// Modals
const modal = document.getElementById("customerModal");
const editModal = document.getElementById("editModal");

// Buttons
const saveBtn = document.getElementById("saveCustomer");
const cancelBtn = document.getElementById("cancelCustomer");
const checkoutBtn = document.getElementById("checkoutCustomer");
const updateBtn = document.getElementById("updateCustomer");

// ======================
// BUILD UI
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

                // مهم جداً
                button.dataset.index = index;
                button.dataset.bedName = `Bed ${bed}`;

                // CLICK
                button.onclick = function () {
                    selectedBed = button;
                    modal.style.display = "block";
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

                    editModal.style.display = "block";
                };

                roomDiv.appendChild(button);

                index++;
            }

            apartmentDiv.appendChild(roomDiv);
        }

        apartmentContainer.appendChild(apartmentDiv);
    }

    floorDiv.appendChild(apartmentContainer);
    building.appendChild(floorDiv);
}

// ======================
// SAVE CUSTOMER
// ======================
saveBtn.onclick = function () {

    const name = document.getElementById("customerName").value;
    const phone = document.getElementById("customerPhone").value;

    if (!name) {
        alert("Enter customer name");
        return;
    }

    const i = selectedBed.dataset.index;

    customers[i] = {
    name,
    phone,
    paid: "Unpaid",
    date: new Date().toLocaleString()
};

    selectedBed.className = "occupied";

   // const paidStatus = paid === "Paid" ? "Paid" : "Unpaid";

updateBedUI(i);
saveCustomers();
    selectedBed.style.pointerEvents = "auto";

    modal.style.display = "none";

    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    
    updateDashboard();
};

// ======================
// CANCEL MODAL
// ======================
cancelBtn.onclick = function () {
    modal.style.display = "none";
};

// ======================
// CHECKOUT
// ======================
checkoutBtn.onclick = function () {

    const i = selectedBed.dataset.index;

    customers[i] = null;
saveCustomers();
    selectedBed.className = "available";
    selectedBed.innerHTML = selectedBed.dataset.bedName;
    selectedBed.disabled = false;

    editModal.style.display = "none";

    updateDashboard();
};

// ======================
// UPDATE CUSTOMER
// ======================
updateBtn.onclick = function () {

    const i = selectedBed.dataset.index;

    if (!customers[i]) return;

    customers[i].name = document.getElementById("editName").value;
    customers[i].phone = document.getElementById("editPhone").value;
    customers[i].paid = document.getElementById("editPaid").value;

    updateBedUI(i);
    editModal.style.display = "none";

    updateDashboard();
    saveCustomers();
};

// ======================
// DASHBOARD KPIs
// ======================
function updateDashboard() {

    let occupied = 0;
    let paid = 0;
    let unpaid = 0;

    for (let i = 0; i < customers.length; i++) {

        const c = customers[i];

        if (c) {
            occupied++;

            if (c.paid === "Paid") paid++;
            else unpaid++;
        }
    }

    document.getElementById("occupiedBeds").innerText = occupied;
    document.getElementById("availableBeds").innerText = totalBeds - occupied;
    document.getElementById("paidCustomers").innerText = paid;
    document.getElementById("unpaidCustomers").innerText = unpaid;
}

// ======================
// INIT DASHBOARD
// ======================
updateDashboard();
function togglePaid(button, index) {

    if (!customers[index]) return;

    customers[index].paid =
        customers[index].paid === "Paid" ? "Unpaid" : "Paid";

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
        e.stopPropagation(); // يمنع فتح المودال

        customers[index].paid =
            customers[index].paid === "Paid" ? "Unpaid" : "Paid";
saveCustomers();
        updateBedUI(index);
        updateDashboard();
        saveCustomers();
saveMonthlyPaidRecord();

    };

    return btn;
}
function updateBedUI(index) {
    const button = document.querySelector(`[data-index="${index}"]`);
    const c = customers[index];

    if (!button || !c) return;

    button.className = "occupied";

    button.innerHTML = `
        <b>${c.name}</b><br>
        ${c.phone}<br>
        ${c.date}<br>
    `;

    button.appendChild(createPaidButton(index));
}
const kpiModal = document.getElementById("kpiModal");
const kpiTitle = document.getElementById("kpiTitle");
const kpiList = document.getElementById("kpiList");

function showKpi(type) {

    kpiList.innerHTML = "";

    let title = "";
    let list = [];

    for (let i = 0; i < customers.length; i++) {

        const c = customers[i];

        // حساب الموقع الجغرافي داخل المبنى
        const bedsPerRoom = beds;
        const bedsPerApartment = rooms * beds;
        const bedsPerFloor = apartments * rooms * beds;

        const floorNumber = Math.floor(i / bedsPerFloor) + 1;

        const apartmentNumber =
            Math.floor((i % bedsPerFloor) / bedsPerApartment) + 1;

        const roomNumber =
            Math.floor((i % bedsPerApartment) / beds) + 1;

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

    // العنوان
    if (type === "occupied") title = "Occupied Customers";
    if (type === "available") title = "Available Beds";
    if (type === "paid") title = "Paid Customers";
    if (type === "unpaid") title = "Unpaid Customers";

    kpiTitle.innerText = title;

    // العرض
    list.forEach(item => {

        const div = document.createElement("div");
        div.className = "kpi-item";

if (item.type === "available") {

    div.innerHTML = `
        <div class="kpi-title">🛏 Empty Bed</div>

        <div class="kpi-row">
            <span>Floor</span>
            <b>${item.floor}</b>
        </div>

        <div class="kpi-row">
            <span>Apartment</span>
            <b>${item.apartment}</b>
        </div>

        <div class="kpi-row">
            <span>Room</span>
            <b>${item.room}</b>
        </div>

        <div class="kpi-row">
            <span>Bed</span>
            <b>${item.bed}</b>
        </div>
    `;

} else {

    div.innerHTML = `
        <div class="kpi-title">${item.name}</div>

        <div class="kpi-row">
            <span>Floor</span>
            <b>${item.floor}</b>
        </div>

        <div class="kpi-row">
            <span>Apartment</span>
            <b>${item.apartment}</b>
        </div>

        <div class="kpi-row">
            <span>Room</span>
            <b>${item.room}</b>
        </div>

        <div class="kpi-row">
            <span>Bed</span>
            <b>${item.bed}</b>
        </div>

        <div class="kpi-row">
            <span>Phone</span>
            <b>${item.phone || "-"}</b>
        </div>

        <div class="kpi-row">
            <span>Status</span>
            <b style="color:${item.paid=="Paid" ? "#22c55e" : "#ef4444"}">
                ${item.paid}
            </b>
        </div>
    `;
}
        kpiList.appendChild(div);
    });

    kpiModal.style.display = "flex";
}

function closeKpi() {
    kpiModal.style.display = "none";
}
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase().trim();

    for (let i = 0; i < customers.length; i++) {

        const btn = document.querySelector(`[data-index="${i}"]`);
        const c = customers[i];

        if (!btn) continue;

        // reset visibility
        btn.style.display = "block";

        if (value === "") continue;

        let match = false;

        // 1. search by name / phone
        if (c) {
            if (c.name.toLowerCase().includes(value)) match = true;
            if (c.phone && c.phone.includes(value)) match = true;
            if (c.paid && c.paid.toLowerCase().includes(value)) match = true;
        }

        // 2. search by bed index
        const bedNumber = i + 1;
        if (bedNumber.toString().includes(value)) match = true;

        // 3. search by room/apartment logic
        const bedsPerRoom = beds;
        const bedsPerApartment = rooms * beds;

        const apartmentNumber = Math.floor(i / bedsPerApartment) + 1;
        const roomNumber = Math.floor((i % bedsPerApartment) / beds) + 1;

        if (apartmentNumber.toString().includes(value)) match = true;
        if (roomNumber.toString().includes(value)) match = true;

        // hide or show
        btn.style.display = match ? "block" : "none";
    }
});

function resetMonthlyPayments() {

    const now = new Date();
    const currentKey = `${now.getFullYear()}-${now.getMonth()}`;

    const lastReset = localStorage.getItem("lastPaymentReset");

    if (lastReset !== currentKey) {

        // 🔥 قبل التصفير: خزّن الشهر السابق
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
window.onload = function () {
    loadCustomers();
    resetMonthlyPayments();
    updateDashboard();
};
function saveMonthlyPaidRecord() {

    const now = new Date();
    const key = `${now.getFullYear()}-${now.getMonth()}`;

    const paidCustomers = customers.filter(c => c && c.paid === "Paid");

    paymentHistory[key] = paidCustomers;

    localStorage.setItem("paymentHistory", JSON.stringify(paymentHistory));
}
function showHistory() {

    const modal = document.getElementById("historyModal");
    const container = document.getElementById("historyContainer");

    container.innerHTML = "";

    const months = Object.keys(paymentHistory).sort().reverse();

    if (months.length === 0) {
        container.innerHTML = "<p style='padding:15px;'>No payment history available.</p>";
        modal.style.display = "flex";
        return;
    }

    months.forEach(month => {

        const monthTitle = document.createElement("div");
        monthTitle.className = "history-month-title";
        monthTitle.innerHTML = `📅 ${month}`;

        const table = document.createElement("table");
        table.className = "history-table";

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Floor</th>
                    <th>Room</th>
                    <th>Bed</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        paymentHistory[month].forEach(c => {

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>👤 ${c.name}</td>
                <td>📞 ${c.phone || "-"}</td>
                <td>${c.floor || "-"}</td>
                <td>${c.room || "-"}</td>
                <td>${c.bed || "-"}</td>
            `;

            tbody.appendChild(tr);
        });

        container.appendChild(monthTitle);
        container.appendChild(table);
    });

    modal.style.display = "flex";
}
function closeHistory() {
    document.getElementById("historyModal").style.display = "none";
}
