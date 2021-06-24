// Create list
var cop_bribes_list = document.createElement('ul');
cop_bribes_list.className = 'collectibles_list';

// Add list to sidebar
var cop_bribes_group_name = 'Cop Bribes';
sidebar.addPanel({
    id: 'cop_bribes',
    tab: '⭐',
    title: cop_bribes_group_name,
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('cop_bribes').appendChild(cop_bribes_list);

// Create marker group
var cop_bribes_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

var cop_bribes_icon = L.Icon.Default.extend({
    options: {
        imagePath: './',
        iconUrl: 'marker/cop_bribes.png',
        shadowUrl: 'marker/shadow.png'
    }
});

L.geoJSON(cop_bribes, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: new cop_bribes_icon,
            riseOnHover: true
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, {
            layer_group: cop_bribes_group,
            list: cop_bribes_list,
            list_name: "cop_bribes",
            create_checkbox: true
        });
    }
}).addTo(cop_bribes_group);
marker.get('cop_bribes').set('group', cop_bribes_group);
marker.get('cop_bribes').set('name', cop_bribes_group_name);
