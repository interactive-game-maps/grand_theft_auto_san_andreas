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
                icon: getCustomIcon('fa-hospital'),
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
                preventShareMarker();
                zoomToFeature(death_warps_group_id, e.target.feature.properties.id);
                setHistoryState(death_warps_group_id, e.target.feature.properties.id);
            }
        });

        saveMarker(feature, layer, {
            list_id: death_warps_group_id
        });
    }
}).addTo(death_warps_group);

marker.get(death_warps_group_id).set('group', death_warps_group);
marker.get(death_warps_group_id).set('name', death_warps_group_name);
