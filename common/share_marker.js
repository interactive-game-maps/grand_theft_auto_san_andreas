class ShareMarker extends L.Marker {
    #interactive_map;
    #map;

    /**
     * Clicking on the map sets a marker that can be shared.
     * @param {InteractiveMap} interactive_map Interactive map
     */
    constructor(interactive_map) {
        super([0, 0], {
            icon: Utils.getCustomIcon('fa-share-alt'),
            riseOnHover: true,
            draggable: true,
            pmIgnore: true
        });

        this.#interactive_map = interactive_map;
        this.#map = this.#interactive_map.getMap();

        this.on('moveend', this.removeHighlight);
        this.on('moveend', event => {
            history.replaceState({}, "", `?share=${event.target._latlng.lng},${event.target._latlng.lat}`);
        });

        this.bindPopup(() => {
            var html = document.createElement('div');

            var title = document.createElement('h2');
            title.className = 'popup-title';
            title.innerHTML = 'Share marker';
            html.appendChild(title);

            var button = document.createElement('button');
            button.innerHTML = 'Remove';
            button.className = 'popup-checkbox is-fullwidth';
            html.appendChild(button);

            button.addEventListener('click', () => {
                this.removeMarker();
                Utils.setHistoryState(undefined, undefined, this.#interactive_map.getWebsiteSubdir());
            });

            return html;
        });

        this.turnOn();
    }

    /**
     * Highlight the share marker.
     */
    highlight() {
        var icon = this.getIcon();
        icon.options.html = `<div class="map-marker-ping"></div>${icon.options.html}`;
        this.setIcon(icon);

        this.#map.on('click', this.removeHighlight, this);
    }

    /**
     * Moves to share marker to a specific location.
     * @param {L.LatLng} latlng Coordinates
     */
    move(latlng) {
        this.setLatLng([latlng[0], latlng[1]]);
        this.addTo(this.#map);
    }

    /**
     * Prevent placing the share marker by clicking on the map for a short amount of time.
     * Useful for events that would place a share marker but shouldn't. E.g. closing a popup by clicking
     * somewhere on the map.
     * @param {int} [time=300] Time in msec
     */
    prevent(time = 300) {
        this.#map.off('click', this.#moveEvent, this);
        window.setTimeout(() => {
            this.#map.on('click', this.#moveEvent, this);
        }, time);
    }

    /**
     * Remove a highlight from the share marker.
     */
    removeHighlight() {
        var icon = this.getIcon();
        icon.options.html = icon.options.html.replace('<div class="map-marker-ping"></div>', '');
        this.setIcon(icon);

        this.off('moveend', this.removeHighlight);
        this.#map.off('click', this.removeHighlight, this);
    }

    /**
     * Remove the share marker from the map.
     */
    removeMarker() {
        this.removeHighlight();
        this.remove();
    }

    /**
     * Turn off the share marker and don't listen for events from now on.
     */
    turnOff() {
        this.removeMarker();
        this.#map.off('click', this.#moveEvent, this);
    }

    /**
     * Turn on the share marker by listening for events from now on.
     */
    turnOn() {
        this.#map.on('click', this.#moveEvent, this);
    }

    /**
     * Zoom to the share marker.
     */
    zoomTo() {
        let bounds = [];

        bounds.push([this._latlng.lat, this._latlng.lng]);

        this.#interactive_map.zoomToBounds(bounds);
    }

    /**
     * Do something when the share marker was moved.
     * @param {L.Event} event Event
     */
    #moveEvent(event) {
        this.setLatLng(event.latlng);
        this.addTo(this.#map);
        history.replaceState({}, "", `?share=${event.latlng.lng},${event.latlng.lat}`);
    }
}
