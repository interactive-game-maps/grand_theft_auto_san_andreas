function addBustedWarpsLayer(map) {
    map.addInteractiveLayer('busted_warps', busted_warps, {
        name: "Busted warps",
        feature_group: L.featureGroup(),
        polygon_style_highlight: {
            color: 'red',
            opacity: 1.0,
            fillColor: 'blue',
            fillOpacity: 0.5
        },
        polygon_style: {
            color: 'blue',
            opacity: 0.7,
            fillOpacity: 0.2
        },
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: Utils.getCustomIcon('👮'),
                riseOnHover: true
            });
        },
        onEachFeature: function (feature, layer) {
            layer.on({
                mouseover: event => {
                    this.highlightFeature(feature.properties.id);
                },
                mouseout: event => {
                    this.removeFeatureHighlight(feature.properties.id);
                },
                click: event => {
                    Utils.share_marker.prevent();
                    this.zoomToFeature(feature.properties.id);
                    Utils.setHistoryState(this.id, feature.properties.id);
                }
            });
        }
    });
}
