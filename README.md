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
| `series.resizeSlice.resizePoint.size` | Number | Size of handle point.|
| `series.resizeSlice.resizePoint.cursor` | Number | Cursor to show over a handle point.|
| `series.resizeSlice.resizePoint.class` | String | Class used to add and indicate that is handle point.|
| `series.resizeSlice.resizePoint.fill` | String | The fill color of the handle point.|
| `series.resizeSlice.resizePoint.stroke` | String | The color of the handle point stroke.|
| `series.resizeSlice.resizePoint.strokeWidth` | Number | The pixel stroke width of the handle point.|
| `series.resizeSlice.resizePoint.zIndex` | Number | Define the visual z index of the handle point.|
| `plotOptions.series.point.events.onResizeSlice` | Function | Callback that fires while resizing. The point parameter refers to the data being modified.|
