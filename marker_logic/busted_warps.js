var busted_warps_group = L.layerGroup();
var busted_warps_group_name = 'Busted Warps';

var busted_geoJson = L.geoJSON(busted_warps, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
            icon: L.ExtraMarkers.icon({
                icon: 'fa-star',
                prefix: 'fas',
                iconColor: '#ffff00',
                shape: 'circle',
                markerColor: 'blue'
            }),
            interactive: false
        });
    },
    onEachFeature: (feature, layer) => {
        if (feature.geometry.type == "Point") {
            return;
        }

        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }
});
busted_geoJson.addTo(busted_warps_group)

if (!marker.has('busted_warps')) {
    marker.set('busted_warps', new Map());
}
marker.get('busted_warps').set('group', busted_warps_group);
marker.get('busted_warps').set('name', busted_warps_group_name);
