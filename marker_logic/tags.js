var tags_group_name = 'Spray Tags';
var tags_group_id = 'tags';
var tags_create_checkbox = true;

var tags_list = createSidebarTab(tags_group_id, tags_group_name, '<i class="fas fa-spray-can"></i>');

var tags_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

var tags_icon = L.Icon.Default.extend({
    options: {
        imagePath: './',
        iconUrl: 'marker/tags.png',
        iconRetinaUrl: 'marker/tags.png',
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
        addPopup(feature, layer, {
            layer_group: tags_group,
            list: tags_list,
            list_id: tags_group_id,
            create_checkbox: tags_create_checkbox
        });
        saveMarker(feature, layer, {
            list_id: tags_group_id
        });
    }
}).addTo(tags_group);
marker.get(tags_group_id).set('group', tags_group);
marker.get(tags_group_id).set('name', tags_group_name);

if (tags_create_checkbox) {
    setColumnCount(marker.get(tags_group_id), tags_list);
}

// Add as a default layer
// This needs the display name because the layer control don't report ids
default_layers.push(tags_group_name);
