class ShareMarker extends L.Marker {
    constructor(latlng, options) {
        super(latlng, options);

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
                setHistoryState();
            });

            return html;
        });

        map.on('click', this.#moveEvent, this);
    }

    highlight() {
        var icon = this.getIcon();
        icon.options.html = `<div class="map-marker-ping"></div>${icon.options.html}`;
        this.setIcon(icon);

        map.on('click', this.removeHighlight, this);
    }

    removeHighlight() {
        var icon = this.getIcon();
        icon.options.html = icon.options.html.replace('<div class="map-marker-ping"></div>', '');
        this.setIcon(icon);

        this.off('moveend', this.removeHighlight);
        map.off('click', this.removeHighlight, this);
    }

    #moveEvent(event) {
        this.setLatLng(event.latlng);
        this.addTo(map);
        history.replaceState({}, "", `?share=${event.latlng.lng},${event.latlng.lat}`);
    }

    move(latlng) {
        this.setLatLng([latlng[0], latlng[1]]);
        this.addTo(map);
    }

    removeMarker() {
        this.remove();
    }

    turnOff() {
        this.removeMarker();
        map.off('click', this.#moveEvent, this);
    }

    turnOn() {
        map.on('click', this.#moveEvent, this);
    }

    prevent() {
        map.off('click', this.#moveEvent, this);
        window.setTimeout(() => {
            map.on('click', this.#moveEvent, this);
        }, 300);
    }

    zoomTo() {
        let bounds = [];

        bounds.push([this._latlng.lat, this._latlng.lng]);

        zoomToBounds(bounds);
    }
}
