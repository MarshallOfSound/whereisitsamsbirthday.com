// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

// Create map instance
var chart = am4core.create("chartdiv", am4maps.MapChart);
// Set map definition
chart.geodata = am4geodata_worldTimeZoneAreasHigh;
// Set projection
chart.projection = new am4maps.projections.Miller();
chart.panBehavior = "none";

var startColor = chart.colors.getIndex(0);
var middleColor = chart.colors.getIndex(7);
var endColor = chart.colors.getIndex(14);

var interfaceColors = new am4core.InterfaceColorSet();

var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
polygonSeries.useGeodata = true;
polygonSeries.calculateVisualCenter = true;

var polygonTemplate = polygonSeries.mapPolygons.template;
polygonTemplate.fillOpacity = 0.6;
polygonTemplate.nonScalingStroke = true;
polygonTemplate.strokeWidth = 1;
polygonTemplate.stroke = interfaceColors.getFor("background");
polygonTemplate.strokeOpacity = 1;

polygonTemplate.adapter.add("fill", function (fill, target) {
  if (target.dataItem.index > 0) {
    return chart.colors.getIndex(target.dataItem.index);
  }
  return fill;
});

var boundsSeries = chart.series.push(new am4maps.MapPolygonSeries());
const bdTzs = am4geodata_worldTimeZonesHigh.features
  .filter((f) => f.properties.TYPE === "Timezone")
  .filter((f) => {
    const offset = f.properties.name;
    console.log(offset);
    const t = offset.split(/[\+\-]/g)[1].split(":");
    const hours = parseInt(t[0], 10);
    const minutes = parseInt(t[1], 10);
    let offsetAsNumber = Math.round((hours + minutes / 60) * 100) / 100;
    if (offset.includes("-")) offsetAsNumber = -offsetAsNumber;
    return new Date(new Date().getTime() + offsetAsNumber * 3600 * 1000)
      .toUTCString()
      .includes(", 14 Mar 20");
  });
boundsSeries.geodata = {
  type: "FeatureCollection",
  features: bdTzs,
};
boundsSeries.useGeodata = true;
console.log(am4geodata_worldTimeZonesHigh);
boundsSeries.mapPolygons.template.fill = am4core.color("red");
boundsSeries.mapPolygons.template.fillOpacity = 0.25;
boundsSeries.mapPolygons.template.nonScalingStroke = true;
boundsSeries.mapPolygons.template.strokeWidth = 0.5;
boundsSeries.mapPolygons.template.strokeOpacity = 1;
boundsSeries.mapPolygons.template.stroke = interfaceColors.getFor("background");
boundsSeries.tooltipText = "{id}";
boundsSeries.clickable = true;
boundsSeries.mapPolygons.template.events.on('hit', () => {
  alert('Yup, it\'s Sams birthday there!!');
});

console.log(boundsSeries.mapPolygons);

var hs = polygonTemplate.states.create("hover");
hs.properties.fillOpacity = 1;

var bhs = boundsSeries.mapPolygons.template.states.create("hover");
bhs.properties.fillOpacity = 0.6;

polygonSeries.mapPolygons.template.events.on("over", function (event) {
  var polygon = boundsSeries.getPolygonById(
    event.target.dataItem.dataContext.id
  );
  if (polygon) {
    polygon.isHover = true;
  }
});

polygonSeries.mapPolygons.template.events.on("out", function (event) {
  var polygon = boundsSeries.getPolygonById(
    event.target.dataItem.dataContext.id
  );
  if (polygon) {
    polygon.isHover = false;
  }
});

var labelSeries = chart.series.push(new am4maps.MapImageSeries());
var label = labelSeries.mapImages.template.createChild(am4core.Label);
label.text = "{id}";
label.strokeOpacity = 0;
label.fill = am4core.color("#000000");
label.horizontalCenter = "middle";
label.fontSize = 9;
label.nonScaling = true;

labelSeries.mapImages.template.adapter.add("longitude", (longitude, target) => {
  target.zIndex = 100000;

  var polygon = polygonSeries.getPolygonById(target.dataItem.dataContext.id);
  if (polygon) {
    return polygon.visualLongitude;
  }
  return longitude;
});

labelSeries.mapImages.template.adapter.add("latitude", (latitude, target) => {
  var polygon = polygonSeries.getPolygonById(target.dataItem.dataContext.id);
  if (polygon) {
    return polygon.visualLatitude;
  }
  return latitude;
});

polygonSeries.events.on("datavalidated", function () {
  labelSeries.data = polygonSeries.data;
});
