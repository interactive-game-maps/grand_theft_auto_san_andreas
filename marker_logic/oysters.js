// Create list
var oysters_list = document.createElement('ul');
oysters_list.className = 'collectibles_list';

// Add list to sidebar
var oysters_group_name = 'Oysters';
sidebar.addPanel({
    id: 'oysters',
    tab: '🦪',
    title: oysters_group_name,
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('oysters').appendChild(oysters_list);

// Create marker group
var oysters_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

var oysters_icon = L.Icon.Default.extend({
    options: {
        imagePath: './',
        iconUrl: 'marker/oysters.png',
        shadowUrl: 'marker/shadow.png'
    }
});

L.geoJSON(oysters, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: new oysters_icon,
            riseOnHover: true
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, {
            layer_group: oysters_group,
            list: oysters_list,
            list_name: "oysters",
            create_checkbox: true
        });
    }
}).addTo(oysters_group);
marker.get('oysters').set('group', oysters_group);
marker.get('oysters').set('name', oysters_group_name);
