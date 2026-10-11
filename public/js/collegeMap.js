/* global mapboxgl, mapToken */
if (typeof mapToken !== "undefined" && typeof mapboxgl !== "undefined") {
  mapboxgl.accessToken = mapToken;

  const mapContainer = document.getElementById("college-map");

  if (mapContainer && mapContainer.dataset.collegeCoords) {
    let collegeCoords = [77.209, 28.6139];
    let collegeName = "Campus";
    let markersData = [];

    try {
      collegeCoords = JSON.parse(mapContainer.dataset.collegeCoords);
    } catch {
      collegeCoords = [77.209, 28.6139];
    }

    if (mapContainer.dataset.collegeName) {
      collegeName = mapContainer.dataset.collegeName;
    }

    if (mapContainer.dataset.pgMarkers) {
      try {
        markersData = JSON.parse(mapContainer.dataset.pgMarkers);
      } catch {
        markersData = [];
      }
    }

    const map = new mapboxgl.Map({
      container: "college-map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: collegeCoords,
      zoom: 13,
    });

    map.addControl(new mapboxgl.NavigationControl());

    // 1. Add College Marker (Blue)
    const collegeEl = document.createElement("div");
    collegeEl.className = "college-marker";
    collegeEl.innerHTML = '<i class="fa-solid fa-graduation-cap" style="color: #0d6efd; font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></i>';

    const collegePopup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<strong>${collegeName}</strong><br><small class="text-muted">Campus Center</small>`
    );

    new mapboxgl.Marker({ element: collegeEl })
      .setLngLat(collegeCoords)
      .setPopup(collegePopup)
      .addTo(map);

    // 2. Add PG Markers (Red)
    markersData.forEach((pg) => {
      if (pg.coordinates && pg.coordinates.length === 2) {
        const pgEl = document.createElement("div");
        pgEl.className = "pg-marker";
        pgEl.innerHTML = '<i class="fa-solid fa-house-chimney" style="color: #fe424d; font-size: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></i>';

        const popupDiv = document.createElement("div");
        const titleEl = document.createElement("strong");
        titleEl.textContent = pg.title;
        popupDiv.appendChild(titleEl);

        const distEl = document.createElement("div");
        distEl.className = "small text-muted";
        distEl.textContent = `${pg.distanceFormatted} away`;
        popupDiv.appendChild(distEl);

        if (pg.rentMin) {
          const rentEl = document.createElement("div");
          rentEl.className = "small text-success fw-bold";
          rentEl.textContent = `₹${pg.rentMin.toLocaleString("en-IN")}/mo`;
          popupDiv.appendChild(rentEl);
        }

        const linkEl = document.createElement("a");
        linkEl.href = `/listings/${pg.id}`;
        linkEl.className = "btn btn-sm btn-danger mt-1 text-white text-decoration-none";
        linkEl.style.fontSize = "11px";
        linkEl.textContent = "View PG";
        popupDiv.appendChild(linkEl);

        const pgPopup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupDiv);

        new mapboxgl.Marker({ element: pgEl })
          .setLngLat(pg.coordinates)
          .setPopup(pgPopup)
          .addTo(map);
      }
    });

    // Fit map bounds if markers exist
    if (markersData.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend(collegeCoords);
      markersData.forEach((pg) => {
        if (pg.coordinates && pg.coordinates.length === 2) {
          bounds.extend(pg.coordinates);
        }
      });
      map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }
  }
}
