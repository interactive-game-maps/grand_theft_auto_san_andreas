var snapshots_layer = new InteractiveLayer('snapshots', snapshots, {
    name: "Snapshots",
    create_checkbox: true,
    create_feature_popup: true,
    sidebar_icon_html: '<i class="fas fa-camera"></i>',
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: getCustomIcon('fa-camera'),
            riseOnHover: true
        });
    }
});

interactive_layers.set(snapshots_layer.id, snapshots_layer);

default_layers.push(snapshots_layer.name);
