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
    const POPUP_WIDTH = 500;

    if (feature.geometry.type == "Point" && params.create_checkbox) {
        add_checkbox(feature, params.list, params.list_name);
    }

    layer.bindPopup(() => {
        // only bind for markers
        if (feature.geometry.type == "Point") {
            var html = document.createElement('div');

            var title = document.createElement('h2');
            title.className = 'popup-title';
            title.innerHTML = feature.properties.id;
            html.appendChild(title);

            if (feature.properties.image_id) {
                var prefix = 'https://static.wikia.nocookie.net/gtawiki/images/';
                var suffix = '.jpg';
                if (params.list_name == "horseshoes"
                    || params.list_name == "oysters") {
                    prefix = 'https://static.wikigta.org/en/images/';
                    suffix = '.JPG'
                }

                var image_link = document.createElement('a');
                image_link.className = 'popup-media';
                if (feature.properties.image_link) {
                    switch (params.list_name) {
                        case 'tags':
                            image_link.href = 'https://gta.fandom.com/wiki/' + feature.properties.image_link;
                            break;

                        case 'horseshoes':
                        case 'oysters':
                            image_link.href = 'http://en.wikigta.org/wiki/' + feature.properties.image_link;
                            break;

                        default:
                            image_link.href = prefix + feature.properties.image_id + suffix;
                            break;
                    }
                } else {
                    image_link.href = prefix + feature.properties.image_id + suffix;
                }

                var image = document.createElement('img');
                image.src = prefix + feature.properties.image_id + suffix;
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

            return html;
        }
    }, {
        maxWidth: POPUP_WIDTH
    });

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

function hide_custom_layer_controls() {
    map.removeControl(custom_layer_controls);
}

function show_custom_layer_controls() {
    if (Object.keys(custom_layers).length > 0) {
        // Don't know why I have to create a new control but adding the old one is giving me an exeption
        custom_layer_controls = new L.control.layers(null, custom_layers, {
            collapsed: false
        });
        map.addControl(custom_layer_controls);
    }
}

function create_custom_layer() {
    // Create new layer
    var layer_id = prompt("Unique new layer name");

    if (layer_id == null || layer_id == '' || layer_id in custom_layers) {
        return false;
    }
    custom_layers[layer_id] = L.featureGroup(null, {
        pmIgnore: false
    });

    // Refresh layer to controls
    custom_layer_controls.addOverlay(custom_layers[layer_id], layer_id);

    // Display new layer and active
    custom_layers[layer_id].addTo(map);

    map.pm.setGlobalOptions({
        layerGroup: custom_layers[layer_id]
    });

    return true;
}

function create_editable_popup(layer) {
    layer.bindPopup(() => {
        var html = document.createElement('div');

        var id_p = document.createElement('p');

        var id_input = document.createElement('input');
        id_input.setAttribute('type', 'text');
        id_input.id = layer._leaflet_id + ':id';

        var id_label = document.createElement('label');
        id_label.htmlFor = id_input.id;
        id_label.innerHTML = 'ID: ';

        if (!layer.feature) {
            layer.feature = {};
            layer.feature.type = 'Feature';
        }

        if (!layer.feature.properties) {
            layer.feature.properties = {};
        }

        if (layer.feature.properties.id) {
            id_input.value = layer.feature.properties.id;
        }

        id_input.addEventListener('change', e => {
            layer.feature.properties.id = e.target.value;
        });

        id_p.appendChild(id_label);
        id_p.appendChild(id_input);
        html.appendChild(id_p);

        var image_id_p = document.createElement('p');

        var image_id_input = document.createElement('input');
        image_id_input.setAttribute('type', 'text');
        image_id_input.id = layer._leaflet_id + ':image_id';

        var image_id_label = document.createElement('label');
        image_id_label.htmlFor = image_id_input.id;
        image_id_label.innerHTML = 'Image ID: ';

        if (layer.feature.properties.image_id) {
            image_id_input.value = layer.feature.properties.image_id;
        }

        image_id_input.addEventListener('change', e => {
            layer.feature.properties.image_id = e.target.value;
        });

        image_id_p.appendChild(image_id_label);
        image_id_p.appendChild(image_id_input);
        html.appendChild(image_id_p);

        var image_url_p = document.createElement('p');

        var image_url_input = document.createElement('input');
        image_url_input.setAttribute('type', 'text');
        image_url_input.id = layer._leaflet_id + ':image_url';

        var image_url_label = document.createElement('label');
        image_url_label.htmlFor = image_url_input.id;
        image_url_label.innerHTML = 'Image link: ';

        if (layer.feature.properties.image_link) {
            image_url_input.value = layer.feature.properties.image_link;
        }

        image_url_input.addEventListener('change', e => {
            layer.feature.properties.image_link = e.target.value;
        });

        image_url_p.appendChild(image_url_label);
        image_url_p.appendChild(image_url_input);
        html.appendChild(image_url_p);

        var video_id_p = document.createElement('p');

        var video_id_input = document.createElement('input');
        video_id_input.setAttribute('type', 'text');
        video_id_input.id = layer._leaflet_id + ':video_id';

        var video_id_label = document.createElement('label');
        video_id_label.htmlFor = video_id_input.id;
        video_id_label.innerHTML = 'Image ID: ';

        if (layer.feature.properties.video_id) {
            video_id_input.value = layer.feature.properties.video_id;
        }

        video_id_input.addEventListener('change', e => {
            layer.feature.properties.video_id = e.target.value;
        });

        video_id_p.appendChild(video_id_label);
        video_id_p.appendChild(video_id_input);
        html.appendChild(video_id_p);

        var description_p = document.createElement('p');

        var description_input = document.createElement('input');
        description_input.setAttribute('type', 'text');
        description_input.id = layer._leaflet_id + ':description';

        var description_label = document.createElement('label');
        description_label.htmlFor = description_input.id;
        description_label.innerHTML = 'Description: ';

        if (layer.feature.properties.description) {
            description_input.value = layer.feature.properties.description;
        }

        description_input.addEventListener('change', e => {
            layer.feature.properties.description = e.target.value;
        });

        description_p.appendChild(description_label);
        description_p.appendChild(description_input);
        html.appendChild(description_p);

        return html;
    });
}
