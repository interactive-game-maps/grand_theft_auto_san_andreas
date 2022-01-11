var snapshots_group_name = 'Snapshots';
var snapshots_group_id = 'snapshots';
var snapshots_create_checkbox = true;

var snapshots_list = createSidebarTab(snapshots_group_id, snapshots_group_name, '<i class="fas fa-camera"></i>');

var snapshots_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

var snapshots_icon = L.Icon.Default.extend({
    options: {
        imagePath: './',
        iconUrl: 'marker/snapshots.png',
        shadowUrl: 'marker/shadow.png'
    }
});

L.geoJSON(snapshots, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: new snapshots_icon,
            riseOnHover: true
        });
    },
    onEachFeature: (feature, layer) => {
        addPopup(feature, layer, {
            layer_group: snapshots_group,
            list: snapshots_list,
            list_name: snapshots_group_id,
            create_checkbox: snapshots_create_checkbox
        });
        saveMarker(feature, layer, {
            list_id: snapshots_group_id
        });
    }
}).addTo(snapshots_group);
marker.get(snapshots_group_id).set('group', snapshots_group);
marker.get(snapshots_group_id).set('name', snapshots_group_name);

if (snapshots_create_checkbox) {
    setColumnCount(marker.get(snapshots_group_id), snapshots_list);
}

// Add as a default layer
// This needs the display name because the layer control don't report ids
default_layers.push(snapshots_group_name);
