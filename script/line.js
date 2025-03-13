document.querySelectorAll('.running-text-outer').forEach(el => {
     let content = el.querySelector('.running-text-content');

     repeatContentRunningText(content, el.offsetWidth);

     let slider = el.querySelector('.running-text-loop');
     slider.innerHTML = slider.innerHTML + slider.innerHTML;

     let charCount = content.textContent.length;
     let baseSpeedPerChar = 0.15;
     let duration = charCount * baseSpeedPerChar;

     slider.style.animationDuration = `${duration}s`;

});

function repeatContentRunningText(el, till) {
     let html = el.innerHTML;
     let counter = 0;

     while (el.offsetWidth < till && counter < 100) {
          el.innerHTML += html;
          counter += 1;
     }
}