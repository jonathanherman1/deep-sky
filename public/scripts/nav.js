const offcanvas = document.querySelector('#offcanvas');

const offcanvasOpen = document.querySelector('#offcanvas-open');
const offcanvasClose = document.querySelector('#offcanvas-close');

offcanvasOpen.addEventListener('click', handleOpen);
offcanvasClose.addEventListener('click', handleClose);

function handleOpen(){
    offcanvas.classList.remove('hidden');
    offcanvas.classList.add('animate__slideInLeft');
    if(offcanvas.classList.contains('animate__slideOutLeft')){
        offcanvas.classList.remove('animate__slideOutLeft');
    }
}

function handleClose(){
    if(offcanvas.classList.contains('animate__slideInLeft')){
        offcanvas.classList.remove('animate__slideInLeft');
    }
    offcanvas.classList.add('animate__slideOutLeft');
}