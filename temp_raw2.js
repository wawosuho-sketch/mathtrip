const fs = require('fs');
async function fetchRaw() {
  const url = `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/gviz/tq?tqx=out:csv&sheet=emergency&headers=0`;
  try {
    const res = await fetch(url);
    const csv = await res.text();
    console.log(csv);
  } catch(e) {
    console.error(e);
  }
}
fetchRaw();
