var death_warps_layer = new InteractiveLayer('death_warps', death_warps, {
    name: "Death warps",
    feature_group: L.layerGroup(),
    highlight_polygon_style: feature => {
        if (feature.properties.id == "Katie") {
            return {
                color: 'green',
                opacity: 1.0,
                fillOpacity: 0.5
            }
        }
        return {
            color: 'red',
            opacity: 1.0,
            fillOpacity: 0.5
        }
    },
    polygon_style: feature => {
        if (feature.properties.id == "Katie") {
            return {
                color: 'green',
                opacity: 0.8,
                fillOpacity: 0.2
            }
        }
        return {
            color: 'red',
            opacity: 0.8,
            fillOpacity: 0.2
        }
    },
    pointToLayer: function (feature, latlng) {
        if (feature.properties.radius) {
            return L.circle(latlng, feature.properties.radius, {
                color: 'green'
            });
        }
        return L.marker(latlng, {
            icon: getCustomIcon('fa-hospital'),
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

interactive_layers.set(death_warps_layer.id, death_warps_layer);
