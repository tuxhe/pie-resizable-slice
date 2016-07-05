/* global Highcharts */
(function(H) {
  /*jshint expr:true, boss:true */
  var each = H.each,
    defaults = {
      enabled: false,
      resizeStep: 1,
      resizePoint: {
        size: 10,
        cursor: 'e-resize',
        class: 'highcharts-handle',
        fill: '#ccc',
        stroke: '#000',
        strokeWidth: 1,
        zIndex: 1
      }
    };
  if(!Element.prototype.remove) {
    Element.prototype.remove = function() {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };
  }
  /**
   * Get angle based on x and y positions
   */
  function getAngle(x, y) {
    var aR = Math.atan2(x, -y);
    var aD = aR * (180 / Math.PI);
    if (aD < 0) {
      aD += 360;
    }
    return aD;
  }
  /**
   * Convert polar to cartesian
   */
  function polarToCartesian(centerX, centerY, radius, angleInRadians) {
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
  /**
   * Convert angle to degrees
   */
  function toDegrees(angle) {
    return angle * (180 / Math.PI);
  }
  /*
   * Add resize behavior to SVGElement
   */
  var sliceResize = H.SVGElement.prototype.resize = {
    // start resize event
    start: function(e, point) {
      var pointGraphic = point.graphic,
        chart = point.series.chart;
      // Bind events
      // Drag
      H.addEvent(chart.container, 'mousemove', function(e2) {
        sliceResize.step(e2, pointGraphic, point);
      });
      H.addEvent(chart.container, 'touchmove', function(e2) {
        sliceResize.step(e2, pointGraphic, point);
      });
      // Drop
      H.addEvent(chart.container, 'mouseup', function(e2) {
        sliceResize.stop(e2, point);
      });
      H.addEvent(chart.container, 'touchend', function(e2) {
        sliceResize.stop(e2, point);
      });
    },
    //step (Move)
    step: function(e, pointGraphic, point) {
      var series = point.series,
        chart = series.chart,
        angle = getAngle(
          (e.layerX - chart.plotLeft) - point.shapeArgs.x,
          (e.layerY - chart.plotTop) - point.shapeArgs.y
        ),
        currentPoint = point,
        previousVisiblePoint = point.getPreviousVisiblePoint(),
        minValue,
        totalCurentPreviousValue,
        maxValue,
        currentPointNewY,
        previousVisiblePointNewY,
        previousVisiblePointStartDegrees = toDegrees(
          previousVisiblePoint.shapeArgs.start
        ),
        startAngle = chart.options.plotOptions.pie.startAngle || 0,
        newStartAngle, step, minStep;

      // Assign new start angle based on the first point (0)
      if (currentPoint.index === series.firstVisiblePoint.index) {
        newStartAngle = angle;
      }
      //
      if (angle >= 0 && angle <= startAngle) {
        angle = angle + (
          360 - (startAngle + previousVisiblePointStartDegrees)
        ) + (startAngle - 90);
      } else {
        angle = angle - previousVisiblePointStartDegrees - 90;
      }
      if (currentPoint.index === series.firstVisiblePoint.index &&
        startAngle >= angle && angle < 0) {
        angle += 360;
      }
      // Calculate step value
      if (currentPoint.total > 0) {
        step = currentPoint.total / 360;
      } else {
        step = 1;
      }
      // Calculate Y value for current and previous points
      minValue = step * 10;
      totalCurentPreviousValue = (currentPoint.y + previousVisiblePoint.y);
      maxValue = totalCurentPreviousValue - minValue;
      currentPointNewY = Math.min(Math.max(angle * step, minValue), maxValue);
      previousVisiblePointNewY = totalCurentPreviousValue - currentPointNewY;

      // Validate min and max values
      if (currentPointNewY === minValue || currentPointNewY === maxValue) {
        return;
      }
      // Move firs point (StartAngle)
      if (currentPoint.index === series.firstVisiblePoint.index) {
        each(chart.series, function(s) {
          s.options.startAngle = newStartAngle;
          s.isDirty = s.isDirtyData = true;
        });
        chart.options.plotOptions.pie.startAngle = newStartAngle;
      }
      // Update point values
      currentPoint.update({
        y: previousVisiblePointNewY
      }, false);
      previousVisiblePoint.update({
        y: currentPointNewY
      }, false);
      // Redraw chart to update Y values and start angle
      chart.redraw();
      // fire event
      point.firePointEvent('onResizeSlice', point);
    },
    //stop (Drop)
    stop: function(e, point) {
      H.removeEvent(point.series.chart.container, 'mousemove');
      H.removeEvent(point.series.chart.container, 'touchmove');
      H.removeEvent(point.series.chart.container, 'mouseup');
      H.removeEvent(point.series.chart.container, 'touchend');
    }
  };

  H.wrap(H.seriesTypes.pie.prototype, 'drawTracker', function(proceed) {
    var series = this,
      options = series.options;

    proceed.apply(series);
    if (!options.resizeSlice.enabled) {
      return;
    }
    each(series.points, function(point) {
      var start = polarToCartesian(
        point.shapeArgs.x,
        point.shapeArgs.y,
        point.shapeArgs.r,
        point.shapeArgs.start
      );
      if (!point.handle) {
        if (!point.visible) {
          return;
        }
        if (series.pointVisibleCount <= 1) {
          return;
        }
        point.handle = series.chart.renderer.circle(
          start.x, start.y, options.resizeSlice.resizePoint.size
        ).attr({
          cursor: options.resizeSlice.resizePoint.cursor,
          'class': options.resizeSlice.resizePoint.class,
          fill: options.resizeSlice.resizePoint.fill,
          stroke: options.resizeSlice.resizePoint.stroke,
          'stroke-width': options.resizeSlice.resizePoint.strokeWidth,
          zIndex: options.resizeSlice.resizePoint.zIndex
        }).add(series.group);
        point.handle.element.point = point;
      } else {
        if (!point.visible) {
          point.handle.element.remove();
          point.handle = null;
          return;
        }
        if ((series.pointVisibleCount < 1 && !point.visible) ||
          series.pointVisibleCount === 1 && point.visible) {
          point.handle.element.remove();
          point.handle = null;
          return;
        }
        point.handle.attr({
          x: start.x,
          y: start.y
        });
        point.handle.attr({
          zIndex: 1
        });
      }
      // Bind start event
      point.handle.on('mousedown', function(e) {
          point.graphic.resize.start(e, point);
        })
        .on('touchstart', function(e) {
          point.graphic.resize.start(e, point);
        })
        .on('click', function(e) {
          e.preventDefault();
        });
    });
  });
  H.wrap(H.seriesTypes.pie.prototype, 'drawPoints', function(proceed) {
    proceed.apply(this, Array.prototype.slice.call(arguments, 1));
    var series = this,
      firstVisiblePoint = null,
      pointVisibleCount = series.chart.pointCount;
    // Set default options
    series.options.resizeSlice = $.extend({},
      defaults, series.options.resizeSlice || {}
    );

    H.each(series.data, function(point) {
      // Set first visible point
      if (point.visible && !firstVisiblePoint) {
        firstVisiblePoint = point;
      }
      var previousIndex = point.index - 1;
      var nextIndex = point.index + 1;

      if (previousIndex < 0) {
        previousIndex = series.points.length - 1;
      }
      if (nextIndex > series.points.length) {
        nextIndex = 0;
      }
      // previous point
      point.previousPoint = series.points[previousIndex];
      // next point
      point.nextPoint = series.points[nextIndex];
      // Get previous visible point
      point.getPreviousVisiblePoint = function() {
        var previousPoint = this.previousPoint;
        if (previousPoint.visible) {
          return previousPoint;
        } else {
          return previousPoint.getPreviousVisiblePoint();
        }
      };
      // Get previous visible point
      point.getNextVisiblePoint = function() {
        var nextPoint = this.nextPoint;
        if (nextPoint.visible) {
          return nextPoint;
        } else {
          return nextPoint.getNextVisiblePoint();
        }
      };
      // Set points visible count
      if (!point.visible) {
        pointVisibleCount--;
      }
      // Remove border
      if (series.options.borderWidth === 0) {
        point.pointAttr['']['stroke-width'] = 1;
        point.pointAttr[''].stroke = point.pointAttr[''].fill;
        point.pointAttr['hover']['stroke-width'] = 1;
        point.pointAttr['hover'].stroke = point.pointAttr['hover'].fill;
        point.pointAttr['select']['stroke-width'] = 1;
        point.pointAttr['select'].stroke = point.pointAttr['select'].fill;
      }
    });
    // Append point visible count property
    series.pointVisibleCount = pointVisibleCount < 0 ? 0 : pointVisibleCount;
    // Append firstVisiblePoint
    series.firstVisiblePoint = firstVisiblePoint;
  });
  H.wrap(H.Point.prototype, 'remove', function(proceed) {
    // Remove handle if exists
    var point = this;
    if (point.handle) {
      point.handle.element.remove();
      point.handle = null;
    }
    proceed.apply(point);
  });
}(Highcharts));
