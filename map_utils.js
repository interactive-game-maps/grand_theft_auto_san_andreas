function getPopupMedia(feature, list_id, html) {
    const POPUP_WIDTH_16_9 = Math.min(500, window.screen.availWidth - 100, (window.screen.availHeight - 200) * 16 / 9);
    const POPUP_WIDTH_4_3 = Math.min(500, window.screen.availWidth - 100, (window.screen.availHeight - 200) * 4 / 3);

    if (feature.properties.image_id) {
        var prefix = 'https://static.wikia.nocookie.net/gtawiki/images/';
        var suffix = '.jpg';
        if (list_id == "horseshoes"
            || list_id == "oysters") {
            prefix = 'https://static.wikigta.org/en/images/';
            suffix = '.JPG'
        }

        var image_link = document.createElement('a');
        if (feature.properties.image_link) {
            switch (list_id) {
                case 'tags':
                    image_link.href = `https://gta.fandom.com/wiki/${feature.properties.image_link}`;
                    break;

                case 'horseshoes':
                case 'oysters':
                    image_link.href = `http://en.wikigta.org/wiki/${feature.properties.image_link}`;
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
        image.width = POPUP_WIDTH_4_3;
        image.className = 'popup-media';

        image_link.appendChild(image);
        html.appendChild(image_link);
    } else if (feature.properties.video_id) {
        var video = document.createElement('iframe');
        video.className = 'popup-media';
        video.width = POPUP_WIDTH_16_9;
        video.height = POPUP_WIDTH_16_9 / 16 * 9;
        video.src = `https://www.youtube-nocookie.com/embed/${feature.properties.video_id}`;
        video.title = 'YouTube video player';
        video.frameborder = 0;
        // video.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; allowfullscreen'

        html.appendChild(video);
    }

    return html;
}
