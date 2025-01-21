const form = document.querySelector("form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");

function showError(input, message) {
  const inputGroup = input.parentElement;
  inputGroup.classList.add("error");
  const error = inputGroup.querySelector("small");
  if (error) {
    error.textContent = message;
  } else {
    const errorElement = document.createElement("small");
    errorElement.style.color = "red";
    errorElement.textContent = message;
    inputGroup.appendChild(errorElement);
  }
}

function clearError(input) {
  const inputGroup = input.parentElement;
  inputGroup.classList.remove("error");
  const error = inputGroup.querySelector("small");
  if (error) {
    error.remove();
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isStrongPassword(password) {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}

form.addEventListener("submit", (e) => {
  let isValid = true;

  if (username.value.trim() === "") {
    showError(username, "Name is required.");
    isValid = false;
  } else {
    clearError(username);
  }

  if (!isValidEmail(email.value)) {
    showError(email, "Please enter a valid email.");
    isValid = false;
  } else {
    clearError(email);
  }

  if (!isStrongPassword(password.value)) {
    showError(
      password,
      "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
    );
    isValid = false;
  } else {
    clearError(password);
  }

  if (password.value !== confirmPassword.value) {
    showError(confirmPassword, "Passwords do not match.");
    isValid = false;
  } else {
    clearError(confirmPassword);
  }

  if (!isValid) {
    e.preventDefault();
  }
});
