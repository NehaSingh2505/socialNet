// login.js

document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.login-form form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  form.addEventListener('submit', function (event) {
      
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value)) {
          alert('Please enter a valid email address.');
          event.preventDefault(); 
      }

      if (passwordInput.value.trim() === '') {
          alert('Password cannot be empty.');
      }

  });
});