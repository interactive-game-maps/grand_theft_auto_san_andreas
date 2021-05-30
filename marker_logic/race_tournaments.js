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

var los_santos_races_geojson = L.geoJSON(los_santos_races, {
    pointToLayer: (feature, latlng) => {
        // custom marker
        return L.marker(latlng, {
            // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
            icon: L.ExtraMarkers.icon({
                prefix: 'fas',
                icon: 'fa-car',
                // innerHTML: '🏁',
                shape: 'penta',
                markerColor: 'black'
            })
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, race_tournaments_group, race_tournaments_list, "race_tournaments", true);

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
        // custom marker
        return L.marker(latlng, {
            // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
            icon: L.ExtraMarkers.icon({
                prefix: 'fas',
                icon: 'fa-car',
                // innerHTML: '<br>🏁',
                shape: 'penta',
                markerColor: 'black'
            })
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, race_tournaments_group, race_tournaments_list, "race_tournaments", true);

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
        // custom marker
        return L.marker(latlng, {
            // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
            icon: L.ExtraMarkers.icon({
                prefix: 'fas',
                icon: 'fa-car',
                // innerHTML: '<br>🏁',
                shape: 'penta',
                markerColor: 'black'
            })
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, race_tournaments_group, race_tournaments_list, "race_tournaments", true);

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
        // custom marker
        return L.marker(latlng, {
            // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
            icon: L.ExtraMarkers.icon({
                prefix: 'fas',
                icon: 'fa-car',
                // innerHTML: '<br>🏁',
                shape: 'penta',
                markerColor: 'black'
            })
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, race_tournaments_group, race_tournaments_list, "race_tournaments", true);

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
