function addHorseshoesLayer(map) {
    map.addInteractiveLayer('horseshoes', horseshoes, {
        name: "Horseshoes",
        create_checkbox: true,
        create_feature_popup: true,
        is_default: true,
        sidebar_icon_html: '<i class="fas fa-horse"></i>',
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: Utils.getCustomIcon('fa-horse'),
                riseOnHover: true
            });
        }
    });
}
