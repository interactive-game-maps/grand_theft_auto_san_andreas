// https://www.techtrail.net/creating-an-interactive-map-with-leaflet-js/
var coordinate_finder = L.marker([0, 0], {
    draggable: true,
});
coordinate_finder.on('dragend', function (e) {
    coordinate_finder.getPopup().setContent('<span style="white-space: pre">' + JSON.stringify(coordinate_finder.toGeoJSON(), null, 4) + '</span>').openOn(map);
});
document.getElementById("add_marker_toggle").addEventListener('change', () => {
    if (document.getElementById("add_marker_toggle").checked) {
        coordinate_finder.addTo(map);
        coordinate_finder.setLatLng(map.getCenter());
        coordinate_finder.bindPopup('Coordinate Finder').openPopup();
    } else {
        map.removeLayer(coordinate_finder);
    }
});
