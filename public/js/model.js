const errorDialog = document.getElementById("errorDialog");
const closeButton = document.getElementById("closeButton");

// Function to display the modal box
function showServerErrorModal() {
  // showModal() makes it a modal dialog box
  errorDialog.showModal();
}

// Function to close the modal box
closeButton.addEventListener("click", () => {
  errorDialog.close();
});

showServerErrorModal();
