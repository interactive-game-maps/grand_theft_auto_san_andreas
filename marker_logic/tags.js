// Create list
var tags_list = document.createElement('ul');
tags_list.className = 'collectibles_list';

// Add list to sidebar
var tags_group_name = 'Spray Tags';
sidebar.addPanel({
    id: 'tags',
    tab: '<i class="fas fa-spray-can"></i>',
    title: tags_group_name,
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('tags').appendChild(tags_list);

// Create marker group
var tags_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

var tags_icon = L.Icon.Default.extend({
    options: {
        imagePath: './',
        iconUrl: 'marker/tags.png',
        shadowUrl: 'marker/shadow.png'
    }
});

L.geoJSON(tags, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: new tags_icon,
            riseOnHover: true
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, {
            layer_group: tags_group,
            list: tags_list,
            list_name: "tags",
            create_checkbox: true
        });
    }
}).addTo(tags_group);
marker.get('tags').set('group', tags_group);
marker.get('tags').set('name', tags_group_name);
