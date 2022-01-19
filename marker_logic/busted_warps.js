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
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: getCustomIcon('fa-star'),
            riseOnHover: true
        });
    },
    onEachFeature: (feature, layer) => {
        layer.on({
            mouseover: e => {
                busted_warps_layer.highlightFeature(feature.properties.id);
            },
            mouseout: e => {
                busted_warps_layer.removeHighlightFeature(feature.properties.id);
            },
            click: e => {
                share_marker.prevent();
                busted_warps_layer.zoomToFeature(feature.properties.id);
                setHistoryState(busted_warps_layer.id, feature.properties.id);
            }
        });
    }
});

interactive_layers.set(busted_warps_layer.id, busted_warps_layer);
