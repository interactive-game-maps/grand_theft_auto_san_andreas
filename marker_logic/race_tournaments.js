var race_tournaments_group_name = 'Race Tournaments';
var race_tournaments_group_id = 'race_tournaments';
var race_tournaments_create_checkbox = true;

var race_tournaments_list = createSidebarTab(race_tournaments_group_id, race_tournaments_group_name, '🏁');

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
        addPopup(feature, layer, {
            layer_group: race_tournaments_group,
            list: race_tournaments_list,
            list_id: race_tournaments_group_id,
            create_checkbox: race_tournaments_create_checkbox
        });
        saveMarker(feature, layer, {
            list_id: race_tournaments_group_id
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
                zoomToFeature(race_tournaments_group_id, e.target.feature.properties.id);
                history.replaceState({}, "", "?list=" + race_tournaments_group_id + "&id=" + e.target.feature.properties.id);
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
            color: 'green',
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
        addPopup(feature, layer, {
            layer_group: race_tournaments_group,
            list: race_tournaments_list,
            list_id: race_tournaments_group_id,
            create_checkbox: race_tournaments_create_checkbox
        });
        saveMarker(feature, layer, {
            list_id: race_tournaments_group_id
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
                zoomToFeature(race_tournaments_group_id, e.target.feature.properties.id);
                history.replaceState({}, "", "?list=" + race_tournaments_group_id + "&id=" + e.target.feature.properties.id);
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
            color: 'gray',
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
        addPopup(feature, layer, {
            layer_group: race_tournaments_group,
            list: race_tournaments_list,
            list_id: race_tournaments_group_id,
            create_checkbox: race_tournaments_create_checkbox
        });
        saveMarker(feature, layer, {
            list_id: race_tournaments_group_id
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
                zoomToFeature(race_tournaments_group_id, e.target.feature.properties.id);
                history.replaceState({}, "", "?list=" + race_tournaments_group_id + "&id=" + e.target.feature.properties.id);
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
            color: 'red',
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
        addPopup(feature, layer, {
            layer_group: race_tournaments_group,
            list: race_tournaments_list,
            list_id: race_tournaments_group_id,
            create_checkbox: race_tournaments_create_checkbox
        });
        saveMarker(feature, layer, {
            list_id: race_tournaments_group_id
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
                zoomToFeature(race_tournaments_group_id, e.target.feature.properties.id);
                history.replaceState({}, "", "?list=" + race_tournaments_group_id + "&id=" + e.target.feature.properties.id);
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

marker.get(race_tournaments_group_id).set('group', race_tournaments_group);
marker.get(race_tournaments_group_id).set('name', race_tournaments_group_name);

if (race_tournaments_create_checkbox) {
    setColumnCount(marker.get(race_tournaments_group_id), race_tournaments_list);
}
