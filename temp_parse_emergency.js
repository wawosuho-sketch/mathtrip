const fs = require('fs');
const Papa = require('papaparse');

async function fetchEmergency() {
  const url = `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/gviz/tq?tqx=out:csv&sheet=emergency`;
  try {
    const res = await fetch(url);
    const csv = await res.text();
    Papa.parse(csv, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("Parsed Rows:", results.data);
      }
    });
  } catch (e) {
    console.error(e);
  }
}

fetchEmergency();
