let hidden = true;
const offcanvas = document.querySelector('#offcanvas');
const offcanvasToggle = document.querySelector('#offcanvas-toggle');
const offcanvasClose = document.querySelector('#offcanvas-close');

offcanvasToggle.addEventListener('click', handleClick);
offcanvasClose.addEventListener('click', handleClick);

function handleClick(e){
    if(hidden === true){
        offcanvas.classList.add('open');
        offcanvas.classList.remove('hidden');
        hidden = false;
    } else {
        offcanvas.classList.remove('open');
        offcanvas.classList.add('hidden');
        hidden = true;
    }
}