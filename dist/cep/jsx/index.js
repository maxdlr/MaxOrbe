(function (thisObj) {// ----- EXTENDSCRIPT INCLUDES ------ //"object" != typeof JSON && (JSON = {}),
  (function () {
    "use strict";
    var rx_one = /^[\],:{}\s]*$/,
      rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
      rx_three =
        /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
      rx_four = /(?:^|:|,)(?:\s*\[)+/g,
      rx_escapable =
        /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      rx_dangerous =
        /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
      gap,
      indent,
      meta,
      rep;
    function f(t) {
      return t < 10 ? "0" + t : t;
    }
    function this_value() {
      return this.valueOf();
    }
    function quote(t) {
      return (
        (rx_escapable.lastIndex = 0),
        rx_escapable.test(t)
          ? '"' +
            t.replace(rx_escapable, function (t) {
              var e = meta[t];
              return "string" == typeof e
                ? e
                : "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4);
            }) +
            '"'
          : '"' + t + '"'
      );
    }
    function str(t, e) {
      var r,
        n,
        o,
        u,
        f,
        a = gap,
        i = e[t];
      switch (
        (i &&
          "object" == typeof i &&
          "function" == typeof i.toJSON &&
          (i = i.toJSON(t)),
        "function" == typeof rep && (i = rep.call(e, t, i)),
        typeof i)
      ) {
        case "string":
          return quote(i);
        case "number":
          return isFinite(i) ? String(i) : "null";
        case "boolean":
        case "null":
          return String(i);
        case "object":
          if (!i) return "null";
          if (
            ((gap += indent),
            (f = []),
            "[object Array]" === Object.prototype.toString.apply(i))
          ) {
            for (u = i.length, r = 0; r < u; r += 1) f[r] = str(r, i) || "null";
            return (
              (o =
                0 === f.length
                  ? "[]"
                  : gap
                    ? "[\n" + gap + f.join(",\n" + gap) + "\n" + a + "]"
                    : "[" + f.join(",") + "]"),
              (gap = a),
              o
            );
          }
          if (rep && "object" == typeof rep)
            for (u = rep.length, r = 0; r < u; r += 1)
              "string" == typeof rep[r] &&
                (o = str((n = rep[r]), i)) &&
                f.push(quote(n) + (gap ? ": " : ":") + o);
          else
            for (n in i)
              Object.prototype.hasOwnProperty.call(i, n) &&
                (o = str(n, i)) &&
                f.push(quote(n) + (gap ? ": " : ":") + o);
          return (
            (o =
              0 === f.length
                ? "{}"
                : gap
                  ? "{\n" + gap + f.join(",\n" + gap) + "\n" + a + "}"
                  : "{" + f.join(",") + "}"),
            (gap = a),
            o
          );
      }
    }
    "function" != typeof Date.prototype.toJSON &&
      ((Date.prototype.toJSON = function () {
        return isFinite(this.valueOf())
          ? this.getUTCFullYear() +
              "-" +
              f(this.getUTCMonth() + 1) +
              "-" +
              f(this.getUTCDate()) +
              "T" +
              f(this.getUTCHours()) +
              ":" +
              f(this.getUTCMinutes()) +
              ":" +
              f(this.getUTCSeconds()) +
              "Z"
          : null;
      }),
      (Boolean.prototype.toJSON = this_value),
      (Number.prototype.toJSON = this_value),
      (String.prototype.toJSON = this_value)),
      "function" != typeof JSON.stringify &&
        ((meta = {
          "\b": "\\b",
          "\t": "\\t",
          "\n": "\\n",
          "\f": "\\f",
          "\r": "\\r",
          '"': '\\"',
          "\\": "\\\\",
        }),
        (JSON.stringify = function (t, e, r) {
          var n;
          if (((gap = ""), (indent = ""), "number" == typeof r))
            for (n = 0; n < r; n += 1) indent += " ";
          else "string" == typeof r && (indent = r);
          if (
            ((rep = e),
            e &&
              "function" != typeof e &&
              ("object" != typeof e || "number" != typeof e.length))
          )
            throw new Error("JSON.stringify");
          return str("", { "": t });
        })),
      "function" != typeof JSON.parse &&
        (JSON.parse = function (text, reviver) {
          var j;
          function walk(t, e) {
            var r,
              n,
              o = t[e];
            if (o && "object" == typeof o)
              for (r in o)
                Object.prototype.hasOwnProperty.call(o, r) &&
                  (void 0 !== (n = walk(o, r)) ? (o[r] = n) : delete o[r]);
            return reviver.call(t, e, o);
          }
          if (
            ((text = String(text)),
            (rx_dangerous.lastIndex = 0),
            rx_dangerous.test(text) &&
              (text = text.replace(rx_dangerous, function (t) {
                return (
                  "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4)
                );
              })),
            rx_one.test(
              text
                .replace(rx_two, "@")
                .replace(rx_three, "]")
                .replace(rx_four, ""),
            ))
          )
            return (
              (j = eval("(" + text + ")")),
              "function" == typeof reviver ? walk({ "": j }, "") : j
            );
          throw new SyntaxError("JSON.parse");
        });
  })();
// ---------------------------------- //// ----- EXTENDSCRIPT PONYFILLS -----function __objectFreeze(obj) { return obj; }// ---------------------------------- //var version = "0.0.1";

var config = {
  version: version,
  id: "com.maxorbe.cep",
  displayName: "MaxOrbe",
  symlink: "local",
  port: 3000,
  servePort: 5000,
  startingDebugPort: 8860,
  extensionManifestVersion: 6.0,
  requiredRuntimeVersion: 9.0,
  hosts: [{
    name: "AEFT",
    version: "[0.0,99.9]"
  }],
  type: "Panel",
  iconDarkNormal: "./src/assets/light-icon.png",
  iconNormal: "./src/assets/dark-icon.png",
  iconDarkNormalRollOver: "./src/assets/light-icon.png",
  iconNormalRollOver: "./src/assets/dark-icon.png",
  parameters: ["--v=0", "--enable-nodejs", "--mixed-context"],
  width: 500,
  height: 550,
  panels: [{
    mainPath: "./main/index.html",
    name: "main",
    panelDisplayName: "MaxOrbe",
    autoVisible: true,
    width: 600,
    height: 650
  }],
  build: {
    jsxBin: "off",
    sourceMap: true
  },
  zxp: {
    country: "US",
    province: "CA",
    org: "MyCompany",
    password: "mypassword",
    tsa: "http://timestamp.digicert.com/",
    sourceMap: false,
    jsxBin: "off"
  },
  installModules: [],
  copyAssets: [],
  copyZipAssets: []
};

var ns = config.id;

var transform = {
  group: "ADBE Transform Group",
  anchorPoint: "ADBE Anchor Point",
  position: "ADBE Position",
  xPosition: "ADBE Position_0",
  yPosition: "ADBE Position_1",
  zPosition: "ADBE Position_2",
  scale: "ADBE Scale",
  orientation: "ADBE Orientation",
  xRotation: "ADBE Rotate X",
  yRotation: "ADBE Rotate Y",
  zRotation: "ADBE Rotate Z",
  opacity: "ADBE Opacity"
};
var MaxAvLayerMatchNames = {
  group: "ADBE AV Layer",
  transform: transform
};

var MaxLayer = {
  layer: {},
  "new": function _new(type, comp, name) {
    switch (type) {
      case "ShapeLayer":
        this.layer = comp.layers.addShape();
        break;
      case "Null":
        this.layer = comp.layers.addNull();
        break;
      default:
        throw new Error("Please specify the layer type to create");
    }
    this.layer.name = name;
    return this;
  },
  parentTo: function parentTo(parentLayer) {
    var withJump = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (withJump) {
      this.layer.setParentWithJump(parentLayer);
      return this;
    }
    this.layer.parent = parentLayer;
    return this;
  },
  transform: function transform(type, value) {
    var transformGroup = this.layer.property(MaxAvLayerMatchNames.transform.group);
    var transformProperty = transformGroup.property(MaxAvLayerMatchNames.transform[type]);
    if (typeof value === "string") {
      transformProperty.expression = value;
      return this;
    }
    transformProperty.setValue(value);
    return this;
  },
  build: function build() {
    return this.layer;
  }
};

var controller = {
  layer: {
    name: "[CTRL] - MaxOrbe"
  }
};

var expressionControl = {
  threeDPoint: "ADBE Point3D Control",
  angle: "ADBE Angle Control",
  checkbox: "ADBE Checkbox Control",
  color: "ADBE Color Control",
  dropdown: "ADBE Dropdown Control",
  layer: "ADBE Layer Control",
  point: "ADBE Point Control",
  slider: {
    group: "ADBE Slider Control",
    property: "ADBE Slider Control-0001"
  }
};
var MaxEffectsMatchNames = {
  group: "ADBE Effect Parade",
  expressionControl: expressionControl
};

var makeController = function makeController(comp) {
  var ctrl = MaxLayer["new"]("Null", comp, controller.layer.name).transform("position", [comp.width / 2, comp.height / 2]).build();
  var ctrlEffects = ctrl.property(MaxEffectsMatchNames.group);
  alert(ctrlEffects.matchName);

  // ctrlEffects.addProperty("Pseudo/MaxOrbe");

  return ctrl;
};

var MAXORBE_LAYER = {
  anchorPoint: "parent.effect(\"Anchor Offset\")(\"Point\")"
};

////////////////////// ----------------- //////////////////////

var MAXORBE_BOTTOM_BODY_STROKE = {
  color: "parent.effect(\"body.stroke.color\")(\"Color\")",
  width: "parent.effect(\"body.stroke.width\")(\"Slider\")"
};
var MAXORBE_BOTTOM_BODY_TOP = {
  opacity: "rot = parent.effect(\"body.rot.x\")(\"Angle\");\nrot > 0 ? 100 : 0;"
};
var MAXORBE_BOTTOM_BODY_TOP_HOLE = {
  size: "ctrlLayer = parent;\nx = ctrlLayer.effect(\"body.size\")(\"Slider\") / 2;\nz = ctrlLayer.effect(\"body.rot.x\")(\"Angle\");\n[x, linear(z, 0, 180, 0, x)]",
  position: "[0,0]",
  fillColor: "parent.effect(\"body.hole.color\")(\"Color\")"
};
var MAXORBE_BOTTOM_BODY_TOP_MAIN = {
  size: "ctrlLayer = parent;\nx = ctrlLayer.effect(\"body.size\")(\"Slider\");\nz = ctrlLayer.effect(\"body.rot.x\")(\"Angle\");\n[x, linear(z, 0, 180, 0, x)]",
  position: "[0,0]",
  color: "parent.effect(\"body.stroke.color\")(\"Color\")",
  strokeWidth: "parent.effect(\"body.stroke.width\")(\"Slider\")"
};
var MAXORBE_BODY_BOTTOM_BACK = {
  size: "ctrlLayer = parent;\nx = ctrlLayer.effect(\"body.size\")(\"Slider\");\nz = ctrlLayer.effect(\"body.rot.x\")(\"Angle\");\n[x, linear(z, -180, 0, x, 0)]",
  position: "[0,0]"
};
var MAXORBE_BODY_BOTTOM_MAIN_BODY = {
  size: "temp = parent.effect(\"body.size\")(\"Slider\");\n[temp, temp]",
  position: "[0,0]",
  gradientEndPoint: "temp = parent.effect(\"body.size\")(\"Slider\");\n[temp/1.7, 0]"
};
var MAXORBE_BODY_BOTTOM_MAIN_BODY_MASK = {
  size: "temp = parent.effect(\"body.size\")(\"Slider\");\n[temp, temp/2]",
  position: "temp = parent.effect(\"body.size\")(\"Slider\");\n[0, -temp/4]"
};

////////////////////// ----------------- //////////////////////

var MAXORBE_ORBE = {
  bottomOpacity: "mainOpa = content(\"Bottom - Dome\").transform.opacity;\ncondition = parent.effect(\"Active mini-orbe\")(\"Checkbox\");\ncondition == 1 ? mainOpa : 0;",
  topOpacity: "mainOpa = content(\"Top - Dome\").transform.opacity;\ncondition = parent.effect(\"Active mini-orbe\")(\"Checkbox\");\ncondition == 1 ? mainOpa : 0;"
};
var MAXORBE_ORBE_PATH = {
  bottomSize: "temp = parent.effect(\"body.size\")(\"Slider\") / 4;\n[temp, temp]",
  bottomPosition: "freq = 3;\namp = 50;\nloopTime = thisComp.duration;\nt = time % loopTime;\nwiggle1 = wiggle(freq, amp, 1, 0.5, t);\nwiggle2 = wiggle(freq, amp, 1, 0.5, t - loopTime);\nease(t, 0, loopTime, wiggle1, wiggle2)",
  topSize: "content(\"Bottom - Orbe\").content(\"Bottom - Orbe - Path\").size",
  topPosition: "content(\"Bottom - Orbe\").content(\"Bottom - Orbe - Path\").position"
};
var MAXORBE_ORBE_GRADIENT_FILL = {
  bottomStartPoint: "content(\"Bottom - Orbe\").content(\"Bottom - Orbe - Path\").position",
  bottomEndPoint: "pos = content(\"Bottom - Orbe\").content(\"Bottom - Orbe - Gradient Fill\").startPoint;\nw = content(\"Bottom - Orbe\").content(\"Bottom - Orbe - Path\").size[0];\n[pos[0] + w/2,pos[1]]",
  topStartPoint: "content(\"Bottom - Orbe\").content(\"Bottom - Orbe - Gradient Fill\").startPoint",
  topEndPoint: "content(\"Bottom - Orbe\").content(\"Bottom - Orbe - Gradient Fill\").endPoint"
};

////////////////////// ----------------- //////////////////////

var MAXORBE_DOME = {
  bottomOpacity: "parent.effect(\"body.rot.x\")(\"Angle\") > 0 ? 0 : 100",
  topOpacity: "main = thisLayer.content(\"Bottom - Dome\").transform.opacity;\nmain == 0 ? 100 : 0"
};
var MAXORBE_BOTTOM_DOME_FRONT = {
  size: "ctrlLayer = parent;\nx = ctrlLayer.effect(\"body.size\")(\"Slider\");\nz = ctrlLayer.effect(\"body.rot.x\")(\"Angle\");\n[x, linear(z, 0, 180, 0, x)]",
  position: "[0,0]"
};
var MAXORBE_BOTTOM_DOME_MAIN_BODY = {
  size: "temp = parent.effect(\"body.size\")(\"Slider\");\n[temp, temp]",
  position: "[0,0]"
};
var MAXORBE_BOTTOM_DOME_MAIN_MASK = {
  size: "temp = parent.effect(\"body.size\")(\"Slider\");\n[temp, temp/2]",
  position: "temp = parent.effect(\"body.size\")(\"Slider\");\n[0, temp/4]"
};
var MAXORBE_DOME_FILL_COLOR = {
  color: "parent.effect(\"body.dome.color\")(\"Color\")",
  opacity: "parent.effect(\"body.dome.opacity\")(\"Slider\")"
};

////////////////////// ----------------- //////////////////////

var MAXORBE_REFLECTION_PATH = {
  size: "thisLayer.content(\"Bottom - Dome\").content(\"Bottom - Dome - Main\").content(\"Bottom - Dome - Main - Body\").size / 1.1",
  position: "[0,0]"
};
var MAXORBE_REFLECTION_TRIM = {
  offset: "ctrlr = parent.transform.rotation;\n-ctrlr + 180"
};

var vectorTransform = {
  group: "ADBE Vector Transform Group",
  "anchor-point": "ADBE Vector Anchor",
  position: "ADBE Vector Position",
  rotation: "ADBE Vector Rotation",
  scale: "ADBE Vector Scale",
  opacity: "ADBE Vector Group Opacity",
  skew: "ADBE Vector Skew",
  "skew-axis": "ADBE Vector Skew Axis"
};
var vectorEllipse = {
  group: "ADBE Vector Shape - Ellipse",
  position: "ADBE Vector Ellipse Position",
  size: "ADBE Vector Ellipse Size"
};
var group = {
  group: "ADBE Vector Group",
  root: "ADBE Root Vectors Group",
  groupContents: "ADBE Vectors Group"
};
var vectorTaper = {
  group: "ADBE Vector Stroke Taper",
  startLength: "ADBE Vector Taper Start Length",
  endLength: "ADBE Vector Taper End Length",
  startWidth: "ADBE Vector Taper Start Width",
  endWidth: "ADBE Vector Taper End Width",
  startEase: "ADBE Vector Taper Start Ease",
  endEase: "ADBE Vector Taper End Ease"
};
var MaxShapeLayerMatchNames = {
  group: group,
  vectorTransform: vectorTransform,
  vectorEllipse: vectorEllipse,
  vectorTaper: vectorTaper
};

var setPropertyValueAndExpression = function setPropertyValueAndExpression(propertyGroup, propertyMatchName, valueOrExpression) {
  var property = propertyGroup.property(propertyMatchName);
  if (valueOrExpression.expression) property.expression = valueOrExpression.expression;
  if (valueOrExpression.value) property.setValue(valueOrExpression.value);
};

var MaxVectorRoot = {
  rootGroup: {},
  "new": function _new(shapeLayer) {
    shapeLayer.threeDLayer = false;
    this.rootGroup = shapeLayer.property(MaxShapeLayerMatchNames.group.root);
    return this;
  },
  build: function build() {
    return this.rootGroup;
  }
};
var MaxVectorGroup = {
  parent: {},
  group: {},
  addTo: function addTo(parent) {
    var isParentRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    this.parent = isParentRoot ? parent : parent.property(MaxShapeLayerMatchNames.group.groupContents);
    return this;
  },
  "new": function _new(name) {
    this.group = this.parent.addProperty(MaxShapeLayerMatchNames.group.group);
    this.group.name = name;
    return this;
  },
  transform: function transform(type, value) {
    var transformGroup = this.group.property(MaxShapeLayerMatchNames.vectorTransform.group);
    var transformProperty = transformGroup.property(MaxShapeLayerMatchNames.vectorTransform[type]);
    if (typeof value === "string") {
      transformProperty.expression = value;
      return this;
    }
    transformProperty.setValue(value);
    return this;
  },
  build: function build() {
    return this.group;
  }
};
var MaxVectorEllipse = {
  parent: {},
  ellipse: {},
  addTo: function addTo(parent) {
    this.parent = parent.property(MaxShapeLayerMatchNames.group.groupContents);
    return this;
  },
  "new": function _new(name) {
    var ellipse = this.parent.addProperty("ADBE Vector Shape - Ellipse");
    ellipse.name = name;
    this.ellipse = ellipse;
    return this;
  },
  size: function size(value) {
    var ellipseSize = this.ellipse.property(MaxShapeLayerMatchNames.vectorEllipse.size);
    if (value.expression) ellipseSize.expression = value.expression;
    if (value.value) ellipseSize.setValue(value.value);
    return this;
  },
  position: function position(value) {
    setPropertyValueAndExpression(this.ellipse, MaxShapeLayerMatchNames.vectorEllipse.position, value);
    return this;
  },
  build: function build() {
    return this.ellipse;
  }
};
var MaxVectorRectangle = {
  parent: {},
  rectangle: {},
  addTo: function addTo(parent) {
    this.parent = parent.property(MaxShapeLayerMatchNames.group.groupContents);
    return this;
  },
  "new": function _new(name) {
    var rectangle = this.parent.addProperty("ADBE Vector Shape - Rect");
    rectangle.name = name;
    this.rectangle = rectangle;
    return this;
  },
  size: function size(value) {
    var rectangleSize = this.rectangle.property("ADBE Vector Rect Size");
    if (typeof value === "string") {
      rectangleSize.expression = value;
      return this;
    }
    rectangleSize.setValue(value);
    return this;
  },
  position: function position(value) {
    var rectangleSize = this.rectangle.property("ADBE Vector Rect Position");
    if (typeof value === "string") {
      rectangleSize.expression = value;
      return this;
    }
    rectangleSize.setValue(value);
    return this;
  },
  roundness: function roundness(value) {
    var rectangleRoundness = this.rectangle.property("ADBE Vector Rect Roundness");
    if (typeof value === "string") {
      rectangleRoundness.expression = value;
      return this;
    }
    rectangleRoundness.setValue(value);
    return this;
  },
  build: function build() {
    return this.rectangle;
  }
};
var MaxVectorFill = {
  parent: {},
  group: {},
  addTo: function addTo(parent) {
    this.parent = parent.property(MaxShapeLayerMatchNames.group.groupContents);
    return this;
  },
  "new": function _new(name) {
    this.group = this.parent.addProperty("ADBE Vector Graphic - Fill");
    if (name) this.group.name = name;
    return this;
  },
  color: function color(_color) {
    var fillColor = this.group.property("ADBE Vector Fill Color");
    if (typeof _color === "string") {
      fillColor.expression = _color;
      return this;
    }
    fillColor.setValue(_color);
    return this;
  },
  opacity: function opacity(_opacity) {
    var fillOpacity = this.group.property("ADBE Vector Fill Opacity");
    if (typeof _opacity === "string") {
      fillOpacity.expression = _opacity;
      return this;
    }
    fillOpacity.setValue(_opacity);
    return this;
  },
  build: function build() {
    return this.group;
  }
};
var MaxVectorStroke = {
  parent: {},
  group: {},
  addTo: function addTo(parent) {
    this.parent = parent.property(MaxShapeLayerMatchNames.group.groupContents);
    return this;
  },
  "new": function _new(name) {
    this.group = this.parent.addProperty("ADBE Vector Graphic - Stroke");
    if (name) this.group.name = name;
    return this;
  },
  color: function color(_color2) {
    var strokeColor = this.group.property("ADBE Vector Stroke Color");
    if (typeof _color2 === "string") {
      strokeColor.expression = _color2;
      return this;
    }
    strokeColor.setValue(_color2);
    return this;
  },
  width: function width(_width) {
    var strokeWidth = this.group.property("ADBE Vector Stroke Width");
    if (typeof _width === "string") {
      strokeWidth.expression = _width;
      return this;
    }
    strokeWidth.setValue(_width);
    return this;
  },
  cap: function cap(type) {
    var caps = {
      butt: 1,
      round: 2,
      projecting: 3
    };
    var strokeCap = this.group.property("ADBE Vector Stroke Line Cap");
    strokeCap.setValue(caps[type]);
    return this;
  },
  join: function join(type) {
    var joins = {
      miter: 1,
      round: 2,
      bevel: 3
    };
    var strokeJoin = this.group.property("ADBE Vector Stroke Line Join");
    strokeJoin.setValue(joins[type]);
    return this;
  },
  taper: function taper(startLength, endLength, startWidth, endWidth, startEase, endEase) {
    var strokeTaper = this.group.property(MaxShapeLayerMatchNames.vectorTaper.group);
    if (startLength !== undefined) {
      setPropertyValueAndExpression(strokeTaper, MaxShapeLayerMatchNames.vectorTaper.startLength, startLength);
    }
    if (endLength !== undefined) {
      setPropertyValueAndExpression(strokeTaper, MaxShapeLayerMatchNames.vectorTaper.endLength, endLength);
    }
    if (startWidth !== undefined) {
      setPropertyValueAndExpression(strokeTaper, MaxShapeLayerMatchNames.vectorTaper.startWidth, startWidth);
    }
    if (endWidth !== undefined) {
      setPropertyValueAndExpression(strokeTaper, MaxShapeLayerMatchNames.vectorTaper.endWidth, endWidth);
    }
    if (startEase !== undefined) {
      setPropertyValueAndExpression(strokeTaper, MaxShapeLayerMatchNames.vectorTaper.startEase, startEase);
    }
    if (endEase !== undefined) {
      setPropertyValueAndExpression(strokeTaper, MaxShapeLayerMatchNames.vectorTaper.endEase, endEase);
    }
    return this;
  },
  //todo: taper() & dashes()

  build: function build() {
    return this.group;
  }
};
var MaxVectorGradientFill = {
  parent: {},
  group: {},
  addTo: function addTo(parent) {
    this.parent = parent.property(MaxShapeLayerMatchNames.group.groupContents);
    return this;
  },
  "new": function _new(name) {
    this.group = this.parent.addProperty("ADBE Vector Graphic - G-Fill");
    if (name) this.group.name = name;
    return this;
  },
  type: function type(_type) {
    var gradType = this.group.property("ADBE Vector Grad Type");
    var gradTypes = {
      linear: 1,
      radial: 2
    };
    gradType.setValue(gradTypes[_type]);
    return this;
  },
  startPoint: function startPoint(_startPoint) {
    var startPt = this.group.property("ADBE Vector Grad Start Pt");
    if (typeof _startPoint === "string") {
      startPt.expression = _startPoint;
      return this;
    }
    startPt.setValue(_startPoint);
    return this;
  },
  endPoint: function endPoint(_endPoint) {
    var endPt = this.group.property("ADBE Vector Grad End Pt");
    if (typeof _endPoint === "string") {
      endPt.expression = _endPoint;
      return this;
    }
    endPt.setValue(_endPoint);
    return this;
  },
  highlight: function highlight(length, angle) {
    var highlightLength = this.group.property("ADBE Vector Grad HiLite Length");
    highlightLength.setValue(length);
    var highlightAngle = this.group.property("ADBE Vector Grad HiLite Angle");
    highlightAngle.setValue(angle);
    return this;
  },
  build: function build() {
    return this.group;
  }
};
var MaxVectorMergePath = {
  parent: {},
  group: {},
  addTo: function addTo(parent) {
    this.parent = parent.property(MaxShapeLayerMatchNames.group.groupContents);
    return this;
  },
  "new": function _new(name) {
    this.group = this.parent.addProperty("ADBE Vector Filter - Merge");
    if (name) this.group.name = name;
    return this;
  },
  mode: function mode(_mode) {
    var mergePathMode = this.group.property("ADBE Vector Merge Type");
    var modes = {
      merge: 1,
      add: 2,
      subtract: 3,
      intersect: 4,
      "exclude-intersections": 5
    };
    mergePathMode.setValue(modes[_mode]);
    return this;
  },
  build: function build() {
    return this.group;
  }
};
var MaxVectorTrimPath = {
  parent: {},
  group: {},
  addTo: function addTo(parent) {
    this.parent = parent.property(MaxShapeLayerMatchNames.group.groupContents);
    return this;
  },
  "new": function _new(name) {
    this.group = this.parent.addProperty("ADBE Vector Filter - Trim");
    if (name) this.group.name = name;
    return this;
  },
  start: function start(percentage) {
    var startGroup = this.group.property("ADBE Vector Trim Start");
    if (typeof percentage === "string") {
      startGroup.expression = percentage;
      return this;
    }
    startGroup.setValue(percentage);
    return this;
  },
  end: function end(percentage) {
    var endGroup = this.group.property("ADBE Vector Trim End");
    if (typeof percentage === "string") {
      endGroup.expression = percentage;
      return this;
    }
    endGroup.setValue(percentage);
    return this;
  },
  offset: function offset(_offset) {
    var offsetGroup = this.group.property("ADBE Vector Trim Offset");
    if (typeof _offset === "string") {
      offsetGroup.expression = _offset;
      return this;
    }
    offsetGroup.setValue(_offset);
    return this;
  },
  type: function type(_type2) {
    var typeGroup = this.group.property("ADBE Vector Trim Type");
    var types = {
      simultaneously: 1,
      individually: 2
    };
    typeGroup.setValue(types[_type2]);
    return this;
  },
  build: function build() {
    return this.group;
  }
};

var makeReflectionGroup = function makeReflectionGroup(root) {
  var reflectionGroup = MaxVectorGroup.addTo(root, true)["new"]("Reflection").build();
  MaxVectorEllipse.addTo(reflectionGroup)["new"]("Reflection - Path").size({
    expression: MAXORBE_REFLECTION_PATH.size
  }).position({
    expression: MAXORBE_REFLECTION_PATH.position
  });
  MaxVectorTrimPath.addTo(reflectionGroup)["new"]("Reflection - TrimPath").start(40).end(60).offset(MAXORBE_REFLECTION_TRIM.offset);
  MaxVectorStroke.addTo(reflectionGroup)["new"]("Reflection - Stroke").width(40).color([1, 1, 1, 1]).cap("round").taper({
    value: 100
  }, {
    value: 100
  }, {
    value: 10
  }, {
    value: 10
  });
};

var makeDomeGroup = function makeDomeGroup(root) {
  var isBottom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var body = MaxVectorGroup.addTo(root, true)["new"](isBottom ? "Bottom - Dome" : "Top - Dome").transform("opacity", isBottom ? MAXORBE_DOME.bottomOpacity : MAXORBE_DOME.topOpacity).build();
  MaxVectorEllipse.addTo(body)["new"]("Bottom - Dome - Front").size({
    expression: MAXORBE_BOTTOM_DOME_FRONT.size
  }).position({
    expression: MAXORBE_BOTTOM_DOME_FRONT.position
  });
  var main = MaxVectorGroup.addTo(body)["new"]("Bottom - Dome - Main").build();
  MaxVectorEllipse.addTo(main)["new"]("Bottom - Dome - Main - Body").size({
    expression: MAXORBE_BOTTOM_DOME_MAIN_BODY.size
  }).position({
    expression: MAXORBE_BOTTOM_DOME_MAIN_BODY.position
  });
  MaxVectorRectangle.addTo(main)["new"]("Bottom - Dome - Main - Mask").size(MAXORBE_BOTTOM_DOME_MAIN_MASK.size).position(MAXORBE_BOTTOM_DOME_MAIN_MASK.position);
  MaxVectorMergePath.addTo(main)["new"]("Bottom - Dome - Main - Merge Paths").mode("subtract");
  MaxVectorMergePath.addTo(body)["new"]("Bottom - Dome - Merge Paths").mode("add");
  MaxVectorFill.addTo(body)["new"]("Bottom - Dome - Fill").color(MAXORBE_DOME_FILL_COLOR.color).opacity(MAXORBE_DOME_FILL_COLOR.opacity);
};

var makeOrbeGroup = function makeOrbeGroup(root) {
  var isBottom = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var orbeGroup = MaxVectorGroup.addTo(root, true)["new"](isBottom ? "Bottom - Orbe" : "Top - Orbe").transform("opacity", isBottom ? MAXORBE_ORBE.bottomOpacity : MAXORBE_ORBE.topOpacity).build();
  MaxVectorEllipse.addTo(orbeGroup)["new"](isBottom ? "Bottom - Orbe - Path" : "Top - Orbe - Path").size({
    expression: isBottom ? MAXORBE_ORBE_PATH.bottomSize : MAXORBE_ORBE_PATH.topSize
  }).position({
    expression: isBottom ? MAXORBE_ORBE_PATH.bottomPosition : MAXORBE_ORBE_PATH.topPosition,
    value: [0, -82]
  });
  MaxVectorGradientFill.addTo(orbeGroup)["new"](isBottom ? "Bottom - Orbe - Gradient Fill" : "Top - Orbe - Gradient Fill").startPoint(isBottom ? MAXORBE_ORBE_GRADIENT_FILL.bottomStartPoint : MAXORBE_ORBE_GRADIENT_FILL.topStartPoint).endPoint(isBottom ? MAXORBE_ORBE_GRADIENT_FILL.bottomEndPoint : MAXORBE_ORBE_GRADIENT_FILL.topEndPoint).type("radial");
};

var makeBottomBodyGroup = function makeBottomBodyGroup(root) {
  var body = MaxVectorGroup.addTo(root, true)["new"]("Bottom - Body").build();
  buildTop(body);
  buildBottom(body);
  MaxVectorStroke.addTo(body)["new"]("Body - Stroke").color(MAXORBE_BOTTOM_BODY_STROKE.color).width(MAXORBE_BOTTOM_BODY_STROKE.width).cap("round").join("round").build();
};
var buildBottom = function buildBottom(parent) {
  var bodyBottom = MaxVectorGroup.addTo(parent)["new"]("Body - Bottom").build();
  MaxVectorEllipse.addTo(bodyBottom)["new"]("Body - Bottom - Back").size({
    expression: MAXORBE_BODY_BOTTOM_BACK.size
  }).position({
    expression: MAXORBE_BODY_BOTTOM_BACK.position
  });
  var main = MaxVectorGroup.addTo(bodyBottom)["new"]("Body - Bottom - Main").build();
  MaxVectorEllipse.addTo(main)["new"]("Body - Bottom - Body").size({
    expression: MAXORBE_BODY_BOTTOM_MAIN_BODY.size
  }).position({
    expression: MAXORBE_BODY_BOTTOM_MAIN_BODY.position
  });
  MaxVectorRectangle.addTo(main)["new"]("Body - Bottom - Body - Mask").size(MAXORBE_BODY_BOTTOM_MAIN_BODY_MASK.size).position(MAXORBE_BODY_BOTTOM_MAIN_BODY_MASK.position);
  MaxVectorMergePath.addTo(main)["new"]("Body - Bottom - Body - Merge").mode("subtract");
  MaxVectorMergePath.addTo(bodyBottom)["new"]("Body - Bottom - Merge").mode("add");
  MaxVectorGradientFill.addTo(bodyBottom)["new"]("Body - Bottom - GradientFill").type("radial").startPoint([0, 0]).endPoint(MAXORBE_BODY_BOTTOM_MAIN_BODY.gradientEndPoint).highlight(26, 51);
};
var buildTop = function buildTop(parent) {
  var bodyTop = MaxVectorGroup.addTo(parent)["new"]("Body - Top").transform("opacity", MAXORBE_BOTTOM_BODY_TOP.opacity).build();
  MaxVectorEllipse.addTo(bodyTop)["new"]("Body - Top - Hole").size({
    expression: MAXORBE_BOTTOM_BODY_TOP_HOLE.size
  }).position({
    expression: MAXORBE_BOTTOM_BODY_TOP_HOLE.position
  });
  MaxVectorFill.addTo(bodyTop)["new"]("Body - Top - Hole - Fill").color(MAXORBE_BOTTOM_BODY_TOP_HOLE.fillColor);
  MaxVectorEllipse.addTo(bodyTop)["new"]("Body - Top - Main").size({
    expression: MAXORBE_BOTTOM_BODY_TOP_MAIN.size
  }).position({
    expression: MAXORBE_BOTTOM_BODY_TOP_MAIN.position
  });
  MaxVectorFill.addTo(bodyTop)["new"]("Body - Top - Main - Fill").color(MAXORBE_BOTTOM_BODY_TOP_MAIN.color);
  MaxVectorStroke.addTo(bodyTop)["new"]("Body - Top - Main - Stroke").color(MAXORBE_BOTTOM_BODY_TOP_MAIN.color).width(MAXORBE_BOTTOM_BODY_TOP_MAIN.strokeWidth).cap("round").join("round");
};

var makeMaxOrbeShapeLayer = function makeMaxOrbeShapeLayer(controller, comp) {
  var maxOrbe = MaxLayer["new"]("ShapeLayer", comp, "MaxOrbe").parentTo(controller).transform("position", [0, 0]).transform("anchorPoint", MAXORBE_LAYER.anchorPoint).build();
  var rootGroup = MaxVectorRoot["new"](maxOrbe).build();
  makeReflectionGroup(rootGroup);
  makeDomeGroup(rootGroup, false);
  makeOrbeGroup(rootGroup, false);
  makeBottomBodyGroup(rootGroup);
  makeDomeGroup(rootGroup);
  makeOrbeGroup(rootGroup);
};

var createMaxOrbe = function createMaxOrbe() {
  var _ref;
  var comp = (_ref = app.project.activeItem) !== null && _ref !== void 0 ? _ref : undefined;
  if (!comp) {
    alert("Please select a composition");
    return;
  }
  // const controller = comp.layer("[CTRL] - MaxOrbe") as Layer;

  var controller = makeController(comp);
  makeMaxOrbeShapeLayer(controller, comp);
};

var aeft = /*#__PURE__*/__objectFreeze({
  __proto__: null,
  createMaxOrbe: createMaxOrbe
});

var host = typeof $ !== "undefined" ? $ : window;

// A safe way to get the app name since some versions of Adobe Apps broken BridgeTalk in various places (e.g. After Effects 24-25)
// in that case we have to do various checks per app to deterimine the app name

var getAppNameSafely = function getAppNameSafely() {
  var compare = function compare(a, b) {
    return a.toLowerCase().indexOf(b.toLowerCase()) > -1;
  };
  var exists = function exists(a) {
    return typeof a !== "undefined";
  };
  var isBridgeTalkWorking = typeof BridgeTalk !== "undefined" && typeof BridgeTalk.appName !== "undefined";
  if (isBridgeTalkWorking) {
    return BridgeTalk.appName;
  } else if (app) {
    
    if (exists(app.name)) {
      
      var name = app.name;
      if (compare(name, "photoshop")) return "photoshop";
      if (compare(name, "illustrator")) return "illustrator";
      if (compare(name, "audition")) return "audition";
      if (compare(name, "bridge")) return "bridge";
      if (compare(name, "indesign")) return "indesign";
    }
    
    if (exists(app.appName)) {
      
      var appName = app.appName;
      if (compare(appName, "after effects")) return "aftereffects";
      if (compare(appName, "animate")) return "animate";
    }
    
    if (exists(app.path)) {
      
      var path = app.path;
      if (compare(path, "premiere")) return "premierepro";
    }
    
    if (exists(app.getEncoderHost) && exists(AMEFrontendEvent)) {
      return "ame";
    }
  }
  return "unknown";
};
switch (getAppNameSafely()) {
  case "aftereffects":
  case "aftereffectsbeta":
    host[ns] = aeft;
    break;
}

// https://extendscript.docsforadobe.dev/interapplication-communication/bridgetalk-class.html?highlight=bridgetalk#appname
})(this);//# sourceMappingURL=index.js.map
