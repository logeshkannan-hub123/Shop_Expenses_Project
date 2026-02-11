const container = document.getElementById("container");

container.innerHTML = `
 <form>
    <p id="google-login"><a href="/auth/google"><img src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000" alt="Google Login" />Login with Google</a></p>
    <p id="facebook-login"><a href="/auth/facebook"><img src="https://img.icons8.com/?size=100&id=118497&format=png&color=000000" alt="Facebook Login" />Login with Facebook</a></p>
    <h3>OR</h3>
    <hr>
    <h1>User Login</h1></br>
    <label for="user_id">User ID:</label>
    <input type="text" id="user_id" name="user_id" required /><br /><br />  
    <label for="password">Password:</label>
    <input type="password" id="password" name="password" required /><br /><br />
    <button type="submit">Login</button><br /></br>
    <p>Don't have an account? <a href="/Registration.html">Registration</a></p>
</form>
`;

const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      const result = await response.json();
      if (response.ok) {
        // Handle successful login
        alert("Login successful");
        document.cookie = `auth=${Date.now()}; path=/`;

        window.location.href = "/home-Page.html";
      } else {
        // Handle login error
        alert("Login failed: " + result.message);
        console.error("Login failed", result.message);
      }
    })
    .catch((err) => {
      console.error("Network error", err);
    });
});
