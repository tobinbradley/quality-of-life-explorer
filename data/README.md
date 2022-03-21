# Data Configuration

## Customizing your Data

There are three pieces to the Dashboard data:

* The `data.json` configuration file
* `metadata`: a markdown file named for each metric containing metadata and placed in the metadata folder.
* `metric data`: data in CSV format for each metric that is used to build the metric.
* The geography in GeoJSON, located in `public/data/geography/geography.geojson.json`.


![data design](http://i.imgur.com/pRdRkFG.png)

There are several parts to configuring this repo:

- Creating your geography (GeoJSON)
- Creating your data files (CSV)
- Creating your metadata (Markdown)
- Updating the `data.json` configuration file

The existing files are a good guidepost for creating your own, so dig in before you get started.

### Creating your geography

The first thing you'll need is your geography, in GeoJSON. Your geography:

- Must be named `geography.geojson.json`
- Must be WGS84 (EPSG:4326).
- Must contain an `id` property that's a string and a unique identifier for each polygon that you'll use for your data files.

For serving and rendering GeoJSON, smaller is better. Try using [mapshaper](https://mapshaper.org/) to squeeze it down as much as possible.

### Creating your data files

Data files are CSV's in the format:

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
  // metric id, required
  "metric": "m2",
  // metric category, required
  "category": "Character",
  // label for units, optional
  "label": "years",
  // metric title, required
  "title": "Age of Residents",
  // overrides full geometry value for metric for given year, optional
  "world_val": {
    "y_2017": 35
  },
  // overrides full geometry value for raw value for given year, optional
  "raw_val": {
    "y_2017": 35
  },
  // descriptive subtitle, optional
  "subtitle": "Median age of residents",
  // related metric id's, optional
  "related": ["m47", "m13", "m12"],
  // label for raw data, also tells Dashboard to display raw data, optional
  "raw_label": "people",
  // variable is a raw sum value, optional
  "sum": true
}, ...
```
