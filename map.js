var interactive_map = new InteractiveMap('map', {
    max_good_zoom: 6,
    max_map_zoom: 8,
    website_source: 'https://github.com/interactive-game-maps/grand_theft_auto_san_andreas',
    website_subdir: 'grand_theft_auto_san_andreas',
    attribution: `
    <li><div>Marker locations from <a href="https://ehgames.com/gta/maplist/">ehgames.com</a>.</div></li>
    <li><div>Spray tag and Snapshot images from <a href="https://gta.fandom.com/wiki/" title="https://gta.fandom.com/">https://gta.fandom.com/</a></div></li>
    <li><div>Horseshoe and Oyster images from <a href="http://en.wikigta.org/wiki/Main_Page" title="http://en.wikigta.org/wiki/Main_Page">http://en.wikigta.org/wiki/Main_Page</a></div></li>
    <li><div>Icons made by <a href="https://gtaforums.com/topic/893039-remastered-radar-icons-sa/" title="CRRPGMykael">CRRPGMykael</a> from <a href="https://gtaforums.com/" title="GTAFORUMS">https://gtaforums.com/</a></div></li>
    `
});

interactive_map.addTileLayer("Ingame map", {
    minNativeZoom: 2,
    maxNativeZoom: 5,
    attribution: '<a href="https://imgur.com/vt0tq1n">Map</a> <a href="https://old.reddit.com/r/sanandreas/comments/9856u1/high_resolution_map_for_grand_theft_auto_san/">from</a> <a href="https://old.reddit.com/user/TheCynicalAutist">TheCynicalAutist</a>'
});

interactive_map.addTileLayer("Satellite map", {
    minNativeZoom: 0,
    maxNativeZoom: 5,
    attribution: 'Map by <a href="https://ian-albert.com/games/grand_theft_auto_san_andreas_maps/">Ian Albert</a>',
    tileSize: 262,
}, 'satellite_tiles/{z}/{x}/{y}.png')

addTagsLayer(interactive_map);
addSnapshotsLayer(interactive_map);
addHorseshoesLayer(interactive_map);
addOystersLayer(interactive_map);
addStuntJumpsLayer(interactive_map);
addCopBribesLayer(interactive_map);
addRaceTournamentsLayer(interactive_map);
addBustedWarpsLayer(interactive_map);
addDeathWarpsLayer(interactive_map);

interactive_map.finalize();
