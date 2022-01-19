var busted_warps_layer = new InteractiveLayer('busted_warps', busted_warps, {
    name: "Busted warps",
    feature_group: L.layerGroup(),
    highlight_polygon_style: {
        color: 'blue',
        opacity: 1.0,
        fillOpacity: 0.5
    },
    polygon_style: {
        color: 'blue',
        opacity: 0.7,
        fillOpacity: 0.2
    },
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: getCustomIcon('fa-star'),
            riseOnHover: true
        });
    },
    onEachFeature: function (feature, layer) {
        layer.on({
            mouseover: event => {
                this.highlightFeature(feature.properties.id);
            },
            mouseout: event => {
                this.removeHighlightFeature(feature.properties.id);
            },
            click: event => {
                share_marker.prevent();
                this.zoomToFeature(feature.properties.id);
                setHistoryState(this.id, feature.properties.id);
            }
        });
    }
});

interactive_layers.set(busted_warps_layer.id, busted_warps_layer);
