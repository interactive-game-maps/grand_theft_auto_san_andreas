var tags_layer = new InteractiveLayer('tags', tags, {
    name: "Spray Tags",
    create_checkbox: true,
    create_feature_popup: true,
    is_default: true,
    sidebar_icon_html: '<i class="fas fa-spray-can"></i>',
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: getCustomIcon('fa-spray-can'),
            riseOnHover: true
        });
    }
});

interactive_layers.set(tags_layer.id, tags_layer);
