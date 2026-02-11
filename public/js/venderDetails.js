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

const params = new URLSearchParams(window.location.search);
const venderBillId = params.get("id");
const venderid = params.get("vid");

const divContainer1 = document.getElementById("container1");
const errorModal = document.getElementById("errorModalComp");

fetch(`/getAVenderBillById/${venderBillId}`)
  .then((res) => res.json())
  .then((billData) => {
    try {
      const bill = billData[0]; // ✅ single bill
      const d = new Date(bill.date);
      const formattedDate = d.toLocaleDateString("en-CA");

      // Fetch vendor
      return fetch("/getVender", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch Vender");
          return response.json();
        })
        .then((venders) => {
          return fetch(`/getVenderById/${venderid}`)
            .then((res) => res.json())
            .then((vendorData) => ({
              bill,
              vendor: vendorData[0],
              formattedDate,
              venders: venders,
            }));
        })
        .then(({ bill, vendor, formattedDate, venders }) => {
          // Build options dynamically
          let options = `<option value="${vendor.id}">${vendor.name}</option>`;

          venders.forEach((item) => {
            options += `<option value="${item.id}">${item.name}</option>`;
          });
          divContainer1.innerHTML = `
      <h2><strong>Vendor Details</strong></h2><br>

      <label>Id:</label>
      <input type="text" value="${bill.id}" readonly>

     <label for="vender">Choose a Vender:</label>
        <select name="vender" id="vender">
          ${options}
        </select>

      <label>Date:</label>
      <input type="date" id="dateInput" value="${formattedDate}">

      <label>Total Amount:</label>
      <input type="text" id="totalInput" pattern="[0-9.]*" value="${bill.total_amount}">

      <label>Paid Amount:</label>
      <input type="text" id="paidInput" pattern="[0-9.]*" value="${bill.paid_amount}">

      <label for="Status">Status:</label>
      <input type="text" id="Status" name="Status"value="${bill.bill_status}" readonly/>

      <button type="button" id="Update">Save</button>
    `;

          function calculateStatus(total, paid) {
            total = Number(total);
            paid = Number(paid);

            if (!total && !paid) return "";
            if (paid === 0) return "unpaid";
            if (paid === total) return "paid";
            if (paid < total) return "partialpaid";

            return "";
          }

          const totalInput = document.getElementById("totalInput");
          const paidInput = document.getElementById("paidInput");
          const statusInput = document.getElementById("Status");

          function updateStatus() {
            statusInput.value = calculateStatus(
              totalInput.value,
              paidInput.value,
            );
          }
          totalInput.addEventListener("input", updateStatus);
          paidInput.addEventListener("input", updateStatus);

          const tableWrapper = document.querySelector(
            "#container2 .table-wrapper",
          );

          const container2 = document.getElementById("container2");
          fetch("/getMaterial", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((materials) => {
              let options = `<option value="">--Material--</option>`;
              materials.forEach((m) => {
                options += `<option value="${m.id}">${m.name}</option>`;
              });

              fetch(`/getAVenderBillItemByVenderBillId/${venderBillId}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              })
                .then((response) => {
                  if (!response.ok)
                    throw new Error("Failed to fetch vendor materials");
                  return response.json();
                })
                .then((data1) => {
                  if (!data1.length) {
                    container2.innerHTML = "<h3>No materials found</h3>";
                    return;
                  }
                  container2.insertAdjacentHTML(
                    "afterbegin",
                    `
                <h2><strong>Vendor Items</strong></h2>
                <select id="material">${options}</select>
                <input type="number" id="price" pattern="[0-9.]*" placeholder="Price">
                <input type="number" id="quantity" pattern="[0-9.]*" placeholder="Qty">
                <input type="number" id="subTotal" readonly>
                <button id="addItem">Add</button>
                `,
                  );

                  tableWrapper.innerHTML = `<table border="1" id="itemTable">
                <thead>
                <tr>
                <th>ID</th>
                <th>Material</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Sub Total</th>
                <th>Action</th>
                </tr>
                </thead>
                <tbody></tbody>
                </table>`;

                  const table = document.getElementById("itemTable");
                  const tbody = table.querySelector("tbody");

                  const addBtn = document.getElementById("addItem");
                  const material = document.getElementById("material");
                  const price = document.getElementById("price");
                  const qty = document.getElementById("quantity");
                  const sub = document.getElementById("subTotal");

                  fetch("/hasPermission/vendor_bill_item_add")
                    .then((res) => res.json())
                    .then(({ allowed }) => {
                      if (!allowed) {
                        addBtn.disabled = true;
                        addBtn.title =
                          "You do not have permission to create bills";
                        addBtn.style.opacity = "0.5";
                        addBtn.style.cursor = "not-allowed";
                      }
                    });

                  addBtn.addEventListener("click", () => {
                    if (addBtn.disabled) return;
                    const materialId = material.value.trim();

                    if (!materialId || !price.value || !qty.value) {
                      alert("Fill item details");
                      return;
                    }

                    fetch("/addVenderBillItem", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        vender_bill_id: venderBillId,
                        material_id: materialId,
                        price: price.value,
                        quantity: qty.value,
                        sub_total: sub.value,
                      }),
                    })
                      .then((response) => {
                        if (!response.ok) throw new Error("Insert failed");
                        alert("Material added successfully");
                        location.reload();
                      })
                      .catch((err) => {
                        console.error(err);
                        errorModal.show("Unable to add material.");
                      });
                  });

                  function calc() {
                    sub.value =
                      (Number(price.value) || 0) * (Number(qty.value) || 0);
                  }

                  price.addEventListener("input", calc);
                  qty.addEventListener("input", calc);

                  data1.forEach((item, index) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                  <td>${index + 1}</td>
                  <td>${item.material_name}</td>
                  <td>${item.price}</td>
                  <td>${item.quantity}</td>
                  <td>${item.sub_total}</td>
                  <td><button class="remove" id="${
                    item.id
                  }">Delete</button></td>
                  `;
                    tbody.appendChild(row);
                  });

                  document.querySelectorAll(".remove").forEach((btn) => {
                    fetch("/hasPermission/vendor_bill_item_delete")
                      .then((res) => res.json())
                      .then(({ allowed }) => {
                        if (!allowed) {
                          btn.disabled = true;
                          btn.title =
                            "You do not have permission to delete bill items";
                          btn.style.opacity = "0.5";
                          btn.style.cursor = "not-allowed";
                        }
                      });
                    btn.addEventListener("click", (e) => {
                      if (btn.disabled) return;
                      const materialId = e.target.id;

                      if (
                        !confirm("Are you sure you want to delete this Vender?")
                      )
                        return;

                      fetch(`/deleteVenderBillItem/${materialId}`, {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                        },
                      })
                        .then((response) => {
                          if (!response.ok) throw new Error("Delete failed");
                          alert("Vender Bill Item deleted successfully");
                          location.reload();
                        })
                        .catch((err) => {
                          console.error(err);
                          errorModal.show("Unable to delete vender bill item.");
                        });
                    });
                  });
                });
            });

          document.getElementById("Update").addEventListener("click", () => {
            const nameInput = document.getElementById("vender").value.trim();
            const dateInput = document.getElementById("dateInput").value;
            const totalInput = document
              .getElementById("totalInput")
              .value.trim();
            const paidInput = document.getElementById("paidInput").value.trim();
            const statusInput = document.getElementById("Status").value.trim();

            const selectedDate = new Date(dateInput + "T00:00:00");
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate > today) {
              alert(
                "Future dates are not allowed. Select today or a past date.",
              );
              return;
            }

            if (
              !nameInput ||
              !dateInput ||
              !totalInput ||
              !paidInput ||
              !statusInput
            ) {
              alert("All fields are required");
              return;
            }

            const payload = {
              vendor_id: nameInput,
              date: dateInput, // already yyyy-mm-dd
              total_amount: Number(totalInput),
              paid_amount: Number(paidInput),
              bill_status: statusInput,
            };

            console.log(payload); // DEBUG

            fetch(`/updateVenderBill/${venderBillId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
              .then(async (res) => {
                if (!res.ok) {
                  const errMsg = await res.text();
                  throw new Error(errMsg);
                }
                alert("Vendor bill updated successfully");
                window.location.href = "/Vender_bills.html";
              })
              .catch((err) => {
                console.error(err);
                errorModal.show("Unable to update vendor bill.");
              });
          });
        });
    } catch (err) {
      console.error(err);
      errorModal.show("Something went wrong while rendering the bill.");
    }
  })
  .catch((err) => {
    console.error(err);
    errorModal.show("Unable to fetch vendor bill details.");
  });
