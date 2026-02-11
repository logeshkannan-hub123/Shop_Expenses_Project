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

const divcontainer = document.getElementById("container");
const errorModal = document.getElementById("errorModalComp");

fetch("/getMaterial", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
    try {
      const table = document.createElement("table");
      table.border = "1";
      table.width = "75%";
      divcontainer.innerHTML = `
    <h2><strong>Materials</strong></h2></br>
    <div id="insert">
    <input type="text" id="nameInput" name="nameInput" placeholder="Type Material name" />
    <input type="text" id="UOMInput" name="UOMInput"placeholder="Type Unit Measure" />
    <input type="text" id="UQInput" name="UQInput" placeholder="Type Unit Quantity" />
    <button type="button" id="post">Insert</button>
    </div> </br>
    `;
      // Create header
      table.innerHTML = `
      <thead>
        <tr>
          <strong><th>ID</th>
          <th>Name</th>
          <th>Unit of Measure</th>
          <th>Unit Quantity</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody></strong>
    `;

      const tbody = table.querySelector("tbody");

      // Insert rows
      data.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${index + 1}</td> 
        <td>${item.name}</td>
        <td>${item.quantity_of_measure}</td>
        <td>${item.unit_quantity}</td>
        <td>
        <button type="button" id="${
          item.id
        }" class="button edit-btn">Edit</button>
        <button type="button" id="${
          item.id
        }" class="button delete-btn">Delete</button>
        <td>
      `;
        tbody.appendChild(row);
      });
      // Append to div
      divcontainer.appendChild(table);

      const insertBtn = document.getElementById("post");
      const nameInput = document.getElementById("nameInput");
      const UOMInput = document.getElementById("UOMInput");
      const UQInput = document.getElementById("UQInput");

      fetch("/hasPermission/material_create")
        .then((res) => res.json())
        .then(({ allowed }) => {
          if (!allowed) {
            insertBtn.disabled = true;
            insertBtn.title =
              "You do not have permission to create materials Permission for admin and manager only.";
            insertBtn.style.opacity = "0.5";
            insertBtn.style.cursor = "not-allowed";
          }
        });

      insertBtn.addEventListener("click", () => {
        if (insertBtn.disabled) return;
        const uidata = {
          name: nameInput.value.trim(),
          quantity_of_measure: UOMInput.value.trim(),
          unit_quantity: UQInput.value.trim(),
        };

        if (
          !uidata.name ||
          !uidata.quantity_of_measure ||
          !uidata.unit_quantity
        ) {
          alert("All fields are required");
          return;
        }

        fetch("/addMaterial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(uidata),
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

      // Handle Edit button click
      document.querySelectorAll(".edit-btn").forEach((btn) => {
        fetch("/hasPermission/material_update")
          .then((res) => res.json())
          .then(({ allowed }) => {
            if (!allowed) {
              btn.disabled = true;
              btn.title =
                "You do not have permission to Edit materials Permission for admin and manager only.";
              btn.style.opacity = "0.5";
              btn.style.cursor = "not-allowed";
            }
          });
        btn.addEventListener("click", (e) => {
          if (btn.disabled) return;
          const materialId = e.target.id;

          // Redirect to edit page with material id
          window.location.href = `/materialEdit.html?id=${materialId}`;
        });
      });

      document.querySelectorAll(".delete-btn").forEach((btn) => {
        fetch("/hasPermission/material_delete")
          .then((res) => res.json())
          .then(({ allowed }) => {
            if (!allowed) {
              btn.disabled = true;
              btn.title =
                "You do not have permission to delete materials Permission for admin and manager only.";
              btn.style.opacity = "0.5";
              btn.style.cursor = "not-allowed";
            }
          });
        btn.addEventListener("click", (e) => {
          if (btn.disabled) return;
          const materialId = e.target.id;

          if (!confirm("Are you sure you want to delete this material?"))
            return;

          fetch(`/deleteMaterial/${materialId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((response) => {
              if (!response.ok) throw new Error("Delete failed");
              alert("Material deleted successfully");
              location.reload();
            })
            .catch((err) => {
              console.error(err);
              errorModal.show("Unable to delete material.");
            });
        });
      });

      console.log("Materials displayed successfully");
    } catch (err) {
      console.error(err);
      errorModal.show("Something went wrong while rendering the materials.");
    }
  })
  .catch((err) => {
    console.error(err);
    errorModal.show("Unable to fetch material list.");
  });
