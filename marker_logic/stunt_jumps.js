// Create list
var stunt_jumps_list = document.createElement('ul');
stunt_jumps_list.className = 'collectibles_list';

// Add list to sidebar
sidebar.addPanel({
    id: 'stunt_jumps',
    tab: '<i class="fas fa-car"></i>',
    title: 'Unique Stunt Jumps',
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('stunt_jumps').appendChild(stunt_jumps_list);

// Create marker group
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
        onEachFeature(feature, layer, {
            layer_group: stunt_jumps_group,
            list: stunt_jumps_list,
            list_name: "stunt_jumps",
            create_checkbox: true
        });
    }
}).addTo(stunt_jumps_group);
marker.get("stunt_jumps").set("group", stunt_jumps_group);
