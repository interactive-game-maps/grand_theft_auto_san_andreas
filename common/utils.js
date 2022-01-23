class Utils {
    /**
     * Spawn a browser download out of a string
     * @param {string} filename Name of the downloaded file with file extension
     * @param {string} text Text that appears in the file
     */
    // https://stackoverflow.com/a/18197341
    static download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    /**
     * Get an icon with a background variation and a centered symbol/icon/short string/nothing on top.
     * @param {string} [icon_id=undefined] The ID for the icon that can be found in `images/icons/ID.png` (length > 2). Can also be a Font Awesome ID (fa-ID), a text (length <= 2) or undefined.
     * @param {string} [icon_mode=undefined] The ID for the background variation that can be found in `images/icons/marker_ID.svg`. Can be undefined for the default icon background.
     * @returns L.divIcon
     */
    static getCustomIcon(icon_id = undefined, icon_mode = undefined) {
        var background_path = icon_mode ? `images/icons/marker_${icon_mode}.svg` : "common/icons/marker.svg";

        if (!icon_id) {
            return L.divIcon({
                className: 'map-marker',
                html: `
            <img class="map-marker-background" src="${background_path}" />
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
            <img class="map-marker-background" src="${background_path}" />
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
                <img class="map-marker-background" src="${background_path}" />
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
            <img class="map-marker-background" src="${background_path}" />
            <div class="map-marker-foreground-wrapper"><p class="map-marker-foreground">${icon_id}</p></div>
            `,
                iconSize: [25, 41],
                popupAnchor: [1, -34],
                iconAnchor: [12, 41],
                tooltipAnchor: [0, 0]
            });
        }
    }

    /**
     * Replace the current browser address bar.
     * If only `website_subdir` is given it will reset to that url
     * @param {string} [list_id=undefined] Group ID
     * @param {string} [feature_id=undefined] Feature ID
     * @param {string} [website_subdir=''] Resets to plain url
     */
    static setHistoryState(list_id = undefined, feature_id = undefined, website_subdir = '') {
        if (list_id && feature_id) {
            history.replaceState({}, "", `?list=${list_id}&id=${feature_id}`);
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
    }
}
