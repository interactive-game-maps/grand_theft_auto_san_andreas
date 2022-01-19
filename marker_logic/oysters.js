var oysters_layer = new InteractiveLayer('oysters', oysters, {
    name: "Oysters",
    create_checkbox: true,
    create_feature_popup: true,
    sidebar_icon_html: '🦪',
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: getCustomIcon('🦪'),
            riseOnHover: true
        });
    }
});

interactive_layers.set(oysters_layer.id, oysters_layer);

default_layers.push(oysters_layer.name);
