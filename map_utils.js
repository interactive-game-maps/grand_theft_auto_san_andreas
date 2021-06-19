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

function onEachFeature(feature, layer, args = {}) {
    var defaults = {
        create_checkbox: false
    };
    var params = { ...defaults, ...args } // right-most object overwrites

    // only bind for markers
    if (feature.geometry.type == "Point") {
        const POPUP_WIDTH = 500;
        var html = document.createElement('div');

        var title = document.createElement('h2');
        title.className = 'popup-title';
        title.innerHTML = feature.properties.id;
        html.appendChild(title);

        if (feature.properties.image_id) {
            var image_link = document.createElement('a');
            image_link.className = 'popup-media';
            image_link.href = 'https://gta.fandom.com/wiki/' + feature.properties.image_link;

            var image = document.createElement('img');
            image.src = 'https://static.wikia.nocookie.net/gtawiki/images/' + feature.properties.image_id + '.jpg';
            image.width = POPUP_WIDTH;

            image_link.appendChild(image);
            html.appendChild(image_link);
        } else if (feature.properties.video_id) {
            var video = document.createElement('iframe');
            video.className = 'popup-media';
            video.width = POPUP_WIDTH;
            video.height = POPUP_WIDTH / 16 * 9;
            video.src = 'https://www.youtube-nocookie.com/embed/' + feature.properties.video_id;
            video.title = 'YouTube video player';
            video.frameborder = 0;
            // video.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; allowfullscreen'

            html.appendChild(video);
        }

        if (feature.properties.description) {
            var description = document.createElement('p');
            description.className = 'popup-description';
            description.appendChild(document.createTextNode(feature.properties.description));

            html.appendChild(description);
        }

        if (params.create_checkbox) {
            add_checkbox(feature, params.list, params.list_name);

            var label = document.createElement('label');
            label.className = 'popup-checkbox is-fullwidth';

            var label_text = document.createTextNode('Hide this marker');

            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';

            if (localStorage.getItem(params.list_name + ":" + feature.properties.id)) {
                checkbox.checked = true;
            }

            checkbox.addEventListener('change', element => {
                if (element.target.checked) {
                    // check global checkbox
                    document.getElementById(params.list_name + ':' + feature.properties.id).checked = true;
                    // save to localStorage
                    localStorage.setItem(params.list_name + ":" + feature.properties.id, true);
                    // remove all with ID from map
                    marker.get(params.list_name).get(feature.properties.id).forEach(e => {
                        params.layer_group.removeLayer(e);
                    });
                } else {
                    // uncheck global checkbox
                    document.getElementById(params.list_name + ':' + feature.properties.id).checked = false;
                    // remove from localStorage
                    localStorage.removeItem(params.list_name + ":" + feature.properties.id);
                    // add all with ID to map
                    marker.get(params.list_name).get(feature.properties.id).forEach(e => {
                        e.addTo(params.layer_group);
                    });
                }
            });

            // Also watch global checkbox
            if (document.getElementById(params.list_name + ':' + feature.properties.id) != null) {
                // if not a marker try to assign to the same checkbox as the corresponding marker
                document.getElementById(params.list_name + ':' + feature.properties.id).addEventListener('change', (element) => {
                    if (element.target.checked) {
                        // check popup checkbox
                        checkbox.checked = true;
                        // save to localStorage
                        localStorage.setItem(params.list_name + ":" + feature.properties.id, true);
                        // remove all with ID from map
                        marker.get(params.list_name).get(feature.properties.id).forEach(e => {
                            params.layer_group.removeLayer(e);
                        });
                    } else {
                        // uncheck popup checkbox
                        checkbox.checked = false;
                        // remove from localStorage
                        localStorage.removeItem(params.list_name + ":" + feature.properties.id);
                        // add all with ID to map
                        marker.get(params.list_name).get(feature.properties.id).forEach(e => {
                            e.addTo(params.layer_group);
                        });
                    }
                });
            }

            // rewrite url for easy copy pasta
            layer.on('popupopen', (event) => {
                history.replaceState({}, "", "index.html?list=" + params.list_name + "&id=" + feature.properties.id);
            });

            label.appendChild(checkbox);
            label.appendChild(label_text);
            html.appendChild(label);
        }

        layer.bindPopup(html, {
            maxWidth: POPUP_WIDTH
        });
    }

    // save all marker in a map so we can access them later
    if (!marker.has(params.list_name)) {
        marker.set(params.list_name, new Map());
    }
    var list_map = marker.get(params.list_name);

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
