// https://www.techtrail.net/creating-an-interactive-map-with-leaflet-js/
var coordinate_finder = L.marker([0, 0], {
    draggable: true,
});
coordinate_finder.on('dragend', function (e) {
    coordinate_finder.getPopup().setContent('<span style="white-space: pre">' + JSON.stringify(coordinate_finder.toGeoJSON(), null, 4) + '</span>').openOn(map);
});
