import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs, deleteDoc, query,orderBy,updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

window.onload = function () {
    let name = localStorage.getItem("name");
    if (!name) {
        name = prompt("Enter your name:");
        if (name) {
            localStorage.setItem("name", name);
        }
    }
};
let name = localStorage.getItem("name");

async function addTransaction() {
    let amount = document.getElementById("amount").value.trim();
    let description = document.getElementById("description").value.trim();
    let transactionType = document.getElementById("transactionType").value;

    if (amount === "" || description === "") {
        Swal.fire("Error!", "Please enter both Amount and Description.", "error");
        return;
    }

    amount = parseFloat(amount);
    if (transactionType === "expense") amount = -amount;

    await addDoc(collection(db, name), {
        amount: amount,
        description: description,
        type: transactionType,
        date: new Date().toISOString()
    });

    document.getElementById("amount").value = "";
    document.getElementById("description").value = "";
    loadTransactions();
}


async function loadTransactions() {
    let historyList = document.getElementById("historyList");
    let totalBalance = document.getElementById("totalBalance");
    let balance = 0;
    historyList.innerHTML = "";

    // Get filter values
    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;

    // Convert to Date objects for comparison
    let startTimestamp = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    let endTimestamp = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

    // Query Firestore with sorting by date
    const transactionsQuery = query(collection(db, name), orderBy("date", "desc")); // Change to "asc" for ascending order
    const querySnapshot = await getDocs(transactionsQuery);

    querySnapshot.forEach(docSnap => {
        let transaction = docSnap.data();
        let transactionId = docSnap.id;
        let transactionDate = new Date(transaction.date).getTime(); // Convert Firestore date to timestamp

        // Apply date filter
        if ((startTimestamp && transactionDate < startTimestamp) || (endTimestamp && transactionDate > endTimestamp)) {
            return; // Skip transactions outside the date range
        }

        balance += transaction.amount;

        let div = document.createElement("div");
        div.classList.add("history-item", transaction.type);
        div.innerHTML = `
            <span>${new Date(transaction.date).toLocaleString()}</span>
            <span><strong>${transaction.description}</strong></span>
            <span>${Math.abs(transaction.amount)}</span>
            <span>
                <button class="edit-btn" onclick="editTransaction('${transactionId}', '${transaction.description}', '${transaction.amount}')">Edit</button>
            </span>
            <span>
                <button class="delete-btn" onclick="deleteTransaction('${transactionId}')">Delete</button>
            </span>
        `;
        historyList.appendChild(div);
    });

    totalBalance.innerText = `${balance}`;
}


async function editTransaction(id, oldDescription, oldAmount) {
    const { value: formValues } = await Swal.fire({
        title: "Edit Transaction",
        html: `
            <input id="newDescription" class="swal2-input" placeholder="Description" value="${oldDescription}">
            <input id="newAmount" class="swal2-input" type="number" placeholder="Amount" value="${Math.abs(oldAmount)}">
        `,
        focusConfirm: false,
        preConfirm: () => {
            return [
                document.getElementById("newDescription").value,
                document.getElementById("newAmount").value
            ];
        }
    });

    if (!formValues) return;

    let newDescription = formValues[0].trim();
    let newAmount = parseFloat(formValues[1]);

    if (newDescription === "" || isNaN(newAmount)) {
        Swal.fire("Error!", "Invalid input!", "error");
        return;
    }

    await updateDoc(doc(db, name, id), {
        description: newDescription,
        amount: oldAmount < 0 ? -newAmount : newAmount
    });

    loadTransactions();
}

async function deleteTransaction(id) {
    await deleteDoc(doc(db, name, id));
    loadTransactions();
}

async function deleteAll() {
    const querySnapshot = await getDocs(collection(db, name));
    querySnapshot.forEach(async (transaction) => {
        await deleteDoc(doc(db, name, transaction.id));
    });
    loadTransactions();
}

async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Income & Expense Report", 60, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 60, 22);

    let y = 40;
    let balance = 0;
    const querySnapshot = await getDocs(collection(db, name));

    // Table Header
    doc.setFont("helvetica", "bold");
    doc.setFillColor(200, 200, 200); // Gray background for header
    doc.rect(10, y - 5, 190, 10, "F"); // Header background
    doc.text("Date", 12, y);
    doc.text("Description", 70, y);
    doc.text("Type", 130, y);
    doc.text("Amount", 160, y);

    y += 10;
    doc.setFont("helvetica", "normal");

    // Table Content
    querySnapshot.forEach((transactionSnap) => {
        let transaction = transactionSnap.data();
        let type = transaction.amount < 0 ? "Expense" : "Income"; // Determine type
        let amount = Math.abs(transaction.amount); // Remove negative sign

        balance += transaction.amount;

        doc.text(new Date(transaction.date).toLocaleString(), 12, y);
        doc.text(transaction.description, 70, y);
        doc.text(type, 130, y); // Show "Income" or "Expense"
        doc.text(`${amount}`, 160, y); // Show absolute amount

        y += 8; // Row spacing
    });

    // Footer
    doc.setFont("helvetica", "bold");
    doc.text(`Total Balance: ${balance}`, 12, y + 10);

    // Save the file
    doc.save("Income_Expense_Report.pdf");
}

async function downloadImage() {
    const element = document.getElementById("exportSection"); // The section to capture

    html2canvas(element, { scale: 2 }).then(canvas => {
        let link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "Income_Expense_Report.png";
        link.click();
    });
}

window.downloadImage = downloadImage;
window.addTransaction = addTransaction;
window.loadTransactions = loadTransactions;
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
window.deleteAll = deleteAll;
window.downloadPDF = downloadPDF;

document.addEventListener("DOMContentLoaded", loadTransactions);
