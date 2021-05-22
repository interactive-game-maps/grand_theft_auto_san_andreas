{ // Helper functions
    function add_checkbox_for_marker(feature, marker, list, list_name, cluster) {
        // Add checkbox for marker
        var list_entry = document.createElement('li');
        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        var label = document.createElement('label')
        label.appendChild(document.createTextNode(feature.properties.id));
        label.onclick = () => {
            // center marker
            map.setView(marker.getLatLng());
            // Opening the popup stops the animation of setView()
            // marker.openPopup();
        };
        list_entry.appendChild(checkbox);
        list_entry.appendChild(label);
        list.appendChild(list_entry);

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                cluster.removeLayer(marker);
                // save to localStorage
                localStorage.setItem(list_name + ":" + feature.properties.id, true);
            } else {
                marker.addTo(cluster);
                // remove from localStorage
                localStorage.removeItem(list_name + ":" + feature.properties.id);
            }
        });

        // hide if checked previously
        if (localStorage.getItem(list_name + ":" + feature.properties.id)) {
            checkbox.checked = true;
            return false;
        }

        return true;
    }

    // https://leafletjs.com/examples/choropleth/
    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    function resetHighlight(e) {
        busted_geoJson.resetStyle(e.target);
        deaths_geoJson.resetStyle(e.target);
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    // make resetting localStorage possible
    document.getElementById("storage_reset").onclick = function () {
        localStorage.clear();
        location.reload();
    };
}

{ // Defining overlay maps - markers
    // Make markers groupable to clusters
    var cop_bribes_cluster = L.markerClusterGroup({
        maxClusterRadius: 40
    });
    var oyster_cluster = L.markerClusterGroup({
        maxClusterRadius: 40
    });
    var horseshoes_cluster = L.markerClusterGroup({
        maxClusterRadius: 40
    });
    var snapshots_cluster = L.markerClusterGroup({
        maxClusterRadius: 40
    });
    var tags_cluster = L.markerClusterGroup({
        maxClusterRadius: 40
    });
    // var stunt_jump_cluster = L.markerClusterGroup({
    //     maxClusterRadius: 40
    // });
    var busted_warps_group = L.layerGroup();
    var death_warps_group = L.layerGroup();

    // Add lists to sidebar
    var cop_bribes_list = document.getElementById("cop_bribes").appendChild(document.createElement('ul'));
    var oyster_list = document.getElementById("oysters").appendChild(document.createElement('ul'));
    var tags_list = document.getElementById("tags").appendChild(document.createElement('ul'));
    var snapshots_list = document.getElementById("snapshots").appendChild(document.createElement('ul'));
    var horseshoes_list = document.getElementById("horseshoes").appendChild(document.createElement('ul'));
    // var stunt_jumps_list = document.getElementById("stunt_jumps").appendChild(document.createElement('ul'));

    // Add all markers and attach popups with information
    L.geoJSON(snapshots, {
        pointToLayer: function (feature, latlng) {
            // custom marker
            var marker = L.marker(latlng, {
                // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
                icon: L.ExtraMarkers.icon({
                    icon: 'fa-number',
                    number: feature.properties.id,
                    shape: 'square',
                    markerColor: 'green'
                }),
                interactive: false
            });

            if (!add_checkbox_for_marker(feature, marker, snapshots_list, "snapshots", snapshots_cluster)) {
                return null;
            }
            return marker;
        }
    }).addTo(snapshots_cluster);

    L.geoJSON(tags, {
        pointToLayer: function (feature, latlng) {
            // custom marker
            var marker = L.marker(latlng, {
                // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
                icon: L.ExtraMarkers.icon({
                    icon: 'fa-number',
                    number: feature.properties.id,
                    shape: 'square',
                    markerColor: 'red'
                }),
                interactive: false
            });

            if (!add_checkbox_for_marker(feature, marker, tags_list, "tags", tags_cluster)) {
                return null;
            }
            return marker;
        }
    }).addTo(tags_cluster);

    L.geoJSON(horseshoes, {
        pointToLayer: function (feature, latlng) {
            // custom marker
            var marker = L.marker(latlng, {
                // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
                icon: L.ExtraMarkers.icon({
                    icon: 'fa-number',
                    number: feature.properties.id,
                    shape: 'square',
                    markerColor: 'black'
                }),
                interactive: false
            });

            if (!add_checkbox_for_marker(feature, marker, horseshoes_list, "horseshoes", horseshoes_cluster)) {
                return null;
            }
            return marker;
        }
    }).addTo(horseshoes_cluster);

    L.geoJSON(oysters, {
        pointToLayer: function (feature, latlng) {
            // custom marker
            var marker = L.marker(latlng, {
                // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
                icon: L.ExtraMarkers.icon({
                    icon: 'fa-number',
                    number: feature.properties.id,
                    shape: 'square',
                    markerColor: 'white'
                }),
                interactive: false
            });

            if (!add_checkbox_for_marker(feature, marker, oyster_list, "oysters", oyster_cluster)) {
                return null;
            }
            return marker;
        }
    }).addTo(oyster_cluster);

    L.geoJSON(cop_bribes, {
        pointToLayer: function (feature, latlng) {
            // custom marker
            var marker = L.marker(latlng, {
                // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
                icon: L.ExtraMarkers.icon({
                    icon: 'fa-number',
                    number: feature.properties.id,
                    shape: 'square',
                    markerColor: 'cyan'
                }),
                interactive: false
            });

            if (!add_checkbox_for_marker(feature, marker, cop_bribes_list, "cop_bribes", cop_bribes_cluster)) {
                return null;
            }
            return marker;
        },
    }).addTo(cop_bribes_cluster);

    var busted_geoJson = L.geoJSON(busted_warps, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
                icon: L.ExtraMarkers.icon({
                    icon: 'fa-star',
                    prefix: 'fas',
                    iconColor: '#ffff00',
                    shape: 'circle',
                    markerColor: 'blue'
                }),
                interactive: false
            });
        },
        onEachFeature: function (feature, layer) {
            if (feature.geometry.type == "Point") {
                return;
            }

            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });
        }
    });
    busted_geoJson.addTo(busted_warps_group)

    var deaths_geoJson = L.geoJSON(death_warps, {
        pointToLayer: function (feature, latlng) {
            if (feature.properties.radius) {
                return L.circle(latlng, feature.properties.radius, {
                    color: "#00ff00"
                });
            }
            else {
                return L.marker(latlng, {
                    // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
                    icon: L.ExtraMarkers.icon({
                        icon: 'fa-hospital',
                        prefix: 'fas',
                        iconColor: '#ff0000',
                        shape: 'circle',
                        markerColor: 'white'
                    }),
                    interactive: false
                });
            }
        },
        onEachFeature: function (feature, layer) {
            if (feature.geometry.type == "Point") {
                return;
            }

            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });
        }
    });
    deaths_geoJson.addTo(death_warps_group);


    var overlayMaps = {
        "Spray Tags": tags_cluster,
        "Snapshots": snapshots_cluster,
        "Horseshoes": horseshoes_cluster,
        "Oysters": oyster_cluster,
        "Cob Bribes": cop_bribes_cluster,
        "Busted Warps": busted_warps_group,
        "Death Warps": death_warps_group
    };

    // Make overlay layer visible by default
    map.addLayer(tags_cluster);
    map.addLayer(snapshots_cluster);
    map.addLayer(horseshoes_cluster);
    map.addLayer(oyster_cluster);

    // Center view over map
    map.fitBounds([[0, 0], [-192, 192]]);
}

// Add user selection to map
L.control.layers(baseMaps, overlayMaps).addTo(map);
