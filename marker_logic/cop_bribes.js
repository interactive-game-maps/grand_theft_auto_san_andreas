var cop_bribes_layer = new InteractiveLayer('cop_bribes', cop_bribes, {
    name: "Cop bribes",
    create_checkbox: true,
    create_feature_popup: true,
    sidebar_icon_html: '⭐',
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: getCustomIcon('⭐'),
            riseOnHover: true
        });
    }
});

interactive_layers.set(cop_bribes_layer.id, cop_bribes_layer);
