# mecklenburg-quality-of-life-data

Mecklenburg County data for the Quality of Life Dashboard.

## Related Projects

- [quality-of-life-dashboard](https://github.com/tobinbradley/quality-of-life-dashboard)
- [quality-of-life-report](https://github.com/tobinbradley/quality-of-life-report)
- [quality-of-life-embed](https://github.com/tobinbradley/quality-of-life-embed)

## Get Started

This project requires [NodeJS](http://nodejs.org/).

```bash
git clone https://github.com/tobinbradley/mecklenburg-quality-of-life-data.git data
cd data
npm install
```

It isn't meant as a stand-alone repository, but rather to be used with the other Quality of Life projects.

## Customizing your Data

![data design](http://i.imgur.com/pRdRkFG.png)

There are several parts to configuring this repo:

- Creating your geography (GeoJSON)
- Creating your data files (CSV)
- Creating your metadata (Markdown)
- Updating configuration files

The existing files are a good guidepost for creating your own, so dig in before you get started.

### Creating your geography

The first thing you'll need is your geography, in GeoJSON. Your geography:

- Must be named `geography.geojson.json` and placed in the root folder.
- Must be WGS84 (EPSG:4326).
- Must contain an `id` property that's a string and a unique identifier for each polygon that you'll use for your data files.

For serving and rendering GeoJSON, smaller is better, but watch out for topologically unaware simplification tools, as they'll leave ugly slivers in your data. You could use `v.generalize` in [QGIS](http://qgis.org/en/site/) (or [GRASS](http://grass.osgeo.org/) directly), or you could go the shapefile->[topojson](http://grass.osgeo.org/)->geojson route.

### Creating your data files

Data files are simple CSV's in the format:

```csv
id,y_2000,y_2010
jim,23,432
suzy,,100
```

The file header is `id` and each year of data is expressed as `y_<year>`. No data values are empty, like `suzy,,100`. CSV files are processed into JSON by the consuming applications. Each metric file will be named with a metric number found in `/config/data.js`.

The type of data will decide the files required:

- `sum`: The data is summed when polygons are selected. This will require a `r<metric>.csv` file.
- `mean`: The data is averaged when polygons are selected. This will require a `n<metric>.csv` file.
- `weighted`: A weighted average is calculated when polygons are selected. This requires the raw data in `r<metric>.csv` and a denominator for weighting/calculations in `d<metric>.csv`. r/d is each individual polygon value.

After creating your data files, run the test suite to make sure the basics check out.

```bash
npm run test --silent
```

### Creating your metadata

Metadata files in markdown format are located in `/meta`. Each metadata file is named in format `m<metric number>.md` with heading tags _exactly_ like this:

```markdown
## Title of Metric

Median age of poodles

### Why is this important?

Because we like poodles.

### About the Data

I hang out at dog parks and type stuff in my phone. Circa 1986.

### Additional Resources

Dog pound yo.
```

The markdown is processed to HTML by the consuming projects, and as there's a lot of ugly text processing going on, messing with the layout will involve tinkering with code.

### Updating configuration files

There are two configuration files:

- `data.json`: Configuration information for your metrics.
- `groups.json`: Groups of your geography units that you want to make selectable as a group.



### Tips and Gotchas

#### CSV column case sensitivity

Spreadsheet software often likes to capitalize the first letter in the `y_XXXX` field. That will turn your life into a furious ball of nothing. On a 'nix machine you can fix your files automatically via `npm run clean-csv`.

#### Sort on the ID

Your CSV files should be sorted on the metric ID. On a 'nix machine you can sort them automatically via `npm run clean-csv`.

#### Beware the hanging zero

Some identifiers like Census tracts can have a hanging zero, like 541.10. If you are manipulating your data files in spreadsheet software, make sure your ID column is being treated as a string and not a number or it will get dropped and your life will be destroyed.

#### Don't add H2 (##) or H3 (###) tags to the metadata

Because we're using those as choppers for layout, adding more of those will screw up your formatting.

#### Beware weird, non-web safe characters in Markdown

Don't edit Markdown in Word. You're welcome.


## data.json

```javascript
{
  // metric identifier "m<the metric number>"
  "m2": {
    // metric number
    "metric": "2",
    // indicates accuracy data is bundled (optional)
    "accuracy": "true",
    // data category grouping
    "category": "Character",
    // number of decimal places to display (default is 0) (optional)
    "decimals": 1,
    // metric unit informaiton (optional)
    "label": "Years",
    // prefix for number display (optional)
    "prefix": "$",
    // [optional] label for raw number if available (also makes raw number visible)
    "raw_label": "units",
    // suffix for number display (optional)
    "suffix": "%",
    // title
    "title": "Age of Residents",
    // type of calculation: sum, mean, or weighted
    "type": "weighted",
    // override total geography value for particular years (optional)
    "world_val": {
      "y_2015": 35
    },
    // longer metric description
    "subtitle": "How old the people are"
  }
}
```
