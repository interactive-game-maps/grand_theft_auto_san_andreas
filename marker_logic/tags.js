var tags_group_name = 'Spray Tags';
var tags_group_id = 'tags';
var tags_create_checkbox = true;

var tags_list = createSidebarTab(tags_group_id, tags_group_name, '<i class="fas fa-spray-can"></i>');
var tags_group = L.featureGroup.subGroup(marker_cluster);

L.geoJSON(tags, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: getCustomIcon('fa-spray-can'),
            riseOnHover: true
        });
    },
    onEachFeature: (feature, layer) => {
        addPopup(feature, layer, {
            layer_group: tags_group,
            list: tags_list,
            list_id: tags_group_id,
            create_checkbox: tags_create_checkbox
        });
        saveMarker(feature, layer, {
            list_id: tags_group_id
        });
    }
}).getLayers().forEach(layer => {
    tags_group.addLayer(layer);
});

marker.get(tags_group_id).set('group', tags_group);
marker.get(tags_group_id).set('name', tags_group_name);

if (tags_create_checkbox) {
    setColumnCount(marker.get(tags_group_id), tags_list);
}

// Add as a default layer
// This needs the display name because the layer control don't report ids
default_layers.push(tags_group_name);
