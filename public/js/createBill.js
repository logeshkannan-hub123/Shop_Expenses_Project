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

const divContainer = document.getElementById("container1");
const errorModal = document.getElementById("errorModalComp");

let items = []; // store bill items

fetch("/getVender", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => {
    if (!response.ok) throw new Error("Failed to fetch Vender");
    return response.json();
  })
  .then((vender) => {
    // Build options dynamically
    try {
      let options = `<option value="">--Choose Vender--</option>`;

      vender.forEach((item) => {
        options += `<option value="${item.id}">${item.name}</option>`;
      });

      divContainer.innerHTML = `
      <h2><strong>Create Vender Bill</strong></h2><br>

      <div id="insert">
        <label for="vender">Choose a Vender:</label>
        <select name="vender" id="vender">
          ${options}
        </select>
      <label for="date">date:</label>
      <input type="date" id="date" name="date" required/>

      <label for="total">Total Amount:</label>
      <input type="text" id="total" name="total" pattern="[0-9.]*" required/>

      <label for="paid">Paid Amount:</label>
      <input type="text" id="paid" name="paid" pattern="[0-9.]*" required/>

      <label for="Status">Status:</label>
      <input type="text" id="Status" name="Status" readonly/>
      
      <button type="button" id="post">save</button>
      </div> </br>
    `;

      // Set today date

      const today = new Date();
      const formattedDate = today.toLocaleDateString("en-CA");
      // en-CA gives YYYY-MM-DD format

      document.getElementById("date").value = formattedDate;

      const container2 = document.getElementById("container2");
      const tableWrapper = document.querySelector("#container2 .table-wrapper");

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

          container2.insertAdjacentHTML(
            "afterbegin",
            `
        <h2>Add Items</h2>

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

          const price = document.getElementById("price");
          const qty = document.getElementById("quantity");
          const sub = document.getElementById("subTotal");

          price.addEventListener("input", calc);
          qty.addEventListener("input", calc);

          function calc() {
            sub.value = (price.value || 0) * (qty.value || 0);
          }

          document.getElementById("addItem").addEventListener("click", () => {
            const material = document.getElementById("material");

            if (!material.value || !price.value || !qty.value) {
              alert("Fill item details");
              return;
            }

            const item = {
              material_id: material.value,
              material_name: material.options[material.selectedIndex].text,
              price: Number(price.value),
              quantity: Number(qty.value),
              sub_total: Number(sub.value),
            };

            items.push(item);

            const tbody = document.querySelector("#itemTable tbody");
            tbody.innerHTML = "";

            items.forEach((item, index) => {
              const row = document.createElement("tr");
              row.innerHTML = `
              <td>${index + 1}</td>
              <td>${item.material_name}</td>
              <td>${item.price}</td>
              <td>${item.quantity}</td>
              <td>${item.sub_total}</td>
              <td><button class="remove">Delete</button></td>
            `;
              tbody.appendChild(row);
              row.querySelector(".remove").onclick = () => {
                items.splice(index, 1); // remove from array
                row.remove();
              };
            });

            price.value = "";
            qty.value = "";
            sub.value = "";
            material.value = "";
          });
        });

      function calculateStatus(total, paid) {
        total = Number(total);
        paid = Number(paid);

        if (!total && !paid) return "";
        if (paid === 0) return "unpaid";
        if (paid === total) return "paid";
        if (paid < total) return "partialpaid";

        return "";
      }

      const totalInput = document.getElementById("total");
      const paidInput = document.getElementById("paid");
      const statusInput = document.getElementById("Status");

      function updateStatus() {
        statusInput.value = calculateStatus(totalInput.value, paidInput.value);
      }

      totalInput.addEventListener("input", updateStatus);
      paidInput.addEventListener("input", updateStatus);

      document.getElementById("post").addEventListener("click", () => {
        const venderId = document.getElementById("vender").value.trim();
        const total = document.getElementById("total").value.trim();
        const paid = document.getElementById("paid").value.trim();
        const date = document.getElementById("date").value.trim();
        const status = document.getElementById("Status").value.trim();
        const selectedDate = new Date(date + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate > today) {
          alert("Future dates are not allowed. Select today or a past date.");
          return;
        }

        if (!venderId || !total || !paid || !date || !status) {
          alert("Please fill all fields");
          return;
        }
        if (items.length === 0) {
          alert("Please add at least one item");
          return;
        }

        fetch("/addVenderBill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vendor_id: venderId,
            date: date,
            total_amount: total,
            paid_amount: paid,
            bill_status: statusInput.value,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              alert("Insert failed Error");
              throw new Error("Insert failed");
            }
            return response.json();
          })
          .then((data) => {
            const vender_bill_id = data.vender_bill_id;

            return fetch("/addMultipleVenderBillItem", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                vender_bill_id: vender_bill_id,
                items: items, // array of items
              }),
            });
          })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to save bill items");
            }
            alert("Vendor bill saved successfully");
            window.location.href = "/Vender_bills.html";
          })
          .catch((err) => {
            console.error(err);
            errorModal.show("Unable to save vendor bill.");
          });
      });
    } catch (err) {
      console.error(err);
      errorModal.show("Something went wrong while rendering the form.");
    }
  })
  .catch((err) => {
    console.error(err);
    errorModal.show("Unable to fetch vendor list.");
  });
