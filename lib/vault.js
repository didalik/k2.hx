let dirname, fs // {{{1

const vault = { // {{{1
  get: key => { // {{{2
    let v
    try {
      v = fs ? fs.readFileSync(dirname + '/' + key) : localStorage.getItem(key)
      return JSON.parse(v);
    } catch (err) {
      if (err.code == 'ENOENT') {
        return false;
      }
      v = v.toString()
      if (v.endsWith('"DONE""DONE""DONE"')) {
        return true;
      }
      console.log('vault.get key', key, 'v', v)
      return false;
    }
  },
  init: (fsArg = null) => { // {{{2
    fs = fsArg
    if (fs) {
      dirname = process.env.VAULT ?? process.env.PWD + '/vault'
    }
    return vault;
  },
  put: (key, value, options) => { // {{{2
    console.log('vault.put key', key, 'value', value, 'options', options)

    if (fs) {
      fs.mkdirSync(dirname, { recursive: true, })
      fs.writeFileSync(dirname + '/' + key, JSON.stringify(value), options)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  },
  watch: (key, cb) => fs.watch(dirname + (key ? '/' + key : ''), cb) // {{{2
  // }}}2
}

export default vault // {{{1
/*
From Gemini:

Because the native storage event does not trigger on the same page that made the change, 
you can wrap or override setItem and removeItem with a custom event:

javascript

// Override setItem
const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key, value) {
  originalSetItem.apply(this, arguments);
  window.dispatchEvent(new CustomEvent('local-storage-change', {
    detail: { key, newValue: value }
  }));
};

// Listen to your custom event
window.addEventListener('local-storage-change', (event) => {
  if (event.detail.key === 'my_key') {
    console.log('Same-tab update:', event.detail.newValue);
  }
});
*/
