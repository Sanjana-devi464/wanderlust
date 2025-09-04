const mongoose = require('mongoose');
const initdata = require('./data.js');
const Listing = require('../models/listing.js');

const MONGO_URL = "mongodb://localhost:27017/wanderlust";

main().
    then(() => {
    console.log("Connected to MongoDB");
    return initDB();
})
    .then(() => {
    console.log("Database initialization completed");
    mongoose.connection.close();
})
   .catch((err) => {
    console.error("Error:", err);
    mongoose.connection.close();
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
      await Listing.deleteMany({});
      
      // Function to determine category based on title and description
      const determineCategory = (listing) => {
          const text = (listing.title + ' ' + listing.description + ' ' + listing.location).toLowerCase();
          
          if (text.includes('mountain') || text.includes('aspen') || text.includes('highland') || text.includes('peak')) return 'Mountains';
          if (text.includes('castle') || text.includes('fort') || text.includes('palace')) return 'Castles';
          if (text.includes('camp') || text.includes('tent') || text.includes('outdoor')) return 'Camping';
          if (text.includes('farm') || text.includes('rural') || text.includes('countryside')) return 'Farms';
          if (text.includes('arctic') || text.includes('snow') || text.includes('ice') || text.includes('winter')) return 'Arctic';
          if (text.includes('pool') || text.includes('swimming') || text.includes('spa')) return 'Amazing Pools';
          if (text.includes('tree') || text.includes('forest') || text.includes('nature') || text.includes('wildlife')) return 'Nature';
          if (text.includes('dome') || text.includes('igloo') || text.includes('unique')) return 'Domes';
          if (text.includes('boat') || text.includes('yacht') || text.includes('sail') || text.includes('marine')) return 'Boats';
          if (text.includes('room') || text.includes('suite') || text.includes('bedroom')) return 'Rooms';
          if (text.includes('city') || text.includes('urban') || text.includes('downtown') || text.includes('york') || text.includes('paris') || text.includes('london') || text.includes('tokyo') || text.includes('florence') || text.includes('amsterdam') || text.includes('dubai')) return 'Iconic Cities';
          
          return 'Trending'; // Default category
      };
      
      initdata.data = initdata.data.map((obj) => ({
          ...obj , 
          owner: "6891d5f63855e62820dd40a5",
          geometry: {
              type: "Point",
              coordinates: [0, 0] // Default coordinates, you can update these later
          },
          category: obj.category || determineCategory(obj) // Use existing category or determine automatically
      }));
      
      await Listing.insertMany(initdata.data);
      console.log("Database initialized with sample data and categories.");
}

initDB();