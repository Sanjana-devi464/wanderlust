# Map Setup Instructions

## Setting up Mapbox for Location Display

The application now includes interactive maps to show listing locations. Follow these steps to enable the map functionality:

### 1. Get a Mapbox Access Token
1. Go to [https://account.mapbox.com/](https://account.mapbox.com/)
2. Sign up for a free account or log in
3. Navigate to "Access tokens" in your account
4. Copy your "Default public token" or create a new one

### 2. Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Replace `your_mapbox_access_token_here` with your actual Mapbox token:
   ```
   MAP_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV0c...
   ```

### 3. Restart the Application
After adding the MAP_TOKEN, restart your server to load the new environment variables.

## Features

- **Interactive Maps**: Each listing shows an interactive map with the location
- **Geocoding**: New listings automatically convert location text to coordinates
- **Fallback Display**: Shows appropriate messages when maps aren't configured
- **Responsive Design**: Maps work on all device sizes

## Troubleshooting

- If maps show "Map service not configured": Check your MAP_TOKEN in .env
- If maps show "Location coordinates not available": The listing needs valid location data
- For existing listings: Run `node updateListings.js` to add default coordinates

## Map Display Location

Maps appear on each listing's detail page, in a section titled "Where you'll be", positioned just before the footer.
