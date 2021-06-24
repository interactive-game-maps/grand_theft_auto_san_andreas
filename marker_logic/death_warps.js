var death_warps_group = L.layerGroup();
var death_warps_group_name = 'Death Warps';

var deaths_geoJson = L.geoJSON(death_warps, {
    pointToLayer: (feature, latlng) => {
        if (feature.properties.radius) {
            return L.circle(latlng, feature.properties.radius, {
                color: "#00ff00"
            });
        }
        else {
            return L.marker(latlng, {
                // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
                icon: L.ExtraMarkers.icon({
                    icon: 'fa-hospital',
                    prefix: 'fas',
                    iconColor: '#ff0000',
                    shape: 'circle',
                    markerColor: 'white'
                }),
                interactive: false
            });
        }
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
deaths_geoJson.addTo(death_warps_group);

if (!marker.has('death_warps')) {
    marker.set('death_warps', new Map());
}
marker.get('death_warps').set('group', death_warps_group);
marker.get('death_warps').set('name', death_warps_group_name);
