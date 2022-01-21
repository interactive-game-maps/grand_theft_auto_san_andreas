function getSnapshotsLayer() {
    return new InteractiveLayer('snapshots', snapshots, {
        name: "Snapshots",
        create_checkbox: true,
        create_feature_popup: true,
        is_default: true,
        sidebar_icon_html: '<i class="fas fa-camera"></i>',
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: Utils.getCustomIcon('fa-camera'),
                riseOnHover: true
            });
        }
    });
}
