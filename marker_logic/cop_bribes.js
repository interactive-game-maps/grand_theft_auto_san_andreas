var cop_bribes_group_name = 'Cop Bribes';
var cop_bribes_group_id = 'cop_bribes';
var cop_bribes_create_checkbox = true;

var cop_bribes_list = createSidebarTab(cop_bribes_group_id, cop_bribes_group_name, '⭐');
var cop_bribes_group = L.markerClusterGroup({
    maxClusterRadius: 20
});

L.geoJSON(cop_bribes, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: getCustomIcon('⭐'),
            riseOnHover: true
        });
    },
    onEachFeature: (feature, layer) => {
        addPopup(feature, layer, {
            layer_group: cop_bribes_group,
            list: cop_bribes_list,
            list_id: cop_bribes_group_id,
            create_checkbox: cop_bribes_create_checkbox
        });
        saveMarker(feature, layer, {
            list_id: cop_bribes_group_id
        });
    }
}).addTo(cop_bribes_group);
marker.get(cop_bribes_group_id).set('group', cop_bribes_group);
marker.get(cop_bribes_group_id).set('name', cop_bribes_group_name);

if (cop_bribes_create_checkbox) {
    setColumnCount(marker.get(cop_bribes_group_id), cop_bribes_list);
}
