import fs from 'fs' // {{{1

const dirname = process.env.PWD + '/vault' // {{{1

const vault = { // {{{1
  get: key => {
    console.log('vault.get key', key)

    try {
      return JSON.parse(fs.readFileSync(dirname + '/' + key));
    } catch (err) {
      return false;
    }
  },
  put: (key, value) => {
    console.log('vault.put key', key, 'value', value)

    fs.mkdirSync(dirname, { recursive: true, })
    fs.writeFileSync(dirname + '/' + key, JSON.stringify(value))
  },
}

export default vault // {{{1

