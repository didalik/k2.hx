import fs from 'fs' // {{{1

const dirname = process.env.VAULT ?? process.env.PWD + '/vault' // {{{1

const vault = { // {{{1
  get: key => { // {{{2
    let v
    try {
      v = fs.readFileSync(dirname + '/' + key)
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
  put: (key, value, options) => { // {{{2
    console.log('vault.put key', key, 'value', value)

    fs.mkdirSync(dirname, { recursive: true, })
    fs.writeFileSync(dirname + '/' + key, JSON.stringify(value), options)
  },
  watch: (key, callback) => fs.watch(dirname + (key ? '/' + key : ''), callback) // {{{2
  // }}}2
}

export default vault // {{{1

