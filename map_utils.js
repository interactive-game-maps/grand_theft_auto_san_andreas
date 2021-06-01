// Helper functions
function add_checkbox(feature, list, list_name) {
    if (!document.getElementById(list_name + ':' + feature.properties.id)) {
        var list_entry = document.createElement('li');

        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.id = list_name + ':' + feature.properties.id;

        var label = document.createElement('label')
        label.appendChild(document.createTextNode(feature.properties.id + ' '));
        label.htmlFor = checkbox.id;

        var icon = document.createElement('i');
        icon.className = 'fas fa-crosshairs fa-xs';

        var locate_button = document.createElement('button');
        locate_button.innerHTML = icon.outerHTML;
        locate_button.addEventListener('click', () => {
            map.setView(marker.get(list_name).get(feature.properties.id)[0].getLatLng());
            // rewrite url for easy copy pasta
            history.replaceState({}, "", "index.html?list=" + list_name + "&id=" + feature.properties.id);
        });

        list_entry.appendChild(checkbox);
        list_entry.appendChild(label);
        list_entry.appendChild(locate_button);
        list.appendChild(list_entry);

        // hide if checked previously
        if (localStorage.getItem(list_name + ":" + feature.properties.id)) {
            checkbox.checked = true;
        }
    }
}

function onEachFeature(feature, layer, layer_group, list, list_name, create_checkbox) {
    // only bind for markers
    if (feature.geometry.type == "Point") {
        if (feature.properties.video_id) {
            // popup with video and description
            layer.bindPopup("<iframe width=\"500\" height=\"281\" src=\"https://www.youtube-nocookie.com/embed/" + feature.properties.video_id + "\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>" + (feature.properties.description ? feature.properties.description : ""), { maxWidth: 500 });
        }

        // if (feature.properties.image_id) {
        //     // popup with image and description
        //     layer.bindPopup("<a href='https://media.gtanet.com/gta4/images/flying-rats/" + feature.properties.image_id + ".jpg'><img src='https://media.gtanet.com/gta4/images/flying-rats/" + feature.properties.number + ".jpg' width='500/' /></a>" + feature.properties.description, { maxWidth: 500 });
        // }

        if (feature.properties.video_id
            // || feature.properties.image_id
        ) {
            // rewrite url for easy copy pasta
            layer.on('popupopen', (event) => {
                history.replaceState({}, "", "index.html?list=" + list_name + "&id=" + feature.properties.id);
            });
        }
    }

    if (create_checkbox) {
        add_checkbox(feature, list, list_name);

        if (document.getElementById(list_name + ':' + feature.properties.id) != null) {
            // if not a marker try to assign to the same checkbox as the corresponding marker
            document.getElementById(list_name + ':' + feature.properties.id).addEventListener('change', (element) => {
                if (element.target.checked) {
                    layer_group.removeLayer(layer);
                    // save to localStorage
                    localStorage.setItem(list_name + ":" + feature.properties.id, true);
                } else {
                    layer.addTo(layer_group);
                    // remove from localStorage
                    localStorage.removeItem(list_name + ":" + feature.properties.id);
                }
            });
        }
    }

    // save all marker in a map so we can access them later
    if (!marker.has(list_name)) {
        marker.set(list_name, new Map());
    }
    var list_map = marker.get(list_name);

    if (!list_map.has(feature.properties.id)) {
        list_map.set(feature.properties.id, new Array());
    }
    list_map.get(feature.properties.id).push(layer);
}

// https://leafletjs.com/examples/choropleth/
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        opacity: 1.0,
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
    if (e.target.feature.geometry.type != "Point") {
        map.fitBounds(e.target.getBounds());
    }
}
