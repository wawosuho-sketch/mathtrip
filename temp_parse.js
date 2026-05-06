const fs = require('fs');
const Papa = require('papaparse');

async function parseSheet(sheet) {
  const url = `https://docs.google.com/spreadsheets/d/1nZAWehFS4m7SGeznZ1VW7tI8yv20KrOyTT0NoMrifZY/gviz/tq?tqx=out:csv&sheet=${sheet}`;
  try {
    const res = await fetch(url);
    const csv = await res.text();
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log(`\n=== ${sheet} ===`);
        console.log("Headers:", results.meta.fields);
        console.log("First 3 rows:", results.data.slice(0, 3));
      }
    });
  } catch (e) {
    console.error(e);
  }
}

parseSheet('emergency').then(() => parseSheet('teachercheck'));
