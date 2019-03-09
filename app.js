var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        projection: 'EPSG:900913',
        center: ol.proj.fromLonLat([-2.5, 51.1]),
        zoom: 4
    })
});


/* Add layer of point features */
var pointsLayer = new ol.layer.Vector({
    title: 'random points',
    source: new ol.source.Vector({
        url: 'points.json',
        format: new ol.format.GeoJSON()
    })
});

/* Initialise map */
function init() {
    map.addLayer(pointsLayer);
}

init();

/* add ol.collection to hold all selected features */
var select = new ol.interaction.Select();
map.addInteraction(select);
var selectedFeatures = select.getFeatures();


/* Add drawing vector source */
var drawingSource = new ol.source.Vector({
    useSpatialIndex: false
});

/* Add drawing layer */
var drawingLayer = new ol.layer.Vector({
    source: drawingSource
});
map.addLayer(drawingLayer);

// Drawing interaction
let draw = new ol.interaction.Draw({
    source: drawingSource,
    type: 'Polygon',
});
map.addInteraction(draw);

/* Deactivate select and delete any existing polygons.
    Only one polygon drawn at a time. */
draw.on('drawstart', function (event) {
    drawingSource.clear();
    select.setActive(false);

    let sketch = event.feature;

    listener = sketch.getGeometry().on('change', function (event) {
        selectedFeatures.clear();
        var polygon = event.target;
        var features = pointsLayer.getSource().getFeatures();

        for (var i = 0; i < features.length; i++) {
            if (polygon.intersectsExtent(features[i].getGeometry().getExtent())) {
                selectedFeatures.push(features[i]);
            }
        }
    });
}, this);


/* Reactivate select after 300ms (to avoid single click trigger)
    and create final set of selected features. */
draw.on('drawend', function (event) {
    event.prevent
    delaySelectActivate();
    selectedFeatures.clear();

    var polygon = event.feature.getGeometry();
    var features = pointsLayer.getSource().getFeatures();

    for (var i = 0; i < features.length; i++) {
        if (polygon.intersectsExtent(features[i].getGeometry().getExtent())) {
            selectedFeatures.push(features[i]);
        }
    }
    setTimeout(() => {
        drawingSource.clear();
    }, 0)
});

function delaySelectActivate() {
    setTimeout(function () {
        select.setActive(true)
    }, 300);
}