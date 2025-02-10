document.addEventListener("DOMContentLoaded", loadTransactions);

function addTransaction() {
    let amount = document.getElementById("amount").value.trim();
    let description = document.getElementById("description").value.trim();
    let transactionType = document.getElementById("transactionType").value;

    if (amount === "" || description === "") {
        Swal.fire("Error!", "Please enter both Amount and Description.", "error");
        return;
    }

    amount = parseFloat(amount);
    if (transactionType === "expense") amount = -amount;

    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    transactions.push({
        id: Date.now(),
        amount: amount,
        description: description,
        type: transactionType,
        date: new Date().toLocaleString()
    });

    localStorage.setItem("transactions", JSON.stringify(transactions));
    document.getElementById("amount").value = "";
    document.getElementById("description").value = "";
    loadTransactions();
}

function loadTransactions() {
    let historyList = document.getElementById("historyList");
    let totalBalance = document.getElementById("totalBalance");
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    let balance = 0;

    historyList.innerHTML = "";
    transactions.forEach((transaction) => {
        balance += transaction.amount;

        let div = document.createElement("div");
        div.classList.add("history-item", transaction.type);
        div.innerHTML = `
           <span> ${transaction.date}</span>
           <span> <strong>${transaction.description}</strong></span>
          <span>  ${Math.abs(transaction.amount)} </span>
            <span class="edit-btn" onclick="editTransaction(${transaction.id})">Edit</span>
            <span class="delete-btn-small" onclick="deleteTransaction(${transaction.id})">Delete</span>
        `;
        historyList.appendChild(div);
    });

    totalBalance.innerText = `${balance}`;
}

function editTransaction(id) {
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    let transaction = transactions.find(t => t.id === id);

    Swal.fire({
        title: "Edit Transaction",
        html: `
            <input id="editAmount" type="number" value="${Math.abs(transaction.amount)}">
            <input id="editDescription" type="text" value="${transaction.description}">
        `,
        showCancelButton: true,
        confirmButtonText: "Save",
    }).then((result) => {
        if (result.isConfirmed) {
            let newAmount = parseFloat(document.getElementById("editAmount").value);
            let newDescription = document.getElementById("editDescription").value.trim();

            if (newAmount > 0 && newDescription !== "") {
                transaction.amount = transaction.type === "expense" ? -newAmount : newAmount;
                transaction.description = newDescription;

                localStorage.setItem("transactions", JSON.stringify(transactions));
                loadTransactions();
                Swal.fire("Updated!", "Transaction has been updated.", "success");
            }
        }
    });
}

function deleteTransaction(id) {
    Swal.fire({
        title: "Are you sure?",
        text: "This transaction will be deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
    }).then((result) => {
        if (result.isConfirmed) {
            let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
            transactions = transactions.filter(t => t.id !== id);

            localStorage.setItem("transactions", JSON.stringify(transactions));
            loadTransactions();

            Swal.fire("Deleted!", "Transaction has been removed.", "success");
        }
    });
}

function deleteAll() {
    Swal.fire({
        title: "Delete All Transactions?",
        text: "This will remove all records!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete everything!",
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("transactions");
            loadTransactions();

            Swal.fire("Deleted!", "All transactions have been removed.", "success");
        }
    });
}
