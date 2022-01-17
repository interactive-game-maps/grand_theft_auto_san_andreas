var busted_warps_group_name = 'Busted Warps';
var busted_warps_group_id = 'busted_Warps';

var busted_warps_group = L.markerClusterGroup({
    maxClusterRadius: 20
});

var busted_geoJson = L.geoJSON(busted_warps, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: getCustomIcon('fa-star'),
            interactive: false
        });
    },
    onEachFeature: (feature, layer) => {
        layer.on({
            mouseover: e => {
                highlightFeatureId(busted_warps_group_id, e.target.feature.properties.id)
            },
            mouseout: e => {
                highlightFeatureRemoveAll();
            },
            click: e => {
                preventShareMarker();
                zoomToFeature(busted_warps_group_id, e.target.feature.properties.id);
                setHistoryState(busted_warps_group_id, e.target.feature.properties.id);
            }
        });

        saveMarker(feature, layer, {
            list_id: busted_warps_group_id
        });
    }
}).addTo(busted_warps_group)
geoJSONs.push(busted_geoJson);

marker.get(busted_warps_group_id).set('group', busted_warps_group);
marker.get(busted_warps_group_id).set('name', busted_warps_group_name);
