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

interactive_map.addTileLayer("Sattelite map", {
    minNativeZoom: 2,
    maxNativeZoom: 4,
    attribution: '<a href="GTASnP.com">GTASnP.com</a>',
    tileSize: 192,
}, 'https://a.maps.gtasnp.com/sa-satellite/{z}_{x}_{y}.png')

interactive_map.addInteractiveLayer(getTagsLayer());
interactive_map.addInteractiveLayer(getSnapshotsLayer());
interactive_map.addInteractiveLayer(getsHorseshoesLayer());
interactive_map.addInteractiveLayer(getOystersLayer());
interactive_map.addInteractiveLayer(getStuntJumpsLayer());
interactive_map.addInteractiveLayer(getCopBribesLayer());
interactive_map.addInteractiveLayer(getRaceTournamentsLayer());
interactive_map.addInteractiveLayer(getBustedWarpsLayer());
interactive_map.addInteractiveLayer(getDeathWarpsLayer());

interactive_map.finalize();
