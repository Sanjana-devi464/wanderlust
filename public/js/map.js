
// Debug logging
console.log('Map script loaded');
console.log('Map Token:', typeof mapToken !== 'undefined' ? 'Present' : 'Missing');
console.log('Listing object:', typeof listing !== 'undefined' ? listing : 'Missing');
console.log('Mapbox GL available:', typeof mapboxgl !== 'undefined');

const mapContainer = document.getElementById('map');
if (!mapContainer) {
    console.error('Map container not found!');
} else {
    console.log('Map container found');
    
    if (typeof mapToken === 'undefined' || !mapToken) {
        console.error('Map token is missing!');
        mapContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: red; background: #f8f9fa; border: 1px solid #ddd; border-radius: 5px;">Map service not configured - Token missing</p>';
    } else if (typeof listing === 'undefined' || !listing || !listing.geometry || !listing.geometry.coordinates) {
        console.error('Listing coordinates are missing!');
        console.log('Listing details:', { 
            listingExists: typeof listing !== 'undefined', 
            geometry: listing?.geometry, 
            coordinates: listing?.geometry?.coordinates 
        });
        mapContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: red; background: #f8f9fa; border: 1px solid #ddd; border-radius: 5px;">Location data not available</p>';
    } else {
        try {
            console.log('Setting mapbox access token...');
            mapboxgl.accessToken = mapToken;

            console.log('Creating map with coordinates:', listing.geometry.coordinates);
            
            const map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v12',
                center: listing.geometry.coordinates,
                zoom: 10
            });

            console.log('Map created, adding marker...');

            const marker = new mapboxgl.Marker({color: "red"})
                .setLngLat(listing.geometry.coordinates)
                .setPopup(new mapboxgl.Popup({offset: 25, className: 'my-class'})
                .setHTML(`<h4>${listing.location}</h4><p>Explore the beauty of our listings!</p>`))
                .addTo(map);

            map.on('load', () => {
                console.log('✅ Map loaded successfully');
            });

            map.on('error', (e) => {
                console.error('❌ Map error:', e);
                mapContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: red; background: #f8f9fa; border: 1px solid #ddd; border-radius: 5px;">Failed to load map. Please check your internet connection.</p>';
            });

        } catch (error) {
            console.error('❌ Error creating map:', error);
            mapContainer.innerHTML = '<p style="padding: 20px; text-align: center; color: red; background: #f8f9fa; border: 1px solid #ddd; border-radius: 5px;">Map initialization failed: ' + error.message + '</p>';
        }
    }
}