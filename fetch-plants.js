const fs = require('fs');

async function fetchPlants() {
  const path = 'garden/landscape-design/data/';
  
  // 1. Read the state and the API key
  const state = JSON.parse(fs.readFileSync(path + 'state.json', 'utf8'));
  const apiKey = process.env.API_KEY;

  console.log(`Fetching page ${state.current_page}...`);

  // 2. Fetch the data from Perenual
  const response = await fetch(`https://perenual.com/api/v2/species-list?key=${apiKey}&page=${state.current_page}`);
  const json = await response.json();

  // 3. Update the data
  let fullData = JSON.parse(fs.readFileSync(path + 'garden-data.json', 'utf8'));
  fullData.plants = fullData.plants.concat(json.data);
  
  // 4. Save the updated data and the new state
  fs.writeFileSync(path + 'garden-data.json', JSON.stringify(fullData, null, 2));
  state.current_page += 1;
  fs.writeFileSync(path + 'state.json', JSON.stringify(state, null, 2));
  
  console.log(`Success! Ready for page ${state.current_page} next time.`);
}

fetchPlants();
