// register.js

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.signup-form form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    form.addEventListener('submit', function(event) {
        // Check if passwords match
        if (passwordInput.value !== confirmPasswordInput.value) {
            alert('Passwords do not match. Please try again.');
            event.preventDefault(); // Prevent form submission
        }

        // You can add more validation checks here if needed
        // For example, checking the length of the password, etc.
    });
});