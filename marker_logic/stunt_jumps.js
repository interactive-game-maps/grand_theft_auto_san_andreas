var stunt_jumps_group_name = 'Unique Stunt Jumps';
var stunt_jumps_group_id = 'stunt_jumps';
var stunt_jumps_create_checkbox = true;

var stunt_jumps_list = createSidebarTab(stunt_jumps_group_id, stunt_jumps_group_name, '<i class="fas fa-car"></i>');

var stunt_jumps_group = L.featureGroup.subGroup(marker_cluster);

var stunt_jumps_geojson = L.geoJSON(stunt_jumps, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: getCustomIcon('fa-car'),
            riseOnHover: true
        });
    },
    onEachFeature: (feature, layer) => {
        addPopup(feature, layer, {
            layer_group: stunt_jumps_group,
            list: stunt_jumps_list,
            list_id: stunt_jumps_group_id,
            create_checkbox: stunt_jumps_create_checkbox
        });
        saveMarker(feature, layer, {
            list_id: stunt_jumps_group_id
        });

        layer.on({
            mouseover: e => {
                highlightFeatureId(stunt_jumps_group_id, e.target.feature.properties.id)
            },
            mouseout: e => {
                highlightFeatureRemoveAll();
            }
        });
    }
}).addTo(stunt_jumps_group);
geoJSONs.push(stunt_jumps_geojson);

marker.get(stunt_jumps_group_id).set('group', stunt_jumps_group);
marker.get(stunt_jumps_group_id).set('name', stunt_jumps_group_name);

if (stunt_jumps_create_checkbox) {
    setColumnCount(marker.get(stunt_jumps_group_id), stunt_jumps_list);
}
