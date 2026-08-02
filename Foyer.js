// ======================
// CONFIG
// ======================

let paymentHistory = JSON.parse(localStorage.getItem("paymentHistory")) || {};
const building = document.getElementById("building");

const floors = 6;
const apartments = 4;
const rooms = 3;
const beds = 2;
// ======================
// EXPENSE STATE
// ======================

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
const totalBeds = floors * apartments * rooms * beds;
const MONTHLY_RENT = 235;
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

    const i = button.dataset.index;
    const customer = customers[i];

    // إذا فيه زبون → افتح edit
    if (customer) {

        document.getElementById("editName").value = customer.name;
        document.getElementById("editPhone").value = customer.phone;
        document.getElementById("editPaid").value = customer.paid;
document.getElementById("editParentPhone").value = customer.parentPhone || "";
        editModal.style.display = "flex";
        return;
    }

    // إذا فاضي → add new
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
function login(){

    const user = document.getElementById("loginUser").value;

    const pass = document.getElementById("loginPass").value;

    if(user==="admin" && pass==="1234"){

        document.getElementById("loginPage").style.display="none";

        document.getElementById("appContent").style.display="block";

    }else{

        document.getElementById("loginError").innerHTML="❌ Wrong Username or Password";

    }

}

document.getElementById("loginPass").addEventListener("keypress",function(e){

    if(e.key==="Enter"){

        login();

    }

});
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
                    parentPhone: "",   // 🔥 جديد

                paid: "Unpaid",
                date: new Date().toLocaleString(),
                idImage: reader.result // 🔥 base64 image
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
function finishSave(i) {

    selectedBed.className = "occupied";

    updateBedUI(i);
    saveCustomers();

    selectedBed.style.pointerEvents = "auto";

    modal.style.display = "none";

    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("customerIdImage").value = "";

    updateDashboard();
}
// ======================
// CANCEL MODAL
// ======================
document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("cancelEdit").addEventListener("click", function () {
        editModal.style.display = "none";
    });

});
// CHECKOUT
// ======================
checkoutBtn.onclick = function () {

    const i = selectedBed.dataset.index;
customers[i].checkOut = new Date().toLocaleDateString();
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
customers[i].parentPhone = document.getElementById("editParentPhone").value;
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

    document.getElementById("occupiedBeds").innerText = occupied;
    document.getElementById("availableBeds").innerText = totalBeds - occupied;
    document.getElementById("paidCustomers").innerText = paid;
    document.getElementById("unpaidCustomers").innerText = unpaid;

    // KPI الجديد
    document.getElementById("revenue").innerText = `$${revenue}`;
    updateFinanceDashboard();
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
const confirmModal = document.getElementById("confirmModal");
const confirmOk = document.getElementById("confirmOk");
const confirmCancel = document.getElementById("confirmCancel");

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

    button.className =
        c.paid === "Unpaid"
            ? "occupied unpaid-card"
            : "occupied paid-card";

button.innerHTML = `
    ${c.idImage ? `<img src="${c.idImage}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;">` : ""}
    <b>${c.name}</b><br>
    ${c.phone || "-"}<br>
    Parent: ${c.parentPhone || "-"}<br>
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
            <b style="color:${item.paid == "Paid" ? "#22c55e" : "#ef4444"}">
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

    document.querySelectorAll(".floor").forEach(floor => {

        let floorHasResult = false;

        floor.querySelectorAll(".apartment").forEach(apartment => {

            let apartmentHasResult = false;

            apartment.querySelectorAll(".room").forEach(room => {

                let roomHasResult = false;

                room.querySelectorAll("button").forEach(btn => {

                    const i = btn.dataset.index;
                    const c = customers[i];
const bedsPerRoom = beds;
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

                            if (c.name.toLowerCase().includes(value))
                                match = true;

                            if (c.phone && c.phone.includes(value))
                                match = true;

                            if (c.paid.toLowerCase().includes(value))
                                match = true;
                        }

                        // رقم السرير
// البحث بالطابق
if (`floor ${floorNumber}`.toLowerCase().includes(value))
    match = true;

// البحث بالشقة
if (`apartment ${apartmentNumber}`.toLowerCase().includes(value))
    match = true;

// البحث بالغرفة
if (`room ${roomNumber}`.toLowerCase().includes(value))
    match = true;

// البحث بالسرير
if (`bed ${bedNumber}`.toLowerCase().includes(value))
    match = true;

// البحث بالأرقام فقط
if (floorNumber.toString() === value)
    match = true;

if (apartmentNumber.toString() === value)
    match = true;

if (roomNumber.toString() === value)
    match = true;

if (bedNumber.toString() === value)
    match = true;
                    }

btn.style.visibility = match ? "visible" : "hidden";
                    if (match)
                        roomHasResult = true;

                });

room.style.display = roomHasResult ? "" : "none";

                if (roomHasResult)
                    apartmentHasResult = true;

            });

apartment.style.display = apartmentHasResult ? "" : "none";

            if (apartmentHasResult)
                floorHasResult = true;

        });

floor.style.display = floorHasResult ? "" : "none";
    });

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

    if(expenseTableBody){
        renderExpenses();
    }
    updateFinanceDashboard();

};
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

        paidCustomers.push({
            ...c,
            floor,
            apartment,
            room,
            bed
        });
    }

    paymentHistory[key] = paidCustomers;

    localStorage.setItem(
        "paymentHistory",
        JSON.stringify(paymentHistory)
    );
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
                    <th>appartement</th>
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
<tr>
    <td>👤 ${c.name}</td>
    <td>📞 ${c.phone || "-"}</td>
    <td>${c.floor}</td>
    <td>${c.apartment}</td>
    <td>${c.room}</td>
    <td>${c.bed}</td>
</tr>
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
function deleteHistory(month) {

    showConfirm(
        `Are you sure you want to delete payment history for ${month}?`,
        function () {

            delete paymentHistory[month];

            localStorage.setItem(
                "paymentHistory",
                JSON.stringify(paymentHistory)
            );

            showHistory(); // إعادة تحديث النافذة
        }
    );
}
window.addEventListener("click", function (e) {

    // إغلاق مودال الإضافة
    if (e.target === modal) {
        modal.style.display = "none";
    }

    // إغلاق مودال التعديل
    if (e.target === editModal) {
        editModal.style.display = "none";
    }

    // إغلاق مودال التأكيد
    if (e.target === confirmModal) {
        confirmModal.style.display = "none";
    }

    // إغلاق KPI
    if (e.target === kpiModal) {
        kpiModal.style.display = "none";
    }

    // إغلاق التاريخ
    const historyModal = document.getElementById("historyModal");
    if (historyModal && e.target === historyModal) {
        historyModal.style.display = "none";
    }
});
cancelBtn.onclick = function () {
  
    modal.style.display = "none";

    // تنظيف الحقول
    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("customerIdImage").value = "";
};
function openTab(tab){

    const residents = document.getElementById("residentsPage");
    const finance = document.getElementById("financePage");

    const buttons = document.querySelectorAll(".tab-btn");


    if(tab === "residents"){

        residents.style.display = "block";
        finance.style.display = "none";

        buttons[0].classList.add("active");
        buttons[1].classList.remove("active");

    }


    if(tab === "finance"){

        residents.style.display = "none";
        finance.style.display = "block";

        buttons[1].classList.add("active");
        buttons[0].classList.remove("active");

    }

}
// ======================
// FINANCE ELEMENTS
// ======================

const expenseModal = document.getElementById("expenseModal");
const addExpenseBtn = document.getElementById("addExpenseBtn");
const saveExpenseBtn = document.getElementById("saveExpense");
const cancelExpenseBtn = document.getElementById("cancelExpense");
const expenseTableBody = document.getElementById("expenseTableBody");
// OPEN EXPENSE MODAL

addExpenseBtn.onclick = function(){

    expenseModal.style.display="flex";

};
cancelExpenseBtn.onclick=function(){

    expenseModal.style.display="none";


    document.getElementById("expenseCategory").value="";
    document.getElementById("expenseDescription").value="";
    document.getElementById("expenseAmount").value="";

};
saveExpenseBtn.onclick=function(){

    const category =
    document.getElementById("expenseCategory").value;


    const description =
    document.getElementById("expenseDescription").value;


    const amount =
    Number(document.getElementById("expenseAmount").value);



    if(!category || !amount){

        alert("Please enter category and amount");

        return;

    }



    const expense={

        id:Date.now(),

        date:new Date().toLocaleDateString(),

        category,

        description,

        amount

    };



    expenses.push(expense);



    saveExpenses();



    renderExpenses();



    expenseModal.style.display="none";



    document.getElementById("expenseCategory").value="";

    document.getElementById("expenseDescription").value="";

    document.getElementById("expenseAmount").value="";


};
function saveExpenses(){

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

}
function renderExpenses(){


    expenseTableBody.innerHTML="";



    expenses.forEach(expense=>{


        const row=document.createElement("tr");


        row.innerHTML=`

        <td>${expense.date}</td>

        <td>${expense.category}</td>

        <td>${expense.description || "-"}</td>

        <td>$${expense.amount}</td>


        <td>

        <button
        onclick="deleteExpense(${expense.id})"
        style="
        background:#ef4444;
        color:white;
        border:none;
        padding:6px 10px;
        border-radius:6px;
        cursor:pointer;">
        
        Delete
        
        </button>


        </td>


        `;


        expenseTableBody.appendChild(row);


    });

updateFinanceDashboard();
}
function updateFinanceDashboard(){

    // الإيرادات
    let revenue = 0;

    customers.forEach(c=>{

        if(c && c.paid==="Paid"){

            revenue += MONTHLY_RENT;

        }

    });


    // المصاريف
    let expensesTotal = 0;

    expenses.forEach(e=>{

        expensesTotal += Number(e.amount);

    });


    // الربح
    const profit = revenue - expensesTotal;


    document.getElementById("financeRevenue").innerHTML =
        "$" + revenue;

    document.getElementById("financeExpenses").innerHTML =
        "$" + expensesTotal;

    const profitBox =
        document.getElementById("financeProfit");

    if(profit >= 0){

        profitBox.innerHTML =
            "🟢 $" + profit;

        profitBox.style.color="#22c55e";

    }else{

        profitBox.innerHTML =
            "🔴 -$" + Math.abs(profit);

        profitBox.style.color="#ef4444";

    }

}
function deleteExpense(id){


    showConfirm(
        "Delete this expense?",
        function(){


            expenses =
            expenses.filter(e=>e.id !== id);



            saveExpenses();


            renderExpenses();


        }
    );


}
