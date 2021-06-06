// Create list
var race_tournaments_list = document.createElement('ul');
race_tournaments_list.className = 'collectibles_list';

// Add list to sidebar
sidebar.addPanel({
    id: "race_tournaments",
    tab: '🏁',
    title: 'Race Tournaments',
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById("race_tournaments").appendChild(race_tournaments_list);

// Create marker group
var race_tournaments_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

var race_tournaments_icon = L.Icon.extend({
    options: {
        iconAnchor: [15, 15],
        iconSize: [30, 30],
        iconUrl: 'marker/race_tournaments.png',
        tooltipAnchor: [0, 15]
    }
})

var los_santos_races_geojson = L.geoJSON(los_santos_races, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: new race_tournaments_icon
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, {
            layer_group: race_tournaments_group,
            list: race_tournaments_list,
            list_name: "race_tournaments",
            create_checkbox: true
        });

        layer.on({
            mouseover: (e) => {
                if (e.target.feature.geometry.type != "Point") {
                    highlightFeature(e);
                }
            },
            mouseout: (e) => {
                los_santos_races_geojson.resetStyle(e.target);
            },
            click: (e) => {
                zoomToFeature(e);
                history.replaceState({}, "", "index.html?list=" + "race_tournaments" + "&id=" + e.target.feature.properties.id);
            }
        });

        if (feature.geometry.type == "Point") {
            layer.bindTooltip(feature.properties.id, {
                permanent: true,
                direction: 'bottom'
            });
        }
    },
    style: feature => {
        return {
            color: 'yellow',
            weight: 7,
            opacity: 0.5
        };
    }
}).addTo(race_tournaments_group);

var san_fierro_races_geojson = L.geoJSON(san_fierro_races, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: new race_tournaments_icon
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, {
            layer_group: race_tournaments_group,
            list: race_tournaments_list,
            list_name: "race_tournaments",
            create_checkbox: true
        });

        layer.on({
            mouseover: (e) => {
                if (e.target.feature.geometry.type != "Point") {
                    highlightFeature(e);
                }
            },
            mouseout: (e) => {
                san_fierro_races_geojson.resetStyle(e.target);
            },
            click: (e) => {
                zoomToFeature(e);
                history.replaceState({}, "", "index.html?list=" + "race_tournaments" + "&id=" + e.target.feature.properties.id);
            }
        });

        if (feature.geometry.type == "Point") {
            layer.bindTooltip(feature.properties.id, {
                permanent: true,
                direction: 'bottom'
            });
        }
    },
    style: feature => {
        return {
            color: 'yellow',
            weight: 7,
            opacity: 0.5
        };
    }
}).addTo(race_tournaments_group);

var las_venturas_races_geojson = L.geoJSON(las_venturas_races, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: new race_tournaments_icon
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, {
            layer_group: race_tournaments_group,
            list: race_tournaments_list,
            list_name: "race_tournaments",
            create_checkbox: true
        });

        layer.on({
            mouseover: (e) => {
                if (e.target.feature.geometry.type != "Point") {
                    highlightFeature(e);
                }
            },
            mouseout: (e) => {
                las_venturas_races_geojson.resetStyle(e.target);
            },
            click: (e) => {
                zoomToFeature(e);
                history.replaceState({}, "", "index.html?list=" + "race_tournaments" + "&id=" + e.target.feature.properties.id);
            }
        });

        if (feature.geometry.type == "Point") {
            layer.bindTooltip(feature.properties.id, {
                permanent: true,
                direction: 'bottom'
            });
        }
    },
    style: feature => {
        return {
            color: 'yellow',
            weight: 7,
            opacity: 0.5
        };
    }
}).addTo(race_tournaments_group);

var air_races_geojson = L.geoJSON(air_races, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: new race_tournaments_icon
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, {
            layer_group: race_tournaments_group,
            list: race_tournaments_list,
            list_name: "race_tournaments",
            create_checkbox: true
        });

        layer.on({
            mouseover: (e) => {
                if (e.target.feature.geometry.type != "Point") {
                    highlightFeature(e);
                }
            },
            mouseout: (e) => {
                air_races_geojson.resetStyle(e.target);
            },
            click: (e) => {
                zoomToFeature(e);
                history.replaceState({}, "", "index.html?list=" + "race_tournaments" + "&id=" + e.target.feature.properties.id);
            }
        });

        if (feature.geometry.type == "Point") {
            layer.bindTooltip(feature.properties.id, {
                permanent: true,
                direction: 'bottom'
            });
        }
    },
    style: feature => {
        return {
            color: 'yellow',
            weight: 7,
            opacity: 0.5
        };
    }
}).addTo(race_tournaments_group);

marker.get("race_tournaments").set("group", race_tournaments_group);
