// Create list
var snapshots_list = document.createElement('ul');
snapshots_list.className = 'collectibles_list';

// Add list to sidebar
var snapshots_group_name = 'Snapshots';
sidebar.addPanel({
    id: 'snapshots',
    tab: '<i class="fas fa-camera"></i>',
    title: snapshots_group_name,
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('snapshots').appendChild(snapshots_list);

// Create list
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
        onEachFeature(feature, layer, {
            layer_group: snapshots_group,
            list: snapshots_list,
            list_name: "snapshots",
            create_checkbox: true
        });
    }
}).addTo(snapshots_group);
marker.get('snapshots').set('group', snapshots_group);
marker.get('snapshots').set('name', snapshots_group_name);
