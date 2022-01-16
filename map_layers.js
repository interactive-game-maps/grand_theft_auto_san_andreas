var website = 'https://github.com/interactive-game-maps/grand_theft_auto_san_andreas';
var website_subdir = 'grand_theft_auto_san_andreas';
var attribution = `
            <div>Marker locations from <a href="https://ehgames.com/gta/maplist/">ehgames.com</a>.</div>
            <div>Spray tag and Snapshot images from <a href="https://gta.fandom.com/wiki/" title="https://gta.fandom.com/">https://gta.fandom.com/</a></div>
            <div>Horseshoe and Oyster images from <a href="http://en.wikigta.org/wiki/Main_Page" title="http://en.wikigta.org/wiki/Main_Page">http://en.wikigta.org/wiki/Main_Page</a></div>
            <div>Icons made by <a href="https://gtaforums.com/topic/893039-remastered-radar-icons-sa/" title="CRRPGMykael">CRRPGMykael</a> from <a href="https://gtaforums.com/" title="GTAFORUMS">https://gtaforums.com/</a></div>
            <div>Icons made by <a href="https://fontawesome.com/" title="Font Awesome">Font Awesome</a> under <a href="https://fontawesome.com/license">CCA4</a>.</div>
            `
const MAX_ZOOM = 5;

var map = L.map('map', {
    crs: L.CRS.Simple,
    // minZoom: 0,
    maxZoom: 8,
    zoom: 3
});

// Use tiled maps if possible, allows better zooming
// Make sure tiling scheme is growing downwards!
// https://github.com/Leaflet/Leaflet/issues/4333#issuecomment-199753161
// https://github.com/commenthol/gdal2tiles-leaflet
// ./gdal2tiles.py -l -p raster -w none -z 2-5 full_map.jpg map_tiles
var tiled_map = new L.tileLayer('map_tiles/{z}/{x}/{y}.png', {
    minNativeZoom: 2,
    maxNativeZoom: L.Browser.retina ? MAX_ZOOM - 1 : MAX_ZOOM, // 1 level LOWER for high pixel ratio device.
    attribution: 'Map from <a href="https://old.reddit.com/r/sanandreas/comments/9856u1/high_resolution_map_for_grand_theft_auto_san/">TheCynicalAutist</a>',
    noWrap: true,
    detectRetina: true
});

var baseMaps = {
    "Ingame map": tiled_map
};

// Make one base layer visible by default
tiled_map.addTo(map);
