var horseshoes_layer = new InteractiveLayer('horseshoes', horseshoes, {
    name: "Horseshoes",
    create_checkbox: true,
    create_feature_popup: true,
    is_default: true,
    sidebar_icon_html: '<i class="fas fa-horse"></i>',
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: getCustomIcon('fa-horse'),
            riseOnHover: true
        });
    }
});

interactive_layers.set(horseshoes_layer.id, horseshoes_layer);
