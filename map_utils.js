// Helper functions
function getPopupMedia(feature, list_id, html) {
    const POPUP_WIDTH = 500;

    if (feature.properties.image_id) {
        var prefix = 'https://static.wikia.nocookie.net/gtawiki/images/';
        var suffix = '.jpg';
        if (list_id == "horseshoes"
            || list_id == "oysters") {
            prefix = 'https://static.wikigta.org/en/images/';
            suffix = '.JPG'
        }

        var image_link = document.createElement('a');
        image_link.className = 'popup-media';
        if (feature.properties.image_link) {
            switch (list_id) {
                case 'tags':
                    image_link.href = `https://gta.fandom.com/wiki/${feature.properties.image_link}`;
                    break;

                case 'horseshoes':
                case 'oysters':
                    image_link.href = `http://en.wikigta.org/wiki/'${feature.properties.image_link}`;
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
        video.src = `https://www.youtube-nocookie.com/embed/${feature.properties.video_id}`;
        video.title = 'YouTube video player';
        video.frameborder = 0;
        // video.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; allowfullscreen'

        html.appendChild(video);
    }

    return html;
}

// highlightLayer = function highlightLayer(layer) {
//     if (!highlightedMarker.includes(layer)) {
//         layer.setStyle({
//             color: 'blue',
//             opacity: 1.0,
//             fillOpacity: 0.7
//         });

//         if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
//             layer.bringToFront();
//         }

//         highlightedMarker.push(layer);
//     }
// }
