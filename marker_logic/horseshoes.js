var horseshoes_group_name = 'Horseshoes';
var horseshoes_group_id = 'horseshoes';
var horseshoes_create_checkbox = true;

var horseshoes_list = createSidebarTab(horseshoes_group_id, horseshoes_group_name, '<i class="fas fa-horse"></i>');
var horseshoes_group = L.markerClusterGroup({
    maxClusterRadius: 20
});

L.geoJSON(horseshoes, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: getCustomIcon('fa-horse'),
            riseOnHover: true
        });
    },
    onEachFeature: (feature, layer) => {
        addPopup(feature, layer, {
            layer_group: horseshoes_group,
            list: horseshoes_list,
            list_id: horseshoes_group_id,
            create_checkbox: horseshoes_create_checkbox
        });
        saveMarker(feature, layer, {
            list_id: horseshoes_group_id
        });
    }
}).addTo(horseshoes_group);
marker.get(horseshoes_group_id).set('group', horseshoes_group);
marker.get(horseshoes_group_id).set('name', horseshoes_group_name);

if (horseshoes_create_checkbox) {
    setColumnCount(marker.get(horseshoes_group_id), horseshoes_list);
}

// Add as a default layer
// This needs the display name because the layer control don't report ids
default_layers.push(horseshoes_group_name);
