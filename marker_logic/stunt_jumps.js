function addStuntJumpsLayer(map) {
    map.addInteractiveLayer('stunt_jumps', stunt_jumps, {
        name: "Unique stunt jumps",
        create_checkbox: true,
        create_feature_popup: true,
        sidebar_icon_html: '<i class="fas fa-car"></i>',
        polygon_style_highlight: {
            color: 'red',
            opacity: 1.0,
            fillOpacity: 0.7
        },
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: Utils.getCustomIcon('fa-car'),
                riseOnHover: true
            });
        },
        onEachFeature: function (feature, layer) {
            layer.on({
                mouseover: e => {
                    this.highlightFeature(feature.properties.id);
                },
                mouseout: e => {
                    this.removeFeatureHighlight(feature.properties.id);
                },
                click: e => {
                    this.zoomToFeature(feature.properties.id);
                }
            });
        },
        coordsToLatLng: function (coords) {
            return gtaCoordinatesToLeaflet(coords);
        }
    });
}
