function addCheckbox(feature, list, list_id, layer_group) {
    if (!document.getElementById(list_id + ':' + feature.properties.id)) {
        var list_entry = document.createElement('li');
        list_entry.className = 'flex-grow-1';

        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.id = list_id + ':' + feature.properties.id;
        checkbox.className = 'flex-grow-0';

        var label = document.createElement('label')
        label.appendChild(document.createTextNode(feature.properties.id + ' '));
        label.htmlFor = checkbox.id;
        label.className = 'flex-grow-1';

        var icon = document.createElement('i');
        icon.className = 'fas fa-crosshairs fa-xs';

        var locate_button = document.createElement('button');
        locate_button.innerHTML = icon.outerHTML;
        locate_button.addEventListener('click', () => {
            map.setView(marker.get(list_id).get(feature.properties.id)[0].getLatLng());

            // Close sidebar if it spans over the complete view
            if (window.matchMedia('(max-device-width: 767px)').matches) {
                sidebar.close();
            }

            // rewrite url for easy copy pasta
            setHistoryState(list_id, feature.properties.id);
        });
        locate_button.className = 'flex-grow-0';

        list_entry.appendChild(checkbox);
        list_entry.appendChild(label);
        list_entry.appendChild(locate_button);
        list.appendChild(list_entry);

        // hide if checked previously
        if (localStorage.getItem(`${website_subdir}:${list_id}:${feature.properties.id}`)) {
            checkbox.checked = true;
        }

        // watch global checkbox
        if (document.getElementById(list_id + ':' + feature.properties.id) != null) {
            // if not a marker try to assign to the same checkbox as the corresponding marker
            document.getElementById(list_id + ':' + feature.properties.id).addEventListener('change', (element) => {
                if (element.target.checked) {
                    // check popup checkbox
                    checkbox.checked = true;
                    // save to localStorage
                    localStorage.setItem(`${website_subdir}:${list_id}:${feature.properties.id}`, true);
                    // remove all with ID from map
                    marker.get(list_id).get(feature.properties.id).forEach(e => {
                        layer_group.removeLayer(e);
                    });
                } else {
                    // uncheck popup checkbox
                    checkbox.checked = false;
                    // remove from localStorage
                    localStorage.removeItem(`${website_subdir}:${list_id}:${feature.properties.id}`);
                    // add all with ID to map
                    marker.get(list_id).get(feature.properties.id).forEach(e => {
                        e.addTo(layer_group);
                    });
                }
            });
        }
    }
}

function addPopup(feature, layer, args = {}) {
    var defaults = {
        create_checkbox: false
    };
    var params = { ...defaults, ...args } // right-most object overwrites

    // only bind for markers
    if (feature.geometry.type == "Point") {
        if (params.create_checkbox) {
            addCheckbox(feature, params.list, params.list_id, params.layer_group);
        }

        layer.bindPopup(() => {
            var html = document.createElement('div');

            var title = document.createElement('h2');
            title.className = 'popup-title';

            // While it would be nice to display a readable name here this would break any recognizable association to the sidebar list.
            title.innerHTML = feature.properties.id;

            html.appendChild(title);

            html = getPopupMedia(feature, params.list_id, html);

            if (feature.properties.description) {
                var description = document.createElement('p');
                description.className = 'popup-description';
                var span = document.createElement('span');
                span.setAttribute('style', 'white-space: pre-wrap');
                span.appendChild(document.createTextNode(feature.properties.description));
                description.appendChild(span);

                html.appendChild(description);
            }

            if (params.create_checkbox) {
                var label = document.createElement('label');
                label.className = 'popup-checkbox is-fullwidth';

                var label_text = document.createTextNode('Hide this marker');

                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';

                if (localStorage.getItem(`${website_subdir}:${params.list_id}:${feature.properties.id}`)) {
                    checkbox.checked = true;
                }

                checkbox.addEventListener('change', element => {
                    if (element.target.checked) {
                        // check global checkbox
                        document.getElementById(params.list_id + ':' + feature.properties.id).checked = true;
                        // save to localStorage
                        localStorage.setItem(`${website_subdir}:${params.list_id}:${feature.properties.id}`, true);
                        // remove all with ID from map
                        marker.get(params.list_id).get(feature.properties.id).forEach(e => {
                            params.layer_group.removeLayer(e);
                        });
                    } else {
                        // uncheck global checkbox
                        document.getElementById(params.list_id + ':' + feature.properties.id).checked = false;
                        // remove from localStorage
                        localStorage.removeItem(`${website_subdir}:${params.list_id}:${feature.properties.id}`);
                        // add all with ID to map
                        marker.get(params.list_id).get(feature.properties.id).forEach(e => {
                            e.addTo(params.layer_group);
                        });
                    }
                });

                label.appendChild(checkbox);
                label.appendChild(label_text);
                html.appendChild(label);
            }

            layer.on('popupopen', (event) => {
                // rewrite url for easy copy pasta
                setHistoryState(params.list_id, feature.properties.id);
            });

            layer.on('popupclose', (event) => {
                preventShareMarker();
                setHistoryState();
            });

            return html;
        }, {
            maxWidth: "auto"
        });
    }
}

