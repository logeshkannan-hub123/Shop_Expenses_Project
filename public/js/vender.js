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

fetch("/getVender", {
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
    <h2><strong>Venders</strong></h2></br>
    <div id="insert">
    <input type="text" id="nameInput" name="nameInput" placeholder="Type Vender name" />
    <input type="text" id="phone_no" name="phone_no"placeholder="Type Vender Phone No" />
    <input type="text" id="address" name="address" placeholder="Type Vender Address" />
    <button type="button" id="post">Insert</button>
    </div> </br>
    `;
      // Create header
      table.innerHTML = `
      <thead>
        <tr>
          <strong><th>ID</th>
          <th>Name</th>
          <th>phone_no</th>
          <th>address</th>
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
        <td>${item.phone_no}</td>
        <td>${item.address}</td>
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
      const phone_no = document.getElementById("phone_no");
      const address = document.getElementById("address");

      fetch("/hasPermission/vendor_create")
        .then((res) => res.json())
        .then(({ allowed }) => {
          if (!allowed) {
            insertBtn.disabled = true;
            insertBtn.title =
              "You do not have permission to create venders Permission for admin and manager only.";
            insertBtn.style.opacity = "0.5";
            insertBtn.style.cursor = "not-allowed";
          }
        });

      insertBtn.addEventListener("click", () => {
        if (insertBtn.disabled) return;
        const uidata = {
          name: nameInput.value.trim(),
          phone_no: phone_no.value.trim(),
          address: address.value.trim(),
        };

        if (!uidata.name || !uidata.phone_no || !uidata.address) {
          alert("All fields are required");
          return;
        }

        fetch("/addVender", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(uidata),
        })
          .then((response) => {
            if (!response.ok) throw new Error("Insert failed");
            alert("Vender added successfully");
            location.reload();
          })
          .catch((err) => {
            console.error(err);
            errorModal.show("Unable to add vender.");
          });
      });

      document.querySelectorAll(".edit-btn").forEach((btn) => {
        fetch("/hasPermission/vendor_update")
          .then((res) => res.json())
          .then(({ allowed }) => {
            if (!allowed) {
              btn.disabled = true;
              btn.title =
                "You do not have permission to Edit venders Permission for admin and manager only.";
              btn.style.opacity = "0.5";
              btn.style.cursor = "not-allowed";
            }
          });
        btn.addEventListener("click", (e) => {
          if (btn.disabled) return;
          const materialId = e.target.id;

          // Redirect to edit page with material id
          window.location.href = `/venderEdit.html?id=${materialId}`;
        });
      });

      document.querySelectorAll(".delete-btn").forEach((btn) => {
        fetch("/hasPermission/vendor_delete")
          .then((res) => res.json())
          .then(({ allowed }) => {
            if (!allowed) {
              btn.disabled = true;
              btn.title =
                "You do not have permission to delete venders Permission for admin and manager only.";
              btn.style.opacity = "0.5";
              btn.style.cursor = "not-allowed";
            }
          });
        btn.addEventListener("click", (e) => {
          if (btn.disabled) return;
          const materialId = e.target.id;

          if (!confirm("Are you sure you want to delete this Vender?")) return;

          fetch(`/deleteVender/${materialId}`, {
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
              errorModal.show("Unable to delete vender.");
            });
        });
      });

      console.log("vender displayed successfully");
    } catch (error) {
      console.error(error);
      errorModal.show("Error fetching Venders.");
    }
  })
  .catch((err) => {
    console.error(err);
    errorModal.show("Unable to fetch vender list.");
  });
