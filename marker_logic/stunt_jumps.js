var stunt_jumps_layer = new InteractiveLayer('stunt_jumps', stunt_jumps, {
    name: "Unique stunt jumps",
    create_checkbox: true,
    create_feature_popup: true,
    sidebar_icon_html: '<i class="fas fa-car"></i>',
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: getCustomIcon('fa-car'),
            riseOnHover: true
        });
    },
    onEachFeature: function (feature, layer) {
        layer.on({
            mouseover: e => {
                this.highlightFeature(feature.properties.id);
            },
            mouseout: e => {
                this.removeHighlightFeature(feature.properties.id);
            },
            click: e => {
                this.zoomToFeature(feature.properties.id);
            }
        });
    }
});

interactive_layers.set(stunt_jumps_layer.id, stunt_jumps_layer);
