window.onload = () => {
  let counter = 0;
  let enterPressed = false;
  let history = [];
  let hIndex = 0;

  const inputTemplate = document.querySelector('#input-box');
  let inputArea = document.importNode(inputTemplate.content, true);
  document.body.append(inputArea);

  window.onkeydown = e => {
    switch(e.key) {
      case 'Tab':
      case 'ArrowUp':
      case 'ArrowDown':
        e.preventDefault();
        break;
    }
  };
  window.onkeyup = e => {
    let input = document.querySelector('#input');
    switch(e.key) {
      case 'Tab': {
        // Reset flag
        enterPressed = false;
        input.value += '  ';
        break;
      }
      case 'ArrowUp': {
        hIndex = hIndex > 0 ? hIndex - 1: hIndex;
        input.value = history[hIndex] || '';
        break;
      }
      case 'ArrowDown': {
        hIndex = hIndex + 1 < history.length ? hIndex + 1: hIndex;
        input.value = history[hIndex] || '';
        break;
      }
      case 'Enter': {
        if (!enterPressed) {
          enterPressed = true;
          return;
        }
        // Prepare to evaluate
        let rawInput = input.value;
        history.push(rawInput.slice(0, rawInput.length - 2));
        // Also update index to 1 after the last
        hIndex = history.length;
        switch(rawInput) {
          case 'clear\n\n': {
            document.querySelectorAll('p').forEach(e => e.remove());
            input.value = '';
            break;
          }
          default: {
            let readOnlyText = document.createElement('p');
            readOnlyText.innerHTML = (
              `In[${counter}]: ` + (rawInput || '(Empty)')
            ).replace(/(?<=:)\s/g, '')
              .replace(/\n(?=\w)/g, '\&not; ');
            input.replaceWith(readOnlyText)
            execute(rawInput);
          }
        }
        break;
      }
      default: {
        enterPressed = false;
      }
    }
  };

  function execute(rawInput) {
    const code = rawInput.replace(/\n/g, '\r');
    let headers = new Headers;
    headers.append('Content-Type', 'text/plain');
    let request = new Request('/eval', {
      method: 'POST',
      headers: headers,
      body: code + ' '       
    })

    fetch(request)
      .then(res => res.text())
      .then(text => {
        // Reset 'enter' keypress status
        enterPressed = false;
        let output = document.createElement('p');
        output.textContent = `Out[${counter++}]: ` + text;
        document.body.append(output);
        let input = document.importNode(inputTemplate.content, true);
        document.body.append(input);
        document.querySelector('#input').focus();
      })
  }
}
