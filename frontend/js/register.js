// register.js

// Get the form element
const form = document.querySelector('form');

// Add an event listener to the form
form.addEventListener('submit', (e) => {
    // Prevent the default form submission behavior
    e.preventDefault();

    // Get the input values
    const name = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate the input values
    if (name === '') {
        alert('Please enter your name');
        return;
    }

    if (email === '') {
        alert('Please enter your email');
        return;
    }

    if (password === '') {
        alert('Please enter your password');
        return;
    }

    if (confirmPassword === '') {
        alert('Please confirm your password');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // If all validations pass, submit the form
    form.submit();
});