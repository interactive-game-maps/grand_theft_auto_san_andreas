var race_tournaments_highlight = {
    color: 'red',
    opacity: 1.0,
}

var race_tournaments_layer = new InteractiveLayer('race_tournaments', los_santos_races, {
    name: "Race tournaments",
    create_checkbox: true,
    create_feature_popup: true,
    sidebar_icon_html: '<i class="fas fa-flag-checkered"></i>',
    feature_group: L.layerGroup(),
    highlight_polygon_style: race_tournaments_highlight,
    polygon_style: feature => {
        return {
            color: 'blue',
            weight: 7,
            opacity: 0.9
        }
    },
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: getCustomIcon(this.id),
            riseOnHover: true
        });
    },
    onEachFeature: function (feature, layer) {
        if (feature.geometry.type == "Point") {
            layer.bindTooltip(feature.properties.id, {
                permanent: true,
                direction: 'bottom'
            });
        }

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

race_tournaments_layer.addGeoJson(san_fierro_races, {
    polygon_style: {
        color: 'lightblue',
        weight: 7,
        opacity: 0.9
    },
    highlight_polygon_style: race_tournaments_highlight,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: getCustomIcon(this.id),
            riseOnHover: true
        });
    },
    onEachFeature: function (feature, layer) {
        if (feature.geometry.type == "Point") {
            layer.bindTooltip(feature.properties.id, {
                permanent: true,
                direction: 'bottom'
            });
        }

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

race_tournaments_layer.addGeoJson(las_venturas_races, {
    polygon_style: {
        color: 'orange',
        weight: 7,
        opacity: 0.9
    },
    highlight_polygon_style: race_tournaments_highlight,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: getCustomIcon(this.id),
            riseOnHover: true
        });
    },
    onEachFeature: function (feature, layer) {
        if (feature.geometry.type == "Point") {
            layer.bindTooltip(feature.properties.id, {
                permanent: true,
                direction: 'bottom'
            });
        }

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

race_tournaments_layer.addGeoJson(air_races, {
    polygon_style: {
        color: 'yellow',
        weight: 7,
        opacity: 0.9
    },
    highlight_polygon_style: race_tournaments_highlight,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, {
            icon: getCustomIcon(this.id),
            riseOnHover: true
        });
    },
    onEachFeature: function (feature, layer) {
        if (feature.geometry.type == "Point") {
            layer.bindTooltip(feature.properties.id, {
                permanent: true,
                direction: 'bottom'
            });
        }

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

interactive_layers.set(race_tournaments_layer.id, race_tournaments_layer);
