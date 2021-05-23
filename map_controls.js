{ // Defining overlay maps - markers
    var overlayMaps = {
        "Spray Tags": tags_cluster,
        "Snapshots": snapshots_cluster,
        "Horseshoes": horseshoes_cluster,
        "Oysters": oyster_cluster,
        "Cob Bribes": cop_bribes_cluster,
        "Busted Warps": busted_warps_group,
        "Death Warps": death_warps_group
    };

    // Make overlay layer visible by default
    map.addLayer(tags_cluster);
    map.addLayer(snapshots_cluster);
    map.addLayer(horseshoes_cluster);
    map.addLayer(oyster_cluster);

    // Center view over map
    map.fitBounds([[0, 0], [-192, 192]]);

    // Add user selection to map
    L.control.layers(baseMaps, overlayMaps).addTo(map);
}
