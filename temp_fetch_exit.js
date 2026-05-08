const Papa = require('papaparse');
require('dotenv').config({ path: '.env.local' });

async function fetchExit() {
  const url = `https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=exit&headers=1`;
  const res = await fetch(url);
  const text = await res.text();
  console.log(text);
}
fetchExit();
