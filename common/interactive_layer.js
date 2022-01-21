class InteractiveLayer {
    #create_checkbox;
    #create_feature_popup;
    #layers;
    #highlighted_layers;
    #polygon_style_highlights;
    #sidebar_list_html;
    #geojsons;
    #is_default;
    #feature_group;
    #interactive_map;
    #sidebar;
    #website_subdir;

    constructor(id, geojson, args) {
        let defaults = {
            name: id,
            create_checkbox: false,
            create_sidebar_tab: false,
            is_default: false,
            sidebar_icon_html: function () {
                return `<img class="sidebar-image" src="images/icons/${this.id}.png" />`;
            },
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: Utils.getCustomIcon(this.id),
                    riseOnHover: true
                });
            },
            onEachFeature: function (feature, layer) { },
            feature_group: L.featureGroup.subGroup(interactive_map.getClusterGroup()),
            polygon_style_highlight: function () {
                return {
                    opacity: 1.0,
                    fillOpacity: 0.7
                }
            },
            polygon_style: function (feature) { return {}; },
            interactive_map: interactive_map
        };

        let params = { ...defaults, ...args };

        this.id = id;
        this.name = params.name;
        this.#create_checkbox = params.create_checkbox;
        this.#create_feature_popup = params.create_feature_popup;
        this.#layers = new Map();
        this.#highlighted_layers = new Array();
        this.#feature_group = params.feature_group;
        this.#sidebar_list_html = undefined;
        this.#geojsons = new Array();
        this.#polygon_style_highlights = new Map();
        this.#is_default = params.is_default;
        this.#interactive_map = params.interactive_map;
        this.#sidebar = this.#interactive_map.getSidebar();
        this.#website_subdir = this.#interactive_map.getWebsiteSubdir();

        if (this.#create_checkbox) {
            this.#createSidebarTab(params.sidebar_icon_html);
        }

        this.addGeoJson(geojson, {
            pointToLayer: params.pointToLayer,
            onEachFeature: params.onEachFeature,
            polygon_style: params.polygon_style,
            polygon_style_highlight: params.polygon_style_highlight
        })

        if (this.#create_checkbox && this.#sidebar_list_html) {
            this.#setSidebarColumnCount();
        }
    }

    addGeoJson(geojson, args) {
        let defaults = {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: Utils.getCustomIcon(this.id),
                    riseOnHover: true
                });
            },
            onEachFeature: function (feature, layer) { },
            polygon_style_highlight: function () {
                return {
                    opacity: 1.0,
                    fillOpacity: 0.7
                }
            },
            polygon_style: function (feature) { return {}; }
        };

        let params = { ...defaults, ...args };
        var onEachFeature = params.onEachFeature.bind(this);

        var geojson_layer = L.geoJSON(geojson, {
            pointToLayer: params.pointToLayer.bind(this),
            onEachFeature: (feature, layer) => {
                if (this.#create_checkbox) {
                    this.#createSidebarCheckbox(feature);
                }

                if (this.#create_feature_popup) {
                    this.#createFeaturePopup(feature, layer);
                }

                onEachFeature(feature, layer);

                this.#setFeature(feature.properties.id, layer);
            },
            style: params.polygon_style
        });

        this.#geojsons.push(geojson_layer);

        if (params.polygon_style_highlight instanceof Function) {
            this.#polygon_style_highlights.set(geojson_layer, params.polygon_style_highlight.bind(this));
        } else {
            this.#polygon_style_highlights.set(geojson_layer, params.polygon_style_highlight);
        }

        this.#feature_group.addLayer(geojson_layer);
        geojson_layer.eachLayer(layer => {
            layer.feature._origin = this.#feature_group.getLayerId(geojson_layer);
        });
    }

    show() {
        this.getGroup().addTo(this.#interactive_map.getMap());
    }

    #setFeature(id, feature) {
        if (!this.#layers.has(id)) {
            this.#layers.set(id, new Array());
        }

        this.#layers.get(id).push(feature);
    }

    isDefault() {
        return this.#is_default;
    }

    /**
     * Get all layers with a specific feature ID.
     * @param {string} id ID of features to retrieve.
     * @returns Array of layers with that feature ID.
     */
    #getLayers(id) {
        return this.#layers.get(id);
    }

    hasFeature(id) {
        return this.#layers.has(id);
    }

    getGroup() {
        return this.#feature_group;
    }

    #getGroupForEdit(layer) {
        // The group is the GeoJSON FeatureGroup
        var group = this.#feature_group.getLayer(layer.feature._origin);

        if (this.#feature_group instanceof L.FeatureGroup.SubGroup) {
            var parent_group = this.#feature_group.getParentGroup();
            // There's an issue with marker from a geojson with marker cluster so we have use parent cluster then
            if (parent_group instanceof L.MarkerClusterGroup) {
                group = parent_group;
            }
        }

        return group;
    }

    removeLayer(layer) {
        this.#getGroupForEdit(layer).removeLayer(layer);
    }

    addLayer(layer) {
        this.#getGroupForEdit(layer).addLayer(layer);
    }

    /**
     * Get a map all layers
     * @returns Map<id, layers[]>
     */
    getAllLayers() {
        return this.#layers;
    }

    /**
     * Get the outer bounds of this entire group
     * @returns L.LatLngBounds
     */
    getGroupBounds() {
        var bounds = L.latLngBounds();

        this.#layers.forEach((layers, key) => {
            bounds.extend(this.#getLayerBounds(key));
        });

        return bounds;
    }

    /**
     * Get the bounds of all layers with a feature ID
     * @param {string} id Feature ID
     * @returns L.LatLngBounds
     */
    #getLayerBounds(id) {
        var bounds = L.latLngBounds();

        this.#getLayers(id).forEach(layer => {
            if (layer instanceof L.Polyline) {
                // Polygons
                bounds.extend(layer.getBounds());
            } else if (layer instanceof L.Circle) {
                // FIXME: This somehow fails:
                // bounds.extend(layer.getBounds());
                // Do this in the meantime:
                var position = layer._latlng;
                var radius = layer._mRadius;
                bounds.extend([[position.lat - radius, position.lng - radius], [position.lat + radius, position.lng + radius]]);
            } else {
                // Point
                bounds.extend([layer.getLatLng()]);
            }
        });

        return bounds;
    }

    #setSidebarColumnCount() {
        var length = 4;
        var columns = 1;

        this.#layers.forEach((layer, id) => {
            if (id.length > length) {
                length = id.length;
            }
        });

        if (length < 5) {
            columns = 3;
        } else if (length < 15) {
            columns = 2;
        }

        this.#sidebar_list_html.setAttribute('style', `grid-template-columns: repeat(${columns}, auto)`);
    }

    highlightFeature(id) {
        this.#getLayers(id).forEach(layer => {
            if (layer instanceof L.Path) {
                this.#highlightPolygon(layer);
            } else {
                // Marker
                this.#highlightPoint(layer);
            }
        });

        this.#interactive_map.getMap().on('click', () => { this.removeHighlightFeature(id); });
    }

    // https://stackoverflow.com/a/24813338
    removeHighlightFeature(id) {
        var layers = this.#getLayers(id);

        for (const index of this.#reverseKeys(this.#highlighted_layers)) {
            var layer = this.#highlighted_layers[index];

            if (!layers.includes(layer)) {
                continue;
            }

            if (layer instanceof L.Path) {
                this.#removePolygonHighlight(layer);
                this.#highlighted_layers.splice(index, 1);
            } else {
                this.#removePointHighlight(layer);
                this.#highlighted_layers.splice(index, 1);
            }
        }

        this.#interactive_map.getMap().off('click', () => { this.removeHighlightFeature(id); });
    }

    #highlightPoint(layer) {
        if (this.#highlighted_layers.includes(layer)) {
            return;
        }

        var icon = layer.getIcon();
        icon.options.html = `<div class="map-marker-ping"></div>${icon.options.html}`;
        layer.setIcon(icon);

        this.#highlighted_layers.push(layer);
    }

    #removePointHighlight(layer) {
        if (!this.#highlighted_layers.includes(layer)) {
            return;
        }

        var icon = layer.getIcon();
        icon.options.html = icon.options.html.replace('<div class="map-marker-ping"></div>', '');
        layer.setIcon(icon);
    }

    #highlightPolygon(layer) {
        if (this.#highlighted_layers.includes(layer)) {
            return;
        }

        this.#polygon_style_highlights.forEach((style, geojson) => {
            if (geojson.hasLayer(layer)) {
                if (style instanceof Function) {
                    layer.setStyle(style(layer.feature));
                } else {
                    layer.setStyle(style);
                }
            }
        });


        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        this.#highlighted_layers.push(layer);
    }

    #removePolygonHighlight(layer = undefined) {
        if (layer) {
            if (!this.#highlighted_layers.includes(layer)) {
                return;
            }

            this.#geojsons.forEach(geojson => {
                if (geojson.hasLayer(layer)) {
                    geojson.resetStyle(layer);
                    return;
                }
            });
            return;
        }

        this.#geojsons.forEach(geojson => {
            geojson.resetStyle(layer);
        });
    }

    removeAllHighlights() {
        this.#highlighted_layers.forEach(layer => {
            if (layer instanceof L.Path) {
                this.#removePolygonHighlight(layer);
            } else {
                this.#removePointHighlight(layer);
            }
        });

        this.#highlighted_layers = [];
        this.#interactive_map.getMap().off('click', this.removeAllHighlights, this);
    }

    // https://stackoverflow.com/a/24813338
    * #reverseKeys(arr) {
        var key = arr.length - 1;

        while (key >= 0) {
            yield key;
            key -= 1;
        }
    }

    #createSidebarCheckbox(feature) {
        if (!document.getElementById(this.id + ':' + feature.properties.id)) {
            var list_entry = document.createElement('li');
            list_entry.className = 'flex-grow-1';

            var leave_function = () => { this.removeHighlightFeature(feature.properties.id); };
            list_entry.addEventListener('mouseenter', () => { this.highlightFeature(feature.properties.id); });
            list_entry.addEventListener('mouseleave', leave_function);

            var checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.id = this.id + ':' + feature.properties.id;
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
                // Close sidebar if it spans over the complete view
                if (window.matchMedia('(max-device-width: 767px)').matches) {
                    this.#sidebar.close();
                }

                // rewrite url for easy copy pasta
                Utils.setHistoryState(this.id, feature.properties.id);

                Utils.removeAllHighlights();
                this.highlightFeature(feature.properties.id);
                this.zoomToFeature(feature.properties.id);

                // tmp disable after button click
                list_entry.removeEventListener('mouseleave', leave_function);
                window.setTimeout(() => {
                    list_entry.addEventListener('mouseleave', leave_function);
                }, 3000);
            });
            locate_button.className = 'flex-grow-0';

            list_entry.appendChild(checkbox);
            list_entry.appendChild(label);
            list_entry.appendChild(locate_button);
            this.#sidebar_list_html.appendChild(list_entry);

            // hide if checked previously
            if (localStorage.getItem(`${this.#website_subdir}:${this.id}:${feature.properties.id}`)) {
                checkbox.checked = true;
            }

            // watch global checkbox
            if (document.getElementById(this.id + ':' + feature.properties.id) != null) {
                // if not a marker try to assign to the same checkbox as the corresponding marker
                document.getElementById(this.id + ':' + feature.properties.id).addEventListener('change', element => {
                    if (element.target.checked) {
                        // remove all layers with ID from map
                        this.#getLayers(feature.properties.id).forEach(l => {
                            this.#getGroupForEdit(l).removeLayer(l);
                        });
                        // save to localStorage
                        localStorage.setItem(`${this.#website_subdir}:${this.id}:${feature.properties.id}`, true);
                    } else {
                        // add all layers with ID to map
                        this.#getLayers(feature.properties.id).forEach(l => {
                            this.#getGroupForEdit(l).addLayer(l);
                        });
                        // remove from localStorage
                        localStorage.removeItem(`${this.#website_subdir}:${this.id}:${feature.properties.id}`);
                    }
                });
            }
        }
    }

    #createFeaturePopup(feature, layer) {
        layer.bindPopup(() => {
            var html = document.createElement('div');

            var title = document.createElement('h2');
            title.className = 'popup-title';

            // While it would be nice to display a readable name here this would break any recognizable association to the sidebar list.
            title.innerHTML = feature.properties.id;

            html.appendChild(title);

            html = getPopupMedia(feature, this.id, html);

            if (feature.properties.description) {
                var description = document.createElement('p');
                description.className = 'popup-description';
                var span = document.createElement('span');
                span.setAttribute('style', 'white-space: pre-wrap');
                span.appendChild(document.createTextNode(feature.properties.description));
                description.appendChild(span);

                html.appendChild(description);
            }

            // Checkbox requires a global counterpart
            if (this.#create_checkbox && document.getElementById(this.id + ':' + feature.properties.id)) {
                var label = document.createElement('label');
                label.className = 'popup-checkbox is-fullwidth';

                var label_text = document.createTextNode('Hide this marker');

                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';

                if (localStorage.getItem(`${this.#website_subdir}:${this.id}:${feature.properties.id}`)) {
                    checkbox.checked = true;
                }

                checkbox.addEventListener('change', element => {
                    if (element.target.checked) {
                        // check global checkbox
                        document.getElementById(this.id + ':' + feature.properties.id).checked = true;
                        // remove all with ID from map
                        this.#getLayers(feature.properties.id).forEach(l => {
                            this.#getGroupForEdit(l).removeLayer(l);
                        });
                        // save to localStorage
                        localStorage.setItem(`${this.#website_subdir}:${this.id}:${feature.properties.id}`, true);
                    } else {
                        // uncheck global checkbox
                        document.getElementById(this.id + ':' + feature.properties.id).checked = false;
                        // add all with ID to map
                        this.#getLayers(feature.properties.id).forEach(l => {
                            this.#getGroupForEdit(l).addLayer(l);
                        });
                        // remove from localStorage
                        localStorage.removeItem(`${this.#website_subdir}:${this.id}:${feature.properties.id}`);
                    }
                });

                label.appendChild(checkbox);
                label.appendChild(label_text);
                html.appendChild(label);
            }

            layer.on('popupopen', event => {
                // rewrite url for easy copy pasta
                Utils.setHistoryState(this.id, feature.properties.id);
            });

            layer.on('popupclose', event => {
                Utils.share_marker.prevent();
                Utils.setHistoryState(undefined, undefined, this.#website_subdir);
            });

            return html;
        }, {
            maxWidth: "auto"
        });
    }

    #createSidebarTab(icon_html) {
        var list = document.createElement('ul');
        list.className = 'collectibles_list';

        var icon = icon_html;

        if (icon_html instanceof Function) {
            icon = icon_html.bind(this);
            icon = icon();
        }

        // Add list to sidebar
        this.#sidebar.addPanel({
            id: this.id,
            tab: icon,
            title: this.name,
            pane: '<p></p>' // placeholder to get a proper pane
        });
        document.getElementById(this.id).appendChild(list);

        this.#sidebar_list_html = list;
    }

    zoomToFeature(id) {
        var layers = this.#getLayers(id);

        if (layers.length > 1) {
            // Multiple features
            this.#interactive_map.zoomToBounds(this.#getLayerBounds(id));
            return;
        }

        var layer = layers[0];

        if (layer instanceof L.Path) {
            // Polygon
            this.#interactive_map.zoomToBounds(this.#getLayerBounds(id));
            return;
        }

        var group = this.#getGroupForEdit(layer);

        if (group instanceof L.MarkerClusterGroup && group.hasLayer(layer)) {
            // Single Point
            group.zoomToShowLayer(layer, () => {
                // Zoom in further if we can
                window.setTimeout(() => {
                    if (this.#interactive_map.getMap().getZoom() < this.#interactive_map.getMaxZoom()) {
                        this.#interactive_map.zoomToBounds(this.#getLayerBounds(id));
                    }
                }, 300);
            });
            return;
        }

        // not visible
        this.#interactive_map.zoomToBounds(this.#getLayerBounds(id));
    }

    zoomTo() {
        this.#interactive_map.zoomToBounds(this.getGroupBounds());
    }
}
