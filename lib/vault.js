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

