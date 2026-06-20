const fs = require('fs');

async function fetchPlants() {
  // Ensure your file path is correct for your repo structure
  const path = 'garden/landscape-design/data/';
  
  // Load current state and data
  const state = JSON.parse(fs.readFileSync(path + 'state.json', 'utf8'));
  let fullData = JSON.parse(fs.readFileSync(path + 'garden-data.json', 'utf8'));
  const apiKey = process.env.API_KEY;

  console.log(`Starting enrichment for Page ${state.current_page}...`);

  // 1. Get the list of 100 plants
  const listResponse = await fetch(`https://perenual.com/api/v2/species-list?key=${apiKey}&page=${state.current_page}`);
  const listJson = await listResponse.json();

  // 2. Loop through each plant to get full details
  let detailedPlants = [];
  for (const plant of listJson.data) {
    console.log(`Fetching details for: ${plant.common_name} (ID: ${plant.id})...`);
    
    try {
      const detailResponse = await fetch(`https://perenual.com/api/v2/species/details/${plant.id}?key=${apiKey}`);
      const detail = await detailResponse.json();
      detailedPlants.push(detail);
      
      // Optional: Add a tiny delay to be polite to the API rate limits
      await new Promise(resolve => setTimeout(resolve, 200)); 
    } catch (error) {
      console.error(`Failed to fetch details for ID ${plant.id}:`, error);
    }
  }

  // 3. Update the data
  fullData.plants = fullData.plants.concat(detailedPlants);
  
  // 4. Save and Update State
  fs.writeFileSync(path + 'garden-data.json', JSON.stringify(fullData, null, 2));
  state.current_page += 1;
  fs.writeFileSync(path + 'state.json', JSON.stringify(state, null, 2));
  
  console.log(`Success! Page ${state.current_page - 1} fully enriched. Next page will be ${state.current_page}.`);
}

fetchPlants();