// save all marker in a map so we can access them later
function saveMarker(feature, layer, args = {}) {
    var defaults = {};
    var params = { ...defaults, ...args } // right-most object overwrites

    if (!marker.has(params.list_id)) {
        marker.set(params.list_id, new Map());
    }
    var list_map = marker.get(params.list_id);

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

function zoomToFeature(list, id) {
    map.fitBounds(getOuterBounds(list, id), {
        maxZoom: MAX_ZOOM
    });
}

function hideCustomLayerControls() {
    map.removeControl(custom_layer_controls);
}

function showCustomLayerControls() {
    if (Object.keys(custom_layers).length > 0) {
        // Don't know why I have to create a new control but adding the old one is giving me an exception
        custom_layer_controls = new L.control.layers(null, custom_layers, {
            collapsed: false
        });
        map.addControl(custom_layer_controls);
    }
}

function createCustomLayer() {
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

function createEditablePopup(layer) {
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
        video_id_label.innerHTML = 'Video ID: ';

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

    layer.on('popupopen', (event) => {
        setHistoryState();
        map.off('click', moveShareMarker);
    });

    layer.on('popupclose', (event) => {
        if (edit_mode) return;

        window.setTimeout(() => {
            map.on('click', moveShareMarker);
        }, 300);
    });
}

// https://stackoverflow.com/a/18197341
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function createSidebarTab(group_id, group_name, tab_image) {
    var list = document.createElement('ul');
    list.className = 'collectibles_list';

    // Add list to sidebar
    sidebar.addPanel({
        id: group_id,
        tab: tab_image,
        title: group_name,
        pane: '<p></p>' // placeholder to get a proper pane
    });
    document.getElementById(group_id).appendChild(list);

    return list;
}

function getOuterBounds(list, id) {
    var bounds = [];

    marker.get(list).get(id).forEach(element => {
        if (element._latlngs) {
            // Polygons
            element._latlngs.forEach(latlng => {
                bounds.push(latlng);
            });
        } else {
            // Marker
            bounds.push(element._latlng);
        }
    });

    return bounds;
}

function getOuterBoundsMap() {
    var bounds = [];

    // iterate over all lists
    marker.forEach((v, k) => {
        // iterate over all IDs
        v.forEach((value, key) => {
            if (key == 'group' ||
                key == 'name') return;

            bounds.push(getOuterBounds(k, key));
        });
    });

    return bounds;
}

// work around grid not able to calculate the column count by itself
function setColumnCount(group, list) {
    var max_length = 4;
    var columns = 1;

    // iterate over all IDs
    group.forEach((value, key) => {
        if (key == 'group' ||
            key == 'name') return;

        if (key.length > max_length) {
            max_length = key.length;
        }
    });

    if (max_length < 5) {
        columns = 3;
    } else if (max_length < 15) {
        columns = 2;
    }

    list.setAttribute('style', `grid-template-columns: repeat(${columns}, auto)`);
}

function getCustomIcon(icon_id, mode = "normal") {
    if (!icon_id) {
        return L.divIcon({
            className: 'map-marker',
            html: `
            <img class="map-marker-background" src="images/icons/marker_${mode}.svg" />
            `,
            iconSize: [25, 41],
            popupAnchor: [1, -34],
            iconAnchor: [12, 41],
            tooltipAnchor: [0, 0]
        });
    }

    if (icon_id.startsWith('fa-')) {
        return L.divIcon({
            className: 'map-marker',
            html: `
            <img class="map-marker-background" src="images/icons/marker_${mode}.svg" />
            <div class="map-marker-foreground-wrapper"><i class="fas ${icon_id} map-marker-foreground"></i></div>
            `,
            iconSize: [25, 41],
            popupAnchor: [1, -34],
            iconAnchor: [12, 41],
            tooltipAnchor: [0, 0]
        });
    } else if (icon_id.length > 2) {
        return L.divIcon({
            className: 'map-marker',
            html: `
                <img class="map-marker-background" src="images/icons/marker_${mode}.svg" />
                <div class="map-marker-foreground-wrapper"><img class='map-marker-foreground' src='images/icons/${icon_id}.png' /></div>
                `,
            iconSize: [25, 41],
            popupAnchor: [1, -34],
            iconAnchor: [12, 41],
            tooltipAnchor: [0, 0]
        });
    } else if (icon_id.length < 3) {
        return L.divIcon({
            className: 'map-marker',
            html: `
            <img class="map-marker-background" src="images/icons/marker_${mode}.svg" />
            <div class="map-marker-foreground-wrapper"><p class="map-marker-foreground">${icon_id}</p></div>
            `,
            iconSize: [25, 41],
            popupAnchor: [1, -34],
            iconAnchor: [12, 41],
            tooltipAnchor: [0, 0]
        });
    }
}

function setHistoryState(list_id = undefined, marker_id = undefined) {
    if (list_id && marker_id) {
        history.replaceState({}, "", `?list=${list_id}&id=${marker_id}`);
    } else if (list_id) {
        history.replaceState({}, "", `?list=${list_id}`);
    } else {
        // CORS is driving me crazy
        // https://stackoverflow.com/a/3920899
        switch (window.location.protocol) {
            case 'http:':
            case 'https:':
                //remote file over http or https
                history.replaceState({}, "", `/${website_subdir}/`);
                break;
            case 'file:':
                //local file
                history.replaceState({}, "", `index.html`);
                break;
            default:
            //some other protocol
        }
    }
    share_marker.remove();
}

function preventShareMarker() {
    map.off('click', moveShareMarker);
    window.setTimeout(() => {
        map.on('click', moveShareMarker);
    }, 300);
}
