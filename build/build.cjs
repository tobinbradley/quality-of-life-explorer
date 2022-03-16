const fs = require('fs')
var path = require('path')
const csv = require('csvtojson')
const config = require('../data/data.json')
const marked = require('marked')

const metaSrc = path.resolve('./data/meta')
const metaDest = './public/data/meta/'
const dataSrc = path.resolve('./data/metric/')
const dataDest = path.resolve('./public/data/metric/')

fs.mkdirSync(metaDest, { recursive: true }, (err) => {
  if (err) throw err
})
fs.mkdirSync(dataDest, { recursive: true }, (err) => {
  if (err) throw err
})

/********************************************* */
// Start Meta
/********************************************* */
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
})

var _getAllFilesFromFolder = function(dir) {
  var filesystem = require('fs');
  var results = [];

  filesystem.readdirSync(dir).forEach(function(file) {
    file = path.join(dir, file);
    var stat = filesystem.statSync(file);
    if (stat && stat.isDirectory() && path.extname(file) === '.md') {
      results = results.concat(_getAllFilesFromFolder(file));
    } else results.push(file);
  });
  return results;
};

let files = _getAllFilesFromFolder(metaSrc);

for (let i = 0; i < files.length; i++) {
  fs.readFile(files[i], 'utf-8', (err, data) => {
    if (err) {
      return console.log(err);
    }

    marked.parse(data.replace(/[\u200B-\u200D\uFEFF]/g, ''), function(err, content) {
      if (err) {
        return console.log(err);
      }
      fs.writeFileSync(path.join(metaDest, path.basename(files[i]).split('.')[0]) +
      '.html', content);
    });
  });
}

/********************************************* */
// End Meta
/********************************************* */

const objectToArray = obj => {
  const keys = Object.keys(obj);
  const res = [];
  for(let i = 0; i < keys.length; i++){
     res.push(obj[keys[i]]);
  };
  return res;
};


// return true if convertable to number
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}



const goNPA = async () => {
  for (const el of config) {
    const data = {}

    // r and years
    if (fs.existsSync(path.join(dataSrc, `r${el.metric.replace('m', '')}.csv`))) {
      data.r = {}
      const rJSON = await csv().fromFile(path.join(dataSrc, `r${el.metric.replace('m', '')}.csv`))
      const keys = Object.keys(rJSON[0])
      keys.shift()
      data.years = keys.map(el => el.replace('y_', ''))

      rJSON.forEach((rec, idx) => {
        const objectVals = objectToArray(rec)
        objectVals.shift()
        data.r[rec.id] = objectVals.map(n => isNumeric(n) ? Number(n) : null)
      })
    }

    // d
    if (fs.existsSync(path.join(dataSrc, `d${el.metric.replace('m', '')}.csv`))) {
      data.d = {}
      const rJSON = await csv().fromFile(path.join(dataSrc, `d${el.metric.replace('m', '')}.csv`))

      rJSON.forEach((rec, idx) => {
        const objectVals = objectToArray(rec)
        objectVals.shift()
        data.d[rec.id] = objectVals.map(n => isNumeric(n) ? Number(n) : null)
      })
    }

    // a
    if (fs.existsSync(path.join(dataSrc, `m${el.metric.replace('m', '')}-accuracy.csv`))) {
      data.a = {}
      const rJSON = await csv().fromFile(path.join(dataSrc, `m${el.metric.replace('m', '')}-accuracy.csv`))

      rJSON.forEach((rec, idx) => {
        const objectVals = objectToArray(rec)
        objectVals.shift()
        data.a[rec.id] = objectVals.map(n => isNumeric(n) ? Number(n) : null)
      })
    }

    // make map value and remove others
    if (data.r && !data.d) {
      data.m = data.r
      delete data.r
    } else {
      data.m = {}
      for (const key in data.r) {
        const mVals = []
        data.r[key].forEach((el, idx) => {
          if (isNumeric(el) && isNumeric(data.d[key][idx])) {
            mVals.push(
              Math.round((el / data.d[key][idx]) * 10000) / 10000
            )
          } else {
            mVals.push(null)
          }
        })
        data.m[key] = mVals
      }
      delete data.r
    }



    fs.writeFileSync(path.join(dataDest, `${el.metric}.json`), JSON.stringify(data, null, ''))

  }
}









goNPA()
