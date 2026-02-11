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

const divContainer = document.getElementById("container");
const errorModal = document.getElementById("errorModalComp");

fetch(`/getMaterialById/${materialId}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
    try {
      data.forEach((data) => {
        divContainer.innerHTML = `
     <h2><strong>Material - </strong>  Id:${data.id} , Name:${data.name}</h2></br>
      <label for="Id">Id:</label>
      <input type="text" value="${data.id}" readonly>
      <label for="nameInput">Name:</label>
      <input type="text" id="nameInput" name="nameInput" value="${data.name}" />
      <label for="UOMInput">Unit of Measure:</label>
      <input type="text" id="UOMInput" name="UOMInput" value="${data.quantity_of_measure}" />
      <label for="UQInput">Unit Quantity:</label>
      <input type="text" id="UQInput" name="UQInput" value="${data.unit_quantity}" />
      <button type="button" id="Update">save</button>
    `;

        document.getElementById("Update").addEventListener("click", () => {
          const nameInput = document.getElementById("nameInput");
          const UOMInput = document.getElementById("UOMInput");
          const UQInput = document.getElementById("UQInput");

          if (!nameInput.value || !UOMInput.value || !UQInput.value) {
            alert("All fields are required");
            return;
          }

          fetch(`/updateMaterial/${materialId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: nameInput.value.trim(),
              quantity_of_measure: UOMInput.value.trim(),
              unit_quantity: UQInput.value.trim(),
            }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Update failed");
              alert("Material updated successfully");
              window.location.href = "/material.html";
            })
            .catch((err) => {
              console.error(err);
              errorModal.show("Unable to update material.");
            });
        });
      });
    } catch (err) {
      console.error(err);
      errorModal.show("Unable to fetch material details.");
    }
  })
  .catch((err) => {
    console.error(err);
    errorModal.show("Something went wrong while rendering the material.");
  });
