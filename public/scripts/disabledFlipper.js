const passwordInput = document.querySelector('#password-input');
const showPasswordBtn = document.querySelector('#show-password-btn');

showPasswordBtn.addEventListener('click', handleDisableFlip);

function handleDisableFlip(){
    passwordInput.removeAttribute('disabled');
}