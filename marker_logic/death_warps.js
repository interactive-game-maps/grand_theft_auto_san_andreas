var death_warps_group = L.layerGroup();

var deaths_geoJson = L.geoJSON(death_warps, {
    pointToLayer: function (feature, latlng) {
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
    onEachFeature: function (feature, layer) {
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
