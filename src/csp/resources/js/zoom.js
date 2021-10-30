// @see: https://jsfiddle.net/zu_min_com/2agy5ehm/26/
// @see: https://www.d3indepth.com/zoom-and-pan/

var zoom;
function enableZoomPan() {
    if (document.querySelector('g[data-mermaid-zoom-pan]')) return;

    var svgs = d3.selectAll(".mermaid svg");
    svgs.each(function () {
        var svg = d3.select(this);
        svg.html("<g data-mermaid-zoom-pan>" + svg.html() + "</g>");
        var inner = svg.select("g");
        zoom = d3.zoom()
            .on("zoom", function (event) {
                inner.attr("transform", event.transform);
            });
        svg.call(zoom);
    });
}

function zoomIn() {
	d3.select('svg')
		.transition()
		.call(zoom.scaleBy, 2);
}

function zoomOut() {
	d3.select('svg')
		.transition()
		.call(zoom.scaleBy, 0.5);
}

function resetZoom() {
	d3.select('svg')
		.transition()
		.call(zoom.scaleTo, 1);
}

function center() {
    const bbox = document.querySelector('svg').getBBox();
    const width = bbox.width;
    const height = bbox.height;
	d3.select('svg')
		.transition()
		.call(zoom.translateTo, 0.5 * width, 0.5 * height);
}

function panLeft() {
	d3.select('svg')
		.transition()
		.call(zoom.translateBy, -50, 0);
}

function panRight() {
	d3.select('svg')
		.transition()
		.call(zoom.translateBy, 50, 0);
}

function panUp() {
	d3.select('svg')
		.transition()
		.call(zoom.translateBy, 0, -50);
}

function panDown() {
	d3.select('svg')
		.transition()
		.call(zoom.translateBy, 0, 50);
}