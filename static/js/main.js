// Main JavaScript Logic

// --- Map Initialization ---
let map;
let routeLayer;

function initMap() {
    // Default center: Matterhorn area
    const defaultCenter = [45.9764, 7.6586]; 
    
    map = L.map('map', {
        center: defaultCenter,
        zoom: 12,
        scrollWheelZoom: false,
        zoomControl: false
    });

    // Dark Matter Basemap (CartoDB)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Add zoom control to top right
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // Initial Route (Mock)
    const mockRoute = [
        [46.0207, 7.7491], // Zermatt
        [46.0169, 7.7450],
        [46.0100, 7.7400],
        [46.0000, 7.7300],
        [45.9900, 7.7200],
        [45.9800, 7.7100],
        [45.9764, 7.7075], // Hörnlihütte
    ];

    drawRoute(mockRoute);
}

function drawRoute(coordinates) {
    if (routeLayer) {
        map.removeLayer(routeLayer);
    }

    if (coordinates && coordinates.length > 0) {
        routeLayer = L.polyline(coordinates, {
            color: '#8B5CF6', // Viator Purple
            weight: 4,
            opacity: 0.8,
            lineCap: 'round'
        }).addTo(map);

        map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
    }
}

// --- File Upload Handling ---
async function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/parse-gpx', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();
        
        if (data.track && data.track.length > 0) {
            drawRoute(data.track);
            // Optional: Update UI with track name/description if needed
            console.log('Loaded track:', data.name);
        } else {
            alert('No valid track data found in file.');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to parse GPX file.');
    }
}

// --- UI Interactions ---

// Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 50) {
        header.classList.add('bg-black/50', 'backdrop-blur-md', 'border-b', 'border-white/5');
        header.classList.remove('bg-transparent');
    } else {
        header.classList.remove('bg-black/50', 'backdrop-blur-md', 'border-b', 'border-white/5');
        header.classList.add('bg-transparent');
    }
});

// Smooth Scroll
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Expand Trips
function expandTrips() {
    const grid = document.getElementById('trips-grid');
    const btnContainer = document.getElementById('expand-btn-container');
    
    // Clear current grid
    grid.innerHTML = '';
    
    // Add all trips
    ALL_TRIPS.forEach(trip => {
        const card = createTripCard(trip);
        grid.appendChild(card);
    });

    // Change button to collapse
    btnContainer.innerHTML = `
        <button onclick="collapseTrips()" class="text-zinc-500 hover:text-white text-xs uppercase tracking-widest transition-colors">
            Collapse Archive
        </button>
    `;
}

function collapseTrips() {
    const grid = document.getElementById('trips-grid');
    const btnContainer = document.getElementById('expand-btn-container');
    
    grid.innerHTML = '';
    
    // Add first 3 trips
    ALL_TRIPS.slice(0, 3).forEach(trip => {
        const card = createTripCard(trip);
        grid.appendChild(card);
    });

    // Reset button
    btnContainer.innerHTML = `
        <button onclick="expandTrips()" class="group flex flex-col items-center gap-2 text-zinc-500 hover:text-white transition-colors">
            <span class="text-xs uppercase tracking-widest">Show All Archive</span>
            <div class="p-3 rounded-full border border-white/10 group-hover:border-white/30 transition-all group-hover:bg-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
            </div>
        </button>
    `;
}

function createTripCard(trip) {
    const div = document.createElement('div');
    div.className = 'trip-card group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer bg-zinc-900 border border-white/5 hover:border-white/20 transition-colors';
    div.onclick = () => openTripDetail(trip.id);
    
    div.innerHTML = `
        <img src="${trip.image}" alt="${trip.name}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-80" referrerpolicy="no-referrer">
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>
        
        <div class="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <span class="text-purple-400 text-xs font-mono mb-2 block">${trip.date}</span>
            <h3 class="font-display text-2xl font-bold text-white mb-1">${trip.name}</h3>
            <div class="flex items-center gap-4 text-zinc-400 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${trip.location}
                </span>
                <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg> ${trip.elevation}
                </span>
            </div>
        </div>
    `;
    return div;
}

// Trip Details Modal
function openTripDetail(id) {
    const trip = ALL_TRIPS.find(t => t.id === id);
    if (!trip) return;

    const modal = document.getElementById('trip-modal');
    const content = document.getElementById('modal-content');
    
    // Populate data
    const modalImage = document.getElementById('modal-image');
    modalImage.src = trip.image;
    
    document.getElementById('modal-date').textContent = trip.date;
    document.getElementById('modal-title').textContent = trip.name;
    document.getElementById('modal-description').textContent = trip.description;
    document.getElementById('modal-elevation').textContent = trip.elevation;
    document.getElementById('modal-location').textContent = trip.location;

    // Show modal
    modal.classList.remove('hidden');
    // Force reflow
    void modal.offsetWidth;
    modal.classList.remove('opacity-0');
    content.classList.remove('scale-95');
    content.classList.add('scale-100');
    
    document.body.style.overflow = 'hidden';
}

function closeTripDetail() {
    const modal = document.getElementById('trip-modal');
    const content = document.getElementById('modal-content');

    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }, 300);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});
