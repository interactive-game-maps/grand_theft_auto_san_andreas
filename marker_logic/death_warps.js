var death_warps_group_name = 'Death Warps';
var death_warps_group_id = 'death_warps';

var death_warps_group = L.layerGroup();

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
            mouseout: (e) => {
                deaths_geoJson.resetStyle(e.target);
            },
            click: (e) => {
                zoomToFeature(death_warps_group_id, e.target.feature.properties.id);
                history.replaceState({}, "", "?list=" + death_warps_group_id + "&id=" + e.target.feature.properties.id);
            }
        });

        saveMarker(feature, layer, {
            list_id: death_warps_group_id
        });
    }
}).addTo(death_warps_group);

marker.get(death_warps_group_id).set('group', death_warps_group);
marker.get(death_warps_group_id).set('name', death_warps_group_name);
