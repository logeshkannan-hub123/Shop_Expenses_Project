const container = document.getElementById("container");

container.innerHTML = `
<form method="post">
    <h2>User Registration</h2></br>
    <label for="user_id">User ID:</label>
    <input type="text" id="user_id" name="user_id" placeholder="Enter new user ID" required /><br /><br />
    <label for="password">Password:</label>
    <input type="password" id="password" name="password" placeholder="Enter new password" required /><br /><br />
    <label for="email_id">Email id:</label>
    <input type="email" id="email_id" name="email_id" placeholder="Enter Email" required /> <br /><br />
    <center>
        <button type="submit">Register</button></br></br>
        <button type="reset">Clear</button></br></br>
        <p>Already have an account? <a href="/login.html">Login</a></p>
    </center>
</form>
`;

const form = document.querySelector("form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  fetch("/addUserRegistration", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((response) => {
    if (response.ok) {
      // Handle successful registration
      alert("Registration successful");
      window.location.href = "/login.html";
    } else {
      // Handle registration error
      console.error("Registration failed", response.statusText);
    }
  });
});
