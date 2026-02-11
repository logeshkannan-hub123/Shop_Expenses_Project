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
const materialId = params.get("id");

const divContainer1 = document.getElementById("container1");
const errorModal = document.getElementById("errorModalComp");

try {
  fetch(`/getVenderById/${materialId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      data
        .forEach((data) => {
          divContainer1.innerHTML = `
      <h2><strong>Vender - </strong>  Id:${data.id} , Name:${data.name}</h2></br>
      <label for="Id">Id:</label>
      <input type="text" value="${data.id}" readonly>
      <label for="nameInput">Name:</label>
      <input type="text" id="nameInput" name="nameInput" value="${data.name}" />
      <label for="UOMInput">Phone Number:</label>
      <input type="text" id="UOMInput" name="UOMInput" value="${data.phone_no}" />
      <label for="UQInput">Address:</label>
      <input type="text" id="UQInput" name="UQInput" value="${data.address}" />
      <button type="button" id="Update">save</button>
      `;

          document.getElementById("Update").addEventListener("click", () => {
            const nameInput = document.getElementById("nameInput");
            const phone_noInput = document.getElementById("UOMInput");
            const addressInput = document.getElementById("UQInput");

            if (
              !nameInput.value ||
              !phone_noInput.value ||
              !addressInput.value
            ) {
              alert("All fields are required");
              return;
            }

            fetch(`/updateVender/${materialId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: nameInput.value.trim(),
                phone_no: phone_noInput.value.trim(),
                address: addressInput.value.trim(),
              }),
            })
              .then((res) => {
                if (!res.ok) throw new Error("Update failed");
                alert("Vender updated successfully");
                window.location.href = "/vender.html";
              })
              .catch((err) => {
                console.error(err);
                errorModal.show("Unable to update vender.");
              });
          });
        })
        .catch((err) => {
          console.error(err);
          errorModal.show("Unable to fetch vender details.");
        });
    });

  const divContainer2 = document.getElementById("container2");

  fetch(`/getVenderMaterialUsingVenderId/${materialId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch vendor materials");
      return response.json();
    })
    .then((data) => {
      if (!data.length) {
        divContainer2.innerHTML = "<h3>No materials found</h3>";
        return;
      }

      const table = document.createElement("table");
      table.border = "1";
      table.width = "75%";

      fetch("/getMaterial", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch materials");
          return response.json();
        })
        .then((materials) => {
          // Build options dynamically
          let options = `<option value="">--Choose Material--</option>`;

          materials.forEach((item) => {
            options += `<option value="${item.id}">${item.name}</option>`;
          });

          // Set HTML ONCE
          divContainer2.innerHTML = `
      <h2><strong>Vendor ${data[0].vender_name} purchasing materials</strong></h2><br>

      <div id="insert">
        <label for="materials">Choose a material:</label>
        <select name="materials" id="materials">
          ${options}
        </select>
        <input type="text" id="price" name="price"placeholder="Type Price" />
      <button type="button" id="post">Add</button>
      </div> </br>
    `;

          table.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Material Name</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

          const tbody = table.querySelector("tbody");

          data.forEach((item, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.material_name}</td>
        <td>${item.price}</td>
        <td>
          <button class="button edit-btn" id="${item.id}">
            Edit
          </button>
          <button class="button delete-btn" id="${item.id}">
            Delete
          </button>
        </td>
      `;
            tbody.appendChild(row);
          });

          divContainer2.appendChild(table);
          const addBtn = document.getElementById("post");
          const materialSelect = document.getElementById("materials");
          const priceInput = document.getElementById("price");

          addBtn.addEventListener("click", () => {
            const materialId = materialSelect.value;
            const price = priceInput.value.trim();

            if (!materialId || !price) {
              alert("Please select material and enter price");
              return;
            }

            fetch("/addVenderMaterial", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                material_id: materialId,
                vendor_id: data[0].vender_id,
                price: price,
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

          document.querySelectorAll(".edit-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
              const materialIds = e.target.id;

              // Redirect to edit page with material id
              window.location.href = `/priceEdit.html?id=${materialIds}&vid=${materialId}`;
            });
          });

          document.querySelectorAll(".delete-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
              const materialId = e.target.id;

              if (!confirm("Are you sure you want to delete this Vender?"))
                return;

              fetch(`/deleteVendermaterial/${materialId}`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
              })
                .then((response) => {
                  if (!response.ok) throw new Error("Delete failed");
                  alert("Vender deleted successfully");
                  location.reload();
                })
                .catch((err) => {
                  console.error(err);
                  errorModal.show("Unable to delete material.");
                });
            });
          });
        });
    })
    .catch((err) => {
      console.error(err);
      errorModal.show("Unable to fetch vendor materials.");
    });
} catch (err) {
  console.error(err);
  errorModal.show(
    "Something went wrong while rendering the vender and materials.",
  );
}
