const test = require("ava");
const fs = require("fs");
const path = require('path')
const dataConfig = require("../data.json");
const geoJSON = require("../../public/data/geography/geography.geojson.json");

// geojson id's into sorted array
let geoids = [];
for (let i = 0; i < geoJSON.features.length; i++) {
  geoids.push(geoJSON.features[i].properties.id);
}
geoids.sort((a, b) =>
  a.localeCompare(b, "en", { numeric: true, ignorePunctuation: true })
);

// test if array is fully equal
function arraysEqual(a, b) {
  a = Array.isArray(a) ? a : [];
  b = Array.isArray(b) ? b : [];
  return a.length === b.length && a.every((el, ix) => el === b[ix]);
}

// test if array has same contents
function arraysContainSame(a, b) {
  a = Array.isArray(a) ? a : [];
  b = Array.isArray(b) ? b : [];
  return a.length === b.length && a.every((el) => b.includes(el));
}

// make sure correct files exist for computation method
dataConfig.forEach(el => {
  const file = path.resolve(`./data/metric/r${el.metric.replace('m', '')}.csv`)
  const dfile = path.resolve(`./data/metric/d${el.metric.replace('m', '')}.csv`)
  const afile = path.resolve(`./data/metric/${el.metric}-accuracy.csv`)
  const metafile = path.resolve(`./data/meta/${el.metric}.md`)

  test(`file exists for ${file}`, (t) => {
    t.true(
      fs.existsSync(file),
      `file ${file} exists`
    );
  });

  test(`meta file exists for ${metafile}`, (t) => {
    t.true(
      fs.existsSync(metafile),
      `file ${metafile} exists`
    );
  });

  // test file id's and headers
  checkFileContents(file)
  if (fs.existsSync(dfile)) checkFileContents(dfile)
  if (fs.existsSync(afile)) checkFileContents(afile)

})

function checkFileContents(file) {
  const fileContents = fs.readFileSync(file).toString()
  const lines = fileContents.split(/\r?\n/)

  let ids = []

  lines.forEach((line, idx) => {
    if (idx === 0) {
      test(`lowercase ${file} ${idx} headers`, async (t) => {
        t.true(line === line.toLowerCase(), "keys lower case");
      });

      line.split(",").forEach((l, index) => {
        if (index === 0) {
          test(`${file} col ${index} id header check`, t => {
            t.true(l.replace(/^\uFEFF/gm, "").replace(/^\u00BB\u00BF/gm,"") === "id")
          })
        }
        if (index > 0) {
          test(`${file} col ${index} y_ header check`, t => {
            t.true(l.substring(0,2) === "y_")
          })
        }
      })

    } else {
      if (line.split(",")[0].length > 0)
        ids.push(line.split(",")[0]);
    }
  })

  // test id's
  test(`id check for ${file}`, async (t) => {
    t.true(arraysEqual(geoids, ids), "id matches");
  });

}
