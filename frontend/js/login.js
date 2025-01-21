const loginForm = document.querySelector("form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

function sanitizeInput(input) {
  const tempElement = document.createElement("div");
  tempElement.textContent = input;
  return tempElement.innerHTML;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = sanitizeInput(emailInput.value);
  const password = sanitizeInput(passwordInput.value);

  if (!isValidEmail(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  if (!isValidPassword(password)) {
    alert(
      "Password must be at least 8 characters long and contain at least one letter and one number."
    );
    return;
  }

  fetch("loginprocess", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Login failed. Please check your credentials.");
      }
    })
    .then((data) => {
      alert("Login successful!");
      window.location.href = "/dashboard";
    })
    .catch((error) => {
      alert(error.message);
    });
});
