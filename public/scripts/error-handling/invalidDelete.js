const errorDiv = document.querySelector('.error-container');
const errorDivCloseBtn = document.querySelector('#close-error-div-btn');

errorDivCloseBtn.addEventListener('click', handleClose);

function handleClose(e){
    errorDiv.classList.remove('animate__fadeIn');
    errorDiv.classList.add('animate__fadeOut');
}