// Create list
var horseshoes_list = document.createElement('ul');
horseshoes_list.className = 'collectibles_list';

// Add list to sidebar
var horseshoes_group_name = 'Horseshoes';
sidebar.addPanel({
    id: 'horseshoes',
    tab: '<i class="fas fa-horse"></i>',
    title: horseshoes_group_name,
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('horseshoes').appendChild(horseshoes_list);

// Create marker group
var horseshoes_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

var horseshoes_icon = L.Icon.Default.extend({
    options: {
        imagePath: './',
        iconUrl: 'marker/horseshoes.png',
        shadowUrl: 'marker/shadow.png'
    }
});

L.geoJSON(horseshoes, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: new horseshoes_icon,
            riseOnHover: true
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, {
            layer_group: horseshoes_group,
            list: horseshoes_list,
            list_name: "horseshoes",
            create_checkbox: true
        });
    }
}).addTo(horseshoes_group);
marker.get('horseshoes').set('group', horseshoes_group);
marker.get('horseshoes').set('name', horseshoes_group_name);
