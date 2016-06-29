Pie Resizable Slice for Highcharts
================
This plugin allows the user to resize any slice in a pie chart by dragging a handle, making them able to edit data directly in the chart.

Online demo:

* [Resizable Pie Slice](https://jsfiddle.net/k9epaa3q/)

### Options

| Option name | Type | Description |
| ----------- | ---- | ----------- |
| `series.resizeSlice.enabled` | Boolean | Enable resize slice.|
| `series.resizeSlice.resizeStep` | Number | Size of step when resizing a slice.|
| `series.resizeSlice.resizePoint.size` | Number | Size of resize handle.|
| `series.resizeSlice.resizePoint.cursor` | Number | Cursor to show over a resize handle.|
| `series.resizeSlice.resizePoint.class` | String | Class used to add and indicate that is a resize handle.|
| `series.resizeSlice.resizePoint.fill` | String | The fill color of the resize handle.|
| `series.resizeSlice.resizePoint.stroke` | String | The color of the resize handle stroke.|
| `series.resizeSlice.resizePoint.strokeWidth` | Number | The pixel stroke width of the resize handle.|
| `series.resizeSlice.resizePoint.zIndex` | Number | Define the visual z index of the resize handle.|
| `plotOptions.series.point.events.onResizeSlice` | Function | Callback that fires while resizing. The point parameter refers to the data being modified.|
