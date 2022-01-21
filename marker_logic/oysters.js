function getOystersLayer() {
    return oysters_layer = new InteractiveLayer('oysters', oysters, {
        name: "Oysters",
        create_checkbox: true,
        create_feature_popup: true,
        sidebar_icon_html: '🦪',
        is_default: true,
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: Utils.getCustomIcon('🦪'),
                riseOnHover: true
            });
        }
    });
}
