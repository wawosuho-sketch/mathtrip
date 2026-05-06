const fs = require('fs');

async function fetchHeaders(sheet) {
  const url = `https://docs.google.com/spreadsheets/d/1nZAWehFS4m7SGeznZ1VW7tI8yv20KrOyTT0NoMrifZY/gviz/tq?tqx=out:csv&sheet=${sheet}`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(`=== ${sheet} ===`);
    console.log(text.split('\n')[0]);
    console.log(text.split('\n')[1]);
  } catch (e) {
    console.error(e);
  }
}

fetchHeaders('emergency');
