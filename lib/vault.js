let dirname, fs, wst // {{{1

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
  remove: key => fs ? fs.unlinkSync(dirname + '/' + key) : // {{{2
    undefined,
  rename: (oldkey, newkey) => fs ? fs.renameSync(dirname + '/' + oldkey, dirname + '/' + newkey) : // {{{2
    undefined, 
  watch: (key, cb) => fs && fs.watch(dirname + (key ? '/' + key : ''), cb) || // {{{2
    watchSameTab(key, cb),
  // }}}2
}

function watchSameTab (key, cb) { // {{{1
  if (!wst) {
    // Override setItem
    wst = { setItem: Storage.prototype.setItem,}
    Storage.prototype.setItem = function(key, value) {
      wst.setItem.apply(this, arguments);
      window.dispatchEvent(new CustomEvent('local-storage-change', {
        detail: { key, newValue: value }
      }));
    };

    // Listen to your custom event
    window.addEventListener('local-storage-change', (event) => {
      cb(null, event.detail.key)
    });
  }
  return { close: _ => console.log('watchSameTab DONE') };
}

export default vault // {{{1
/*
From Gemini: {{{2

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

More: {{{2

function watchStorage(key, callback) {
  // Watch other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === key) callback(e.newValue, e.oldValue);
  });
  // Watch current tab
  window.addEventListener('local-storage-change', (e) => {
    if (e.detail.key === key) callback(e.detail.value, null);
  });
}

// Usage
watchStorage('my-watched-key', (newValue, oldValue) => {
  console.log('Storage changed to:', newValue);
});
}}}2
*/
