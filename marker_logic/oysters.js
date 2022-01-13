var oysters_group_name = 'Oysters';
var oysters_group_id = 'oysters';
var oysters_create_checkbox = true;

var oysters_list = createSidebarTab(oysters_group_id, oysters_group_name, '🦪');

var oysters_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

var oysters_icon = L.Icon.Default.extend({
    options: {
        imagePath: './',
        iconUrl: 'marker/oysters.png',
        iconRetinaUrl: 'marker/oysters.png',
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
        addPopup(feature, layer, {
            layer_group: oysters_group,
            list: oysters_list,
            list_id: oysters_group_id,
            create_checkbox: oysters_create_checkbox
        });
        saveMarker(feature, layer, {
            list_id: oysters_group_id
        });
    }
}).addTo(oysters_group);
marker.get(oysters_group_id).set('group', oysters_group);
marker.get(oysters_group_id).set('name', oysters_group_name);

if (oysters_create_checkbox) {
    setColumnCount(marker.get(oysters_group_id), oysters_list);
}

// Add as a default layer
// This needs the display name because the layer control don't report ids
default_layers.push(oysters_group_name);
