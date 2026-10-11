mapboxgl.accessToken = mapToken;

const mapContainer = document.getElementById("map");
let coordinates = [77.209, 28.6139];
let listingTitle = "PG Location";

if (mapContainer && mapContainer.dataset.coordinates) {
  try {
    coordinates = JSON.parse(mapContainer.dataset.coordinates);
  } catch {
    coordinates = [77.209, 28.6139];
  }
}

if (mapContainer && mapContainer.dataset.title) {
  listingTitle = mapContainer.dataset.title;
}

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: coordinates,
  zoom: 8,
});

const popupContent = document.createElement("div");
const h4 = document.createElement("h4");
h4.textContent = listingTitle;
const p = document.createElement("p");
p.textContent = "Exact Location will be provided after booking";
popupContent.appendChild(h4);
popupContent.appendChild(p);

new mapboxgl.Marker({ color: "red" })
  .setLngLat(coordinates)
  .setPopup(new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent))
  .addTo(map);
