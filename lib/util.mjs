document.addEventListener("keydown", handleKeyboardEvent) // {{{1

let config = {}

function handleKeyboardEvent (e) { // {{{1
  if (e.ctrlKey && e.key == 'c') {
    put('You pressed Ctrl-C.')
  }
}

function put (...lines) { // {{{1
  for (let line of lines) {
    config.content.innerHTML += `${line}<br/>`
  }
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  })
}

function reset (opts) { // {{{1
  Object.assign(config, opts)
}

export { put, reset, } // {{{1

