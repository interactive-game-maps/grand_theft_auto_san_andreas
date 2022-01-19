class InteractiveLayer {
    #create_checkbox;
    #create_feature_popup;
    #features;
    #highlighted_features;
    #highlight_polygon_styles;
    #sidebar_list_html;
    #geojsonFeatures;
    #is_default;

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
                    icon: getCustomIcon(this.id),
                    riseOnHover: true
                });
            },
            onEachFeature: function (feature, layer) { },
            feature_group: L.featureGroup.subGroup(marker_cluster),
            highlight_polygon_style: {
                opacity: 1.0,
                fillOpacity: 0.7
            },
            polygon_style: feature => { return {}; }
        };

        let params = { ...defaults, ...args };

        this.id = id;
        this.name = params.name;
        this.#create_checkbox = params.create_checkbox;
        this.#create_feature_popup = params.create_feature_popup;
        this.#features = new Map();
        this.#highlighted_features = new Array();
        this.feature_group = params.feature_group;
        this.marker_cluster = marker_cluster;
        this.#sidebar_list_html = undefined;
        this.#geojsonFeatures = new Array();
        this.#highlight_polygon_styles = new Map();
        this.#is_default = params.is_default;

        if (!this.feature_group instanceof L.FeatureGroup.SubGroup) {
            this.marker_cluster = params.feature_group;
        }

        if (this.#create_checkbox) {
            this.#createSidebarTab(params.sidebar_icon_html);
        }

        this.addGeoJson(geojson, {
            pointToLayer: params.pointToLayer,
            onEachFeature: params.onEachFeature,
            polygon_style: params.polygon_style,
            highlight_polygon_style: params.highlight_polygon_style
        })

        if (this.#create_checkbox && this.#sidebar_list_html) {
            this.#setSidebarColumnCount();
        }
    }

    addGeoJson(geojson, args) {
        let defaults = {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: getCustomIcon(this.id),
                    riseOnHover: true
                });
            },
            onEachFeature: function (feature, layer) { },
            highlight_polygon_style: {
                opacity: 1.0,
                fillOpacity: 0.7
            },
            polygon_style: feature => { return {}; }
        };

        let params = { ...defaults, ...args };
        var onEachFeature = params.onEachFeature.bind(this);

        var geojson_feature = (L.geoJSON(geojson, {
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
        }));

        this.#geojsonFeatures.push(geojson_feature);
        this.#highlight_polygon_styles.set(geojson_feature, params.highlight_polygon_style);

        this.#geojsonFeatures.forEach(layer => {
            if (!this.feature_group.hasLayer(layer)) {
                layer.addTo(this.feature_group);
            }
        });
    }

    showLayer() {
        this.feature_group.addTo(map);
    }

    #setFeature(id, feature) {
        if (!this.#features.has(id)) {
            this.#features.set(id, new Array());
        }

        this.#features.get(id).push(feature);
    }

    isDefault() {
        return this.#is_default;
    }

    /**
     * Get all features with a specific ID.
     * @param {string} id ID of features to retrieve.
     * @returns Array of features with that ID.
     */
    getFeatures(id) {
        return this.#features.get(id);
    }

    hasFeature(id) {
        return this.#features.has(id);
    }

    getAllFeatures() {
        return this.#features;
    }

    getLayerBounds() {
        var bounds = new Array();

        this.#features.forEach((features, key) => {
            bounds.push(this.getFeatureBounds(key));
        });

        return bounds;
    }

    getFeatureBounds(id) {
        var bounds = new Array();

        this.getFeatures(id).forEach(feature => {
            if (feature._latlngs) {
                // Polygons
                feature._latlngs.forEach(latlng => {
                    bounds.push(latlng);
                });
            } else {
                // Point
                bounds.push(feature._latlng);
            }
        });

        return bounds;
    }

    #setSidebarColumnCount() {
        var length = 4;
        var columns = 1;

        this.#features.forEach((feature, id) => {
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
        this.getFeatures(id).forEach(feature => {
            if (feature instanceof L.Path) {
                this.#highlightPolygon(feature);
            } else {
                // Marker
                this.#highlightPoint(feature);
            }
        });

        map.on('click', () => { this.removeHighlightFeature(id); });
    }

    // https://stackoverflow.com/a/24813338
    removeHighlightFeature(id) {
        var features = this.getFeatures(id);

        for (const index of this.#reverseKeys(this.#highlighted_features)) {
            var feature = this.#highlighted_features[index];

            if (!features.includes(feature)) {
                continue;
            }

            if (feature instanceof L.Path) {
                this.#removePolygonHighlight(feature);
                this.#highlighted_features.splice(index, 1);
            } else {
                this.#removePointHighlight(feature);
                this.#highlighted_features.splice(index, 1);
            }
        }

        map.off('click', () => { this.removeHighlightFeature(id); });
    }

    #highlightPoint(feature) {
        if (this.#highlighted_features.includes(feature)) {
            return;
        }

        var icon = feature.getIcon();
        icon.options.html = `<div class="map-marker-ping"></div>${icon.options.html}`;
        feature.setIcon(icon);

        this.#highlighted_features.push(feature);
    }

    #removePointHighlight(feature) {
        if (!this.#highlighted_features.includes(feature)) {
            return;
        }

        var icon = feature.getIcon();
        icon.options.html = icon.options.html.replace('<div class="map-marker-ping"></div>', '');
        feature.setIcon(icon);
    }

    #highlightPolygon(feature) {
        if (this.#highlighted_features.includes(feature)) {
            return;
        }

        this.#highlight_polygon_styles.forEach((style, geojson) => {
            if (geojson.hasLayer(feature)) {
                if (style instanceof Function) {
                    feature.setStyle(style(feature.feature));
                } else {
                    feature.setStyle(style);
                }
            }
        });


        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            feature.bringToFront();
        }

        this.#highlighted_features.push(feature);
    }

    #removePolygonHighlight(feature = undefined) {
        if (feature) {
            if (!this.#highlighted_features.includes(feature)) {
                return;
            }

            this.#geojsonFeatures.forEach(geojson => {
                if (geojson.hasLayer(feature)) {
                    geojson.resetStyle(feature);
                    return;
                }
            });
            return;
        }

        this.#geojsonFeatures.forEach(geojson => {
            geojson.resetStyle(feature);
        });
    }

    removeAllHighlights() {
        this.#highlighted_features.forEach(feature => {
            if (feature instanceof L.Path) {
                this.#removePolygonHighlight(feature);
            } else {
                this.#removePointHighlight(feature);
            }
        });

        this.#highlighted_features = [];
        map.off('click', this.removeAllHighlights, this);
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
                    sidebar.close();
                }

                // rewrite url for easy copy pasta
                setHistoryState(this.id, feature.properties.id);

                removeAllHighlights();
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
            if (localStorage.getItem(`${website_subdir}:${this.id}:${feature.properties.id}`)) {
                checkbox.checked = true;
            }

            // watch global checkbox
            if (document.getElementById(this.id + ':' + feature.properties.id) != null) {
                // if not a marker try to assign to the same checkbox as the corresponding marker
                document.getElementById(this.id + ':' + feature.properties.id).addEventListener('change', (element) => {
                    if (element.target.checked) {
                        // save to localStorage
                        localStorage.setItem(`${website_subdir}:${this.id}:${feature.properties.id}`, true);
                        // remove all with ID from map
                        this.getFeatures(feature.properties.id).forEach(feature => {
                            this.marker_cluster.removeLayer(feature);
                        });
                    } else {
                        // remove from localStorage
                        localStorage.removeItem(`${website_subdir}:${this.id}:${feature.properties.id}`);
                        // add all with ID to map
                        this.getFeatures(feature.properties.id).forEach(feature => {
                            feature.addTo(this.marker_cluster);
                        });
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

                if (localStorage.getItem(`${website_subdir}:${this.id}:${feature.properties.id}`)) {
                    checkbox.checked = true;
                }

                checkbox.addEventListener('change', element => {
                    if (element.target.checked) {
                        // check global checkbox
                        document.getElementById(this.id + ':' + feature.properties.id).checked = true;
                        // save to localStorage
                        localStorage.setItem(`${website_subdir}:${this.id}:${feature.properties.id}`, true);
                        // remove all with ID from map
                        this.getFeatures(feature.properties.id).forEach(feature => {
                            this.marker_cluster.removeLayer(feature);
                        });
                    } else {
                        // uncheck global checkbox
                        document.getElementById(this.id + ':' + feature.properties.id).checked = false;
                        // remove from localStorage
                        localStorage.removeItem(`${website_subdir}:${this.id}:${feature.properties.id}`);
                        // add all with ID to map
                        this.getFeatures(feature.properties.id).forEach(feature => {
                            feature.addTo(this.marker_cluster);
                        });
                    }
                });

                label.appendChild(checkbox);
                label.appendChild(label_text);
                html.appendChild(label);
            }

            layer.on('popupopen', (event) => {
                // rewrite url for easy copy pasta
                setHistoryState(this.id, feature.properties.id);
            });

            layer.on('popupclose', (event) => {
                share_marker.prevent();
                setHistoryState();
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
        sidebar.addPanel({
            id: this.id,
            tab: icon,
            title: this.name,
            pane: '<p></p>' // placeholder to get a proper pane
        });
        document.getElementById(this.id).appendChild(list);

        this.#sidebar_list_html = list;
    }

    zoomToFeature(id) {
        var features = this.getFeatures(id);

        if (features.length > 1) {
            // Multiple features
            zoomToBounds(this.getFeatureBounds(id));
        } else {
            var feature = features[0];

            if (feature instanceof L.Path || !this.marker_cluster.hasLayer(feature)) {
                // Polygon or not visible
                zoomToBounds(this.getFeatureBounds(id));
            } else {
                // Single Point
                this.marker_cluster.zoomToShowLayer(feature, () => {
                    // Zoom in further if we can
                    window.setTimeout(() => {
                        if (map.getZoom() < MAX_ZOOM) {
                            zoomToBounds(this.getFeatureBounds(id));
                        }
                    }, 300);
                });
            }
        }
    }

    zoomTo() {
        zoomToBounds(this.getLayerBounds());
    }
}
