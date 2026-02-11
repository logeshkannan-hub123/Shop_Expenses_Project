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
const venderid = params.get("vid");

const divContainer = document.getElementById("container");
const errorModal = document.getElementById("errorModalComp");

fetch(`/getVenderMetrialById/${materialId}`, {
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
      <div id="h2">
      <h2>Vender Id :  ${data.vendor_id}</h2>
      <h2>Material Id : ${data.material_id} </h2>
      </br></br>
      <label for="nameInput">Price:</label>
      <input type="text" id="nameInput" name="nameInput" value="${data.price}" />
      <button type="button" id="Update">save</button>
      </div>
      `;
        document.getElementById("Update").addEventListener("click", () => {
          const nameInput = document.getElementById("nameInput");

          if (!nameInput.value) {
            alert("All fields are required");
            return;
          }

          fetch(`/updateAVenderMaterial/${materialId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              price: nameInput.value.trim(),
            }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Update failed");
              alert("Material Price updated successfully");
              window.location.href = `/venderEdit.html?id=${venderid}`;
            })
            .catch((err) => {
              console.error(err);
              errorModal.show("Unable to update material.");
            });
        });
      });
    } catch (err) {
      console.error(err);
      errorModal.show("Something went wrong while rendering the material.");
    }
  })
  .catch((err) => {
    console.error(err);
    errorModal.show("Unable to fetch material details.");
  });
