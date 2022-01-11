var stunt_jumps_group_name = 'Unique Stunt Jumps';
var stunt_jumps_group_id = 'stunt_jumps';
var stunt_jumps_create_checkbox = true;

var stunt_jumps_list = createSidebarTab(stunt_jumps_group_id, stunt_jumps_group_name, '<i class="fas fa-car"></i>');

var stunt_jumps_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

var stunt_jumps_icon = L.Icon.Default.extend({
    options: {
        imagePath: './',
        iconUrl: 'marker/stunt_jumps.png',
        shadowUrl: 'marker/shadow.png'
    }
});

L.geoJSON(stunt_jumps, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: new stunt_jumps_icon,
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
    }
}).addTo(stunt_jumps_group);
marker.get(stunt_jumps_group_id).set('group', stunt_jumps_group);
marker.get(stunt_jumps_group_id).set('name', stunt_jumps_group_name);

if (stunt_jumps_create_checkbox) {
    setColumnCount(marker.get(stunt_jumps_group_id), stunt_jumps_list);
}
