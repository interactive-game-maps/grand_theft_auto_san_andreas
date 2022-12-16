function addDeathWarpsLayer(map) {
    map.addInteractiveLayer('death_warps', death_warps, {
        name: "Death warps",
        feature_group: L.featureGroup(),
        polygon_style_highlight: feature => {
            if (feature.properties.id == "Katie") {
                return {
                    color: 'blue',
                    fillColor: 'green',
                    opacity: 1.0,
                    fillOpacity: 0.5
                }
            }
            return {
                color: 'blue',
                fillColor: 'red',
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
                return L.circle(latlng, {
                    radius: feature.properties.radius,
                    color: 'green'
                });
            }
            return L.marker(latlng, {
                icon: Utils.getCustomIcon('fa-hospital'),
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
                    map.getShareMarker().prevent();
                    this.zoomToFeature(feature.properties.id);
                    Utils.setHistoryState(this.id, feature.properties.id);
                }
            });
        }
    });
}
