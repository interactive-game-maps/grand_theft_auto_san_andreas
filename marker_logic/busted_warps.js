var busted_warps_group_name = 'Busted Warps';
var busted_warps_group_id = 'busted_Warps';

var busted_warps_group = L.layerGroup();

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
            mouseout: (e) => {
                busted_geoJson.resetStyle(e.target);
            },
            click: (e) => {
                zoomToFeature(busted_warps_group_id, e.target.feature.properties.id);
                history.replaceState({}, "", "?list=" + busted_warps_group_id + "&id=" + e.target.feature.properties.id);
            }
        });

        saveMarker(feature, layer, {
            list_id: busted_warps_group_id
        });
    }
}).addTo(busted_warps_group)

marker.get(busted_warps_group_id).set('group', busted_warps_group);
marker.get(busted_warps_group_id).set('name', busted_warps_group_name);
