function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) return value;
  }
  return null;
}

window.onload = () => {
  const auth = getCookie("auth");

  // no cookie → not logged in
  if (!auth) {
    redirectToLogin();
    return;
  }

  // allow only 1 day session
  const oneDay = 24 * 60 * 60 * 1000;

  if (Date.now() - Number(auth) > oneDay) {
    redirectToLogin();
  }
};

function redirectToLogin() {
  document.cookie = "auth=; Max-Age=0; path=/";
  window.location.href = "/login.html";
}

const button = document.getElementById("button");

const divContainer = document.getElementById("container");
const errorModal = document.getElementById("errorModalComp");

fetch("/getVenderBill", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load vendor bills try again later");
    }
    return response.json();
  })
  .then((data) => {
    const table = document.createElement("table");
    table.border = "1";
    table.width = "75%";
    divContainer.innerHTML = `
    <h2> Recent Bills </h2>
    <button type="button" id="buttonBill"> Create New Bill </button> </br>
    `;
    try {
      table.innerHTML = `
      <thead>
        <tr>
          <strong><th>ID</th>
          <th>vendor</th>
          <th>date</th>
          <th>total_amount</th>
          <th>paid_amount</th>
          <th>unpaid_amount</th>
          <th>bill_status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody></strong>
    `;

      const tbody = table.querySelector("tbody");

      // Insert rows
      data.forEach((item, index) => {
        const row = document.createElement("tr");
        const d = new Date(item.date);
        const formattedDate = d.toLocaleDateString("en-CA");

        fetch(`/getVenderById/${item.vendor_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Vendor details not found");
            }
            return response.json();
          })
          .then((data) => {
            data.forEach((vender) => {
              row.innerHTML = `
        <td>${index + 1}</td> 
        <td>${vender.name}</td>
        <td>${formattedDate}</td>
        <td>${item.total_amount}</td>
        <td>${item.paid_amount}</td>
        <td>${item.unpaid_amount}</td>
        <td>${item.bill_status}</td>
        <td>
        <button type="button" id="${item.id}" data-vendor-id="${
          item.vendor_id
        }" class="button edit-btn">Details</button>
        <td>
      `;
              tbody.appendChild(row);
            });
            // Append to div
            divContainer.appendChild(table);

            document.querySelectorAll(".edit-btn").forEach((btn) => {
              btn.addEventListener("click", (e) => {
                const venderBillID = e.target.id;
                const vendorID = e.target.dataset.vendorId;

                // Redirect to edit page with material id
                window.location.href = `venderDetails.html?id=${venderBillID}&vid=${vendorID}`;
              });
            });

            const venderBillEdit = document.getElementById("buttonBill");

            fetch("/hasPermission/vendor_bill_create")
              .then((res) => res.json())
              .then(({ allowed }) => {
                if (!allowed) {
                  venderBillEdit.disabled = true;
                  venderBillEdit.title =
                    "You do not have permission to create bills";
                  venderBillEdit.style.opacity = "0.5";
                  venderBillEdit.style.cursor = "not-allowed";
                }
              });

            venderBillEdit.addEventListener("click", () => {
              if (venderBillEdit.disabled) return;
              window.location.href = "/createBill.html";
            });
          })
          .catch((err) => {
            console.error(err);
            errorModal.show("Unable to fetch vendor details.");
          });
      });
    } catch (err) {
      console.error(err);
      errorModal.show("Something went wrong while rendering bills.");
    }
  })
  .catch((err) => {
    console.error(err);
    errorModal.show(err.message || "Server error. Please try again later.");
  });
