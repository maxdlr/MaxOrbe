﻿/**
 * After Effects layer methods
 * @namespace
 * @category DuAEF
 */
var DuAELayer = {};

DuAELayer.Type = {
  NONE: "-", // ✕
  NULL: "N",
  SOLID: "S",
  ADJUSTMENT: "FX",
};

// Lists all special character prefixes
// needed to fix expressions
DuAELayer.specialPrefixes = ["❌", "⬛", "⚒", "☍", "⚲", "✋", "⛒", "✜", "☉"];

/**
 * Checks if a string is one of the prefixes used to identify layer types in their names
 * @param {string} prefix The string to check
 * @return {bool} True if the string is one of the predefined prefixes.
 */
DuAELayer.isTypePrefix = function (prefix) {
  for (i in DuAELayer.Type) {
    if (prefix == DuAELayer.Type[i]) return true;
  }
  return false;
};

/**
 * Checks if the layer is one of the types created by duaef.
 * @param {Layer} layer - The layer to check
 * @param {Duik.Layer.Type} layerType - The type of layer
 * @return {Boolean}
 */
DuAELayer.isType = function (layer, layerType) {
  return DuAELayer.type(layer) == layerType;
};

/**
 * Gets the type of the layer
 * @param {Layer} [layer] The layer. If omitted, will check the first selected bone of the current comp
 * @returns {Duik.Layer.Type} The type
 */
DuAELayer.type = function (layer) {
  layer = def(layer, DuAEComp.getActiveLayer());
  if (!layer) return DuAELayer.Type.NONE;
  var type = DuAETag.getValue(
    layer,
    DuAETag.Key.LAYER_TYPE,
    DuAETag.Type.STRING,
  );
  if (type == null) return DuAELayer.Type.NONE;
  if (type == "") return DuAELayer.Type.NONE;
  return type;
};

/**
 * Sets the type of the layer
 * @param {Duik.Layer.Type} type The type
 * @param {Layer[]|LayerCollection|DuList.<Layer>|Layer} [layers=DuAEComp.getSelectedLayers()] The layer. If omitted, will use all selected layers in the comp
 */
DuAELayer.setType = function (type, layers) {
  layers = def(layers, DuAEComp.getSelectedLayers());
  layers = new DuList(layers);
  if (layers.length() == 0) return;

  for (var i = 0, n = layers.length(); i < n; i++) {
    var layer = layers.at(i);

    DuAETag.setValue(layer, DuAETag.Key.LAYER_TYPE, type);

    // Reset
    layer.guideLayer = false;
    layer.label = 8;
    layer.quality = LayerQuality.BEST;

    if (type == DuAELayer.Type.NULL) {
      layer.guideLayer = true;
      layer.label = 1;
    } else if (type == DuAELayer.Type.SOLID) {
      layer.label = 1;
    } else if (type == DuAELayer.Type.ADJUSTMENT) {
      layer.label = 5;
    }
  }
};

/**
 * Renames a layer, appending a number if needed to keep unique names, and fixing expressions
 * @param {Layer} layer
 * @param {string} newName
 * @return {string} The new name which may be different than <code>newName</code> in case the layer has been numbered.
 */
DuAELayer.rename = function (layer, newName) {
  var oldName = layer.name;

  layer.name = "** Duik Temp Name **";
  layer.name = DuAEComp.newUniqueLayerName(newName, layer.containingComp);
  newName = layer.name;

  // First try with AE's method which is faster.
  app.project.autoFixExpressions(oldName, newName);
  // Then our own because of AE bugs.
  // DEACTIVATED: it's too long. Needs a way to speed up this method
  //if (DuString.contains(newName, DuAELayer.specialPrefixes))
  //    DuAEProject.autoFixExpressions(oldName, newName);

  return newName;
};

/**
 * Runs a function on all the layers
 * @param {function} method - The function to run on the layers, which takes a layer as its only argument.
 * @param {string} [undoGroupName] - The name of the undoGroup created before the execution. If not provided, there will not be any undoGroup created.
 */
DuAELayer.doLayers = function (layers, method, undoGroupName) {
  undoGroupName = def(undoGroupName, "");
  // run
  if (undoGroupName != "") DuAE.beginUndoGroup(undoGroupName);
  new DuList(layers).do(method);
  if (undoGroupName != "") DuAE.endUndoGroup();
};

/**
 * Generates a new unique name for an effect
 * @param {string} newName	- The wanted new name
 * @param {Layer} layer 	- The layer
 * @param {boolean} [increment=true] - true to automatically increment the new name if it already ends with a digit
 * @return {string}	The unique name, with a new number at the end if needed.
 */
DuAELayer.newUniqueEffectName = function (newName, layer, increment) {
  if (!layer) {
    DuDebug.throwUndefinedError("layer", "DuAELayer.newUniqueEffectName");
    return;
  }
  if (!isdef(newName)) {
    DuDebug.throwUndefinedError("newName", "DuAELayer.newUniqueEffectName");
    return;
  }
  increment = def(increment, true);
  if (newName == "") return "";
  var effectNames = [];
  for (var i = 1, numP = layer.effect.numProperties; i <= numP; i++) {
    effectNames.push(layer.effect(i).name);
  }
  return DuString.generateUnique(newName, effectNames, increment);
};

/**
 * Generates a new unique name for a marker for this layer
 * @param {string} newName	- The wanted new name
 * @param {Layer} layer 	- The layer
 * @param {boolean} [increment=true] - true to automatically increment the new name if it already ends with a digit
 * @return {string}	The unique name, with a new number at the end if needed.
 */
DuAELayer.newUniqueMarkerName = function (newName, layer, increment) {
  increment = def(increment, true);
  var markerNames = [];
  for (var i = 1, num = layer.property("ADBE Marker").numKeys; i <= num; i++) {
    markerNames.push(layer.property("ADBE Marker").keyValue(i).comment);
  }
  return DuString.generateUnique(newName, markerNames, increment);
};

/**
 * Gets the After Effects selected properties in the layer
 * @param {Layer}	layer	- The layer
 * @param {PropertyType|PropertyValueType|string|function}	 [filter]	- A filter to get only a certain type, or value type, or property name or matchName.<br />
 * A function which take one PropertyBase as argument can be used to filter the properties: the Property will be returned if the function returns true.
 * @param {boolean}	[strict=false]	- If a string filter is provided, whether to search for the exact name/matchName or if it contains the filter.
 * @param {boolean}	[caseSensitive=true]	- If a string filter is provided, and not strict is false, does the search have to be case sensitive?
 * @return {DuAEProperty[]} The selected properties, an empty Array if nothing active or selected
 */
DuAELayer.getSelectedProps = function (layer, filter, strict, caseSensitive) {
  strict = def(strict, false);
  caseSensitive = def(caseSensitive, true);

  var props = [];

  if (!caseSensitive && typeof filter === "string")
    filter = filter.toLowerCase();

  var selectedProps = layer.selectedProperties;
  if (!isdef(filter)) {
    props = props.concat(selectedProps);
  } else {
    for (var j = 0, numP = selectedProps.length; j < numP; j++) {
      var prop = selectedProps[j];

      var name = prop.name;
      var matchName = prop.matchName;
      if (!caseSensitive) {
        name = name.toLowerCase();
        matchName = matchName.toLowerCase();
      }

      if (strict && name === filter) {
        props.push(prop);
      } else if (strict && matchName === filter) {
        props.push(prop);
      } else if (typeof filter === "string") {
        if (name.indexOf(filter) >= 0) props.push(prop);
        else if (matchName.indexOf(filter) >= 0) props.push(prop);
      } else if (prop.propertyType == PropertyType.PROPERTY) {
        if (prop.propertyValueType == filter) props.push(prop);
      } else if (props.length == 0 && filter == PropertyValueType.SHAPE) {
        if (matchName == "ADBE Mask Atom")
          props.push(prop.property("ADBE Mask Shape"));
        else if (matchName == "ADBE Vector Shape - Group")
          props.push(prop.property("ADBE Vector Shape"));
      } else if (prop.propertyType == filter) {
        props.push(prop);
      } else if (typeof filter === "function") {
        if (filter(prop)) props.push(prop);
      }
    }
  }
  return DuAE.getDuAEProperty(props);
};

/**
 * Gets the After Effects active property (the last selected one)
 * @param {Layer}	layer	- The layer
 * @return {DuAEProperty|null} The selected property, or null if there isn't any.
 */
DuAELayer.getActiveProperty = function (layer) {
  var selectedProps = layer.selectedProperties;
  if (selectedProps.length == 0) return null;
  var p = selectedProps[selectedProps.length - 1];
  return new DuAEProperty(p);
};

/**
 * Gets all animations on the layer in the whole timeline or in the time range<br />
 * The first DuAEKeyframe._time will be adjusted relatively to the start of the time range (if provided) instead of the startTime of the composition.
 * @param {Layer}	layer	- The layer.
 * @param {Boolean}	[selected=false]	- true to get only selected keyframes.
 * @param {float[]}	[timeRange]	- The time range, an array of two time values, in seconds.
 * @return {DuAELayerAnimation}	The animation.
 */
DuAELayer.getAnim = function (layer, selected, timeRange) {
  var anim = new DuAELayerAnimation();
  anim._name = layer.name;
  anim._index = layer.index;
  anim.anims = [];
  for (var propIndex = 1; propIndex <= layer.numProperties; propIndex++) {
    var prop = layer.property(propIndex);
    if (prop.matchName == "ADBE Marker") continue;

    prop = new DuAEProperty(prop);
    var subAnim = prop.animation(selected, timeRange);
    if (subAnim != null) {
      if (anim.startTime == null) anim.startTime = subAnim.startTime;
      else if (anim.startTime > subAnim.startTime)
        anim.startTime = subAnim.startTime;
      if (anim.endTime == null) anim.endTime = subAnim.endTime;
      else if (anim.endTime > subAnim.endTime)
        anim.endTime = subAnim.endTimeendTime;
      anim.anims.push(subAnim);
    }
  }
  return anim;
};

/**
 * Gets all animations on the layers in the whole timeline or in the time range<br />
 * The first DuAEKeyframe._time will be adjusted relatively to the start of the time range (if provided) instead of the startTime of the composition.
 * @param {Layer[]|LayerCollection}	layers	- The layers.
 * @param {Boolean}	[selected=false]	- true to get only selected keyframes.
 * @param {float[]}	[timeRange]	- The time range, an array of two time values, in seconds.
 * @return {DuAELayerAnimation[]}	The animations.
 */
DuAELayer.getAnims = function (layers, selected, timeRange) {
  var anims = [];
  new DuList(layers).do(function (layer) {
    anims.push(DuAELayer.getAnim(layer, selected, timeRange));
  });
  return anims;
};

/**
 * Sets the property animation on the property
 * @param {Layer}	layer	- The layer.
 * @param {DuAELayerAnimation} anims	- The animation
 * @param {float}	[time=comp.time]	- The time where to begin the animation
 * @param {Boolean}	[ignoreName=false]	- true to set the anim even if name of the property do not match the name of the animation.<br />
 * This way, only the type of property (i.e. matchName) is checked.
 * @param {Boolean}	[setExpression=false]	- Set the expression on the property
 * @param {Boolean}	[onlyKeyframes=true]	- If false, the value of properties without keyframes will be set too.
 * @param {Boolean}	[replace=false]	- true to remove any existing keyframe on the properties before adding new keyframes
 * @param {string[]}	[propertyWhiteList]	- A list of matchNames used as a white list for properties to set anims.<br />
 * Can be the matchName of a propertyGroup to set all the subproperties.
 * @param {Boolean}	[offset=false]	- true to offset the current value, instead of replacing it
 * @param {Boolean}	[reverse=false]	- true to reverse the keyframes (in time)
 * @param {Boolean} [dontMoveAncestors=false] - When set to true, the transform (position, rotation) values for ancestor layers (the ones without parent) will be offset to 0 before applying the animation.
 * @return {Boolean} true if the anim was actually set.
 */
DuAELayer.setAnim = function (
  layer,
  anim,
  time,
  ignoreName,
  setExpression,
  onlyKeyframes,
  replace,
  whiteList,
  offset,
  reverse,
  dontMoveAncestors,
) {
  time = def(time, layer.containingComp.time);
  ignoreName = def(ignoreName, false);
  setExpression = def(setExpression, false);
  onlyKeyframes = def(onlyKeyframes, false);
  replace = def(replace, false);
  offset = def(offset, false);
  dontMoveAncestors = def(dontMoveAncestors, false);

  if (reverse) DuAELayer.reverseAnims(anim);

  var offsetTransform = false;
  if (dontMoveAncestors && layer.parent == null) offsetTransform = true;

  for (var i = 0; i < anim.anims.length; i++) {
    var subAnim = anim.anims[i];
    for (var propIndex = 1; propIndex <= layer.numProperties; propIndex++) {
      var subProp = layer.property(propIndex);
      if (subProp == null) continue;
      if (
        subProp.matchName == subAnim._matchName &&
        subProp.matchName != "ADBE Marker"
      ) {
        subProp = new DuAEProperty(subProp);
        var ok = subProp.setAnimation(
          subAnim,
          time,
          ignoreName,
          setExpression,
          onlyKeyframes,
          replace,
          whiteList,
          offset,
          reverse,
          offsetTransform,
        );
        if (ok) break;
      }
    }
  }
};

/**
 * Sets the animations on the layers.<br />
 * If you need to set only on the same layers (same index, same name), use {@link DuAELayer.setAnims}.
 * @param {Layer[]|LayerCollection}	layers	- The layers.<br />
 * If there are more layers than animations, the layers array will be truncated.
 * @param {DuAELayerAnimation[]} anims	- The layer animations.<br />
 * If there are more animations than layers, the animations array will be truncated.
 * @param {float}	[time=comp.time]	- The time where to begin the animation
 * @param {Boolean}	[ignoreName=false]	- true to set the anim even if name of the property do not match the name animation.<br />
 * This way, only the type of property (i.e. matchName) is checked.
 * @param {Boolean}	[setExpression=false]	- Set the expression on the property
 * @param {Boolean}	[onlyKeyframes=true]	- If false, the value of properties without keyframes will be set too.
 * @param {Boolean}	[replace=false]	- true to remove any existing keyframe on the properties before adding new keyframes
 * @param {string[]}	[whiteList]	- A list of matchNames used as a white list for properties to set anims.<br />
 * Can be the matchName of a propertyGroup to set all the subproperties.
 * @param {Boolean}	[offset=false]	- true to offset the current value, instead of replacing it
 * @param {Boolean}	[reverse=false]	- true to reverse the keyframes (in time)<br />
 * Note: the remaining animations which are returned will already be reversed, do not set this to true again if you plan to set them later.
 */
DuAELayer.setAllAnims = function (
  layers,
  anims,
  time,
  ignoreName,
  setExpression,
  onlyKeyframes,
  replace,
  whiteList,
  offset,
  reverse,
) {
  layers = new DuList(layers);
  var num = anims.length;
  if (num > layers.length()) num = layers.length();

  if (reverse) DuAELayer.reverseAnims(anims);

  layers.do(function (layer) {
    if (layer)
      DuAELayer.setAnim(
        layer,
        anims[layers.current],
        time,
        ignoreName,
        setExpression,
        onlyKeyframes,
        replace,
        whiteList,
        offset,
        false,
      );
  });
};

/**
 * Sets the animations on the corresponding layers.<br />
 * The animation will be set only on layers with the same name and index.<br />
 * To set all animations on all layers, not checking their names or indices, use {@link DuAELayer.setAllAnims}.
 * @param {Layer[]|LayerCollection}	layers	- The layers.
 * @param {DuAELayerAnimation[]} anims	- The layer animations
 * @param {Number}	[time=comp.time]	- The time where to begin the animation
 * @param {Boolean}	[ignoreName=false]	- true to set the anim even if name of the property do not match the name animation.<br />
 * This way, only the type of property (i.e. matchName) is checked.
 * @param {Boolean}	[setExpression=false]	- Set the expression on the property
 * @param {Boolean}	[onlyKeyframes=true]	- If false, the value of properties without keyframes will be set too.
 * @param {Boolean}	[replace=false]	- true to remove any existing keyframe on the properties before adding new keyframes
 * @param {string[]}	[whiteList]	- A list of matchNames used as a white list for properties to set anims.<br />
 * Can be the matchName of a propertyGroup to set all the subproperties.
 * @param {Boolean}	[offset=false]	- true to offset the current value, instead of replacing it
 * @param {Boolean}	[reverse=false]	- true to reverse the keyframes (in time)<br />
 * Note: the remaining animations which are returned will already be reversed, do not set this to true again if you plan to set them later.
 * @param {Boolean} [dontMoveAncestors=false] - When set to true, the transform (position, rotation) values for ancestor layers (the ones without parent) will be offset to 0 before applying the animation.
 * @return {DuAELayerAnimation[]} The animations which were not set (no corresponding layers)
 */
DuAELayer.setAnims = function (
  layers,
  anims,
  time,
  ignoreName,
  setExpression,
  onlyKeyframes,
  replace,
  whiteList,
  offset,
  reverse,
  dontMoveAncestors,
) {
  dontMoveAncestors = def(dontMoveAncestors, false);

  //clone the array
  var remaining = anims.slice();

  if (reverse) DuAELayer.reverseAnims(anims);

  //for each layeranim, search for the layer and apply anim
  for (var i = remaining.length - 1; i >= 0; i--) {
    var anim = remaining[i];
    var it = new DuList(layers);
    var ok = false;
    while ((layer = it.next())) {
      if (
        layer.name.toLowerCase() == anim._name.toLowerCase() &&
        layer.index == anim._index
      ) {
        DuAELayer.setAnim(
          layer,
          anim,
          time,
          ignoreName,
          setExpression,
          onlyKeyframes,
          replace,
          whiteList,
          offset,
          false,
          dontMoveAncestors,
        );
        ok = true;
        break;
      }
    }
    if (ok) remaining.splice(i, 1);
  }

  return remaining;
};

/**
 * Reverses the times of the keyframes to reverse the animation
 * @param {DuAELayerAnimation[]|DuAELayerAnimation} anims The animation
 */
DuAELayer.reverseAnims = function (anims) {
  var it = new DuList(anims);

  //get times
  var startTime = null;
  var endTime = null;

  it.do(function (anim) {
    if (startTime == null && typeof anim.startTime !== "undefined")
      startTime = anim.startTime;
    else if (startTime > anim.startTime) startTime = anim.startTime;
    if (endTime == null && typeof anim.endTime !== "undefined")
      endTime = anim.endTime;
    else if (endTime < anim.endTime) endTime = anim.endTime;
  });

  if (startTime === null) startTime = 0;
  if (endTime === null) endTime = 0;

  var duration = endTime - startTime;
  if (duration == 0) return;

  //recursive function to reverse keyframes in anim
  function reverse(anim) {
    if (anim.type == "anim") {
      //reverse the array
      anim.keys = anim.keys.reverse();
      //set the new times and reverse influences
      for (var i = 0, num = anim.keys.length; i < num; i++) {
        var ratio = 1 - (anim.keys[i]._time - startTime) / duration;
        anim.keys[i]._time = ratio * duration + startTime;
        anim.keys[i].reverse();
      }
      //reverse start and endvalues
      var sV = anim.endValue;
      anim.endValue = anim.startValue;
      anim.startValue = sV;
    } else if (anim.anims) {
      for (var i = 0, num = anim.anims.length; i < num; i++) {
        reverse(anim.anims[i]);
      }
    }
  }

  //reverse keyframes and times
  it.do(reverse);
};

/**
 * Gets the children of a layer
 * @param {Layer}	layer	- The layer.
 * @return {Layer[]} All the children of the layer
 */
DuAELayer.getChildren = function (layer) {
  var comp = layer.containingComp;
  var children = [];
  for (var i = 1, numL = comp.layers.length; i <= numL; i++) {
    var l = comp.layer(i);
    if (l.index == layer.index) continue;
    if (l.parent == null) continue;
    if (l.parent.index == layer.index) children.push(l);
  }
  return children;
};

/**
 * Checks if a layer has at least one child.
 * @param {Layer} layer The layer to test
 * @returns {Boolean} true if the layer has at least one child.
 */
DuAELayer.hasChild = function (layer) {
  var comp = layer.containingComp;
  for (var i = 1, numL = comp.layers.length; i <= numL; i++) {
    var l = comp.layer(i);
    if (l.index == layer.index) continue;
    if (l.parent == null) continue;
    if (l.parent.index == layer.index) return true;
  }
  return false;
};

/**
 * Checks if a layer is a descendant of another layer
 * @param {Layer} layer1 - The first layer
 * @param {Layer} layer2 - The second layer
 * @return {int|null} the degree of relation. 0 if layer1 is not a relative of layer2,<br />
 * negative if layer2 is a descendant of layer1, positive if layer2 is an ancestor.<br />
 * null if the two layers are not in the same composition or if they are the same layer.
 */
DuAELayer.getRelation = function (layer1, layer2) {
  var comp1 = layer1.containingComp;
  var comp2 = layer2.containingComp;
  if (comp1 !== comp2) return null;
  if (layer1.index == layer2.index) return null;
  if (layer1.parent == null && layer2.parent == null) return 0;
  //check
  var degree = 0;
  var parent = layer1.parent;
  while (parent) {
    degree++;
    if (layer2.index == parent.index) return degree;
    parent = parent.parent;
  }
  var parent = layer2.parent;
  degree = 0;
  while (parent) {
    degree++;
    if (layer1.index == parent.index) return -degree;
    parent = parent.parent;
  }
  return 0;
};

/**
 * Measures the distance between two layers
 * @param {Layer} [layer1] - The first layer. If omitted, will use the selected layers in the current comp
 * @param {Layer} [layer2] - The second layer
 * @return {float} The distance (in pixels). -1 if less than two layers are found
 */
DuAELayer.getDistance = function (layer1, layer2) {
  if (!isdef(layer1)) {
    var layers = DuAEComp.getSelectedLayers();
    if (layers.length < 2) return -1;
    layer1 = layers[0];
    layer2 = layers[1];
  }

  var O = DuAELayer.getWorldPos(layer1);
  var A = DuAELayer.getWorldPos(layer2);
  var OA = DuMath.length(O, A);

  return Math.round(OA);
};

/**
 * Gets the maximum distance between a bunch of layers
 * @param {Layer[]|DuList.<Layer>|LayerCollection} layers The layers
 * @return {float} The distance (in pixels)
 */
DuAELayer.getMaxDistance = function (layers) {
  layers = new DuList(layers);
  var numLayers = layers.length();
  var dist = 0;
  for (var i = 0; i < numLayers; i++) {
    for (var j = i + 1; j < numLayers; j++) {
      var d = DuAELayer.getDistance(layers.at(i), layers.at(j));
      if (d > dist) dist = d;
    }
  }
  return dist;
};

/**
 * Gets the world coordinates of the point of a layer
 * @param {Layer} layer - The layer
 * @param {Number[]} [point=layer.transform.anchorPoint.value] - the point
 * @param {Number} [time] - the time at which to get the coordinates. Current time by default.
 * @return {Number[]} The world coordinates of the layer
 */
DuAELayer.getWorldPos = function (layer, point, time) {
  time = def(time, layer.containingComp.time);

  if (layer instanceof CameraLayer || layer instanceof LightLayer) {
    point = def(point, [0, 0, 0]);
  } else {
    point = def(point, layer.transform.anchorPoint.valueAtTime(time, false));
  }

  if (
    layer instanceof CameraLayer ||
    layer instanceof LightLayer ||
    layer.threeDLayer
  ) {
    // Add null
    var comp = layer.containingComp;
    var nullLayer = comp.layers.addNull();
    nullLayer.threeDLayer = true;
    var p = nullLayer.transform.position;

    p.expression =
      "thisComp.layer(" + layer.index + ").toWorld(" + point.toSource() + ");";
    var pos = p.value;

    nullLayer.remove();

    return pos;
  }

  var matrix = DuAELayer.getTransformMatrix(layer, time);
  if (!isdef(point)) {
    if (layer.transform.anchorPoint)
      point = layer.transform.anchorPoint.valueAtTime(time, false);
  }

  return matrix.applyToPoint(point);
};

/**
 * Adds an animation preset on the layer.<br />
 * Be careful as layer selection will be kept but not properties selection,<br />
 * and this can result in an "invalid object" if referencing a property.
 * @param {Layer} layer - The layer
 * @param {File} preset - The preset file
 * @param {string} matchName - The pseudo Effect matchName
 * @return {PropertyGroup|null} The effect corresponding matchName or null if anything went wrong
 */
DuAELayer.applyPreset = function (layer, preset, matchName) {
  if (!isdef(layer)) {
    DuDebug.throwUndefinedError("layer", "DuAELayer.applyPreset");
    return null;
  }
  if (!isdef(preset)) {
    DuDebug.throwUndefinedError("preset", "DuAELayer.applyPreset");
    return null;
  }
  matchName = def(matchName, "");
  if (preset instanceof DuBinary) preset = preset.toFile();
  if (!(preset instanceof File)) preset = new File(preset);
  if (!preset.exists)
    throw new Error(i18n._("The pseudo effect file does not exist."));

  //remove layer selection
  var comp = layer.containingComp;
  var selection = DuAEComp.unselectLayers(comp);
  layer.selected = true;

  layer.applyPreset(preset);

  //applying a preset gets out of progress mode
  //if (DuAEProject.progressMode) DuAEProject.setProgressMode(true);

  var effect = null;
  if (layer.property("ADBE Effect Parade").numProperties > 0)
    effect = layer.property("ADBE Effect Parade")(
      layer.property("ADBE Effect Parade").numProperties,
    );

  //restore selection
  DuAEComp.selectLayers(selection);

  return effect;
};

/**
 * This method is a workaround to AE API method layer.applyPreset to work like addProperty when adding pseudoEffects
 * @param {Layer} layer - The layer
 * @param {File} preset - The preset file
 * @param {string} matchName - The pseudo Effect matchName.
 * @param {string} [name] - The name to set on the effect
 * @return {PropertyGroup|null} The effect or null if anything went wrong
 */
DuAELayer.addPseudoEffect = function (layer, preset, matchName, name) {
  if (jstype(preset) != "file") {
    DuDebug.throwTypeError(
      preset,
      "preset",
      "File",
      "DuAELayer.addPseudoEffect",
    );
    return null;
  }
  if (!preset.exists) {
    DuDebug.throwError(
      i18n._("The pseudo effect file does not exist."),
      "DuAELayer.addPseudoEffect( layer, preset, matchName, name)",
    );
    return null;
  }
  if (layer == undefined) return null;
  if (preset == undefined) return null;
  if (matchName == undefined) return null;

  var effects = layer("ADBE Effect Parade");
  //add the preset to a temp comp if not available as an effect
  if (!effects.canAddProperty(matchName) || DuESF.debug) {
    //create comp
    var comp = app.project.items.addComp("DuAEF Temp", 10, 10, 1, 1, 24);
    //add null
    var n = comp.layers.addNull();
    //apply preset
    n.applyPreset(preset);
    var fx = n.effect(1);
    if (fx) matchName = fx.matchName;
    //remove all
    var nullSource = n.source;
    n.remove();
    nullSource.remove();
    comp.remove();
  }

  if (!effects.canAddProperty(matchName)) {
    DuDebug.throwError(
      i18n._("Invalid pseudo effect file or match name."),
      "DuAELayer.addPseudoEffect( layer, preset, matchName, name)",
    );
    return null;
  }

  //add the pseudoEffect as a property
  var newEffectName = "";
  newEffectName = DuAELayer.newUniqueEffectName(name, layer);
  var effect = effects.addProperty(matchName);
  if (newEffectName != "") effect.name = newEffectName;
  return effect;
};

/**
 * Checks if the layers have some selected keyframes
 * @param {Layer[]|LayerCollection} layers - The layers
 * @return {boolean} true if the layers have at least one selected keyframe
 */
DuAELayer.haveSelectedKeys = function (layers) {
  var it = new DuList(layers);
  if (it.length() == 0) return;
  while ((layer = it.next())) {
    var layerInfo = new DuAEProperty(layer);
    if (layerInfo.hasSelectedKeys()) return true;
  }
  return false;
};

/**
 * Gets the time of the first keyFrame
 * @param {Layer[]|LayerCollection} layer - The layer
 * @param {boolean} selected - true to check selected keyframes only
 * @return {float|null} The keyframe time or null if there are no keyframe
 */
DuAELayer.firstKeyFrameTime = function (layers, selected) {
  var it = new DuList(layers);
  var time = null;

  it.do(function (layer) {
    var layerProp = new DuAEProperty(layer);
    var test = layerProp.firstKeyTime(selected);
    if (time == null) time = test;
    else if (test != null) {
      if (time > test) time = test;
    }
  });

  return time;
};

/**
 * Sort the layers by their parenting (root at first index 0)
 * Layers with a parent outside of the list are at the beginning, followed by layers without parent
 * Note that the order of these layers is reversed
 * @param {Layer[]|Collection|DuList.<Layer>} layers - The layers to sort
 * @return {Layer[]} The sorted array
 */
DuAELayer.sortByParent = function (layers) {
  var sortedLayers = [];
  var layersToSort = new DuList(layers);

  //add layers with a parent outside
  //those with a parent outside of the selection
  for (var i = layersToSort.length() - 1; i >= 0; i--) {
    var l = layersToSort.at(i);
    var parent = l.parent;
    if (parent == null) continue;
    var isParentOutside = true;
    for (var j = 0, numL = layersToSort.length(); j < numL; j++) {
      if (parent.index == layersToSort.at(j).index) {
        isParentOutside = false;
        break;
      }
    }
    if (isParentOutside) {
      sortedLayers.push(l);
      layersToSort.remove(i);
    }
  }

  //add layers with no parents
  for (var i = layersToSort.length() - 1; i >= 0; i--) {
    var l = layersToSort.at(i);
    if (l.parent == null) {
      sortedLayers.push(l);
      layersToSort.remove(i);
    }
  }

  //sort the rest
  while (layersToSort.length() > 0) {
    for (var i = layersToSort.length() - 1; i >= 0; i--) {
      var l = layersToSort.at(i);
      for (var j = 0, numL = sortedLayers.length; j < numL; j++) {
        var sL = sortedLayers[j];
        if (l.parent.index == sL.index) {
          sortedLayers.push(l);
          layersToSort.remove(i);
          break;
        }
      }
    }
  }
  return sortedLayers;
};

/**
 * Sort the layers by their indices. Returns a new Array, the original array or collection is not changed.
 * @param {Layer[]|LayerCollection|DuList.<Layer>} layers - The layers to sort
 * @return {Layer[]} The sorted array
 */
DuAELayer.sortByIndex = function (layers) {
  var sortedLayers = new DuList(layers);

  function compareLayerIndices(lay1, lay2) {
    return lay1.index - lay2.index;
  }

  return sortedLayers.sort(compareLayerIndices);
};

/**
 * Parents all the layers together beginning by the end of the array
 * @param {Layer[]|DuList.<Layer>} layers - The layers to parent
 */
DuAELayer.parentChain = function (layers) {
  layers = new DuList(layers);
  //unparent all but the first
  var layersUnparent = [];
  for (var i = 1, numL = layers.length(); i < numL; i++) {
    layersUnparent.push(layers.at(i));
  }
  DuAELayer.unparent(layersUnparent);

  for (var i = layers.length() - 1; i >= 1; i--) {
    try {
      layers.at(i).parent = layers.at(i - 1);
    } catch (e) {
      if (DuESF.debug) alert(e);
    }
  }
};

/**
 * Un-parents all the layers
 * @param {Layer[]} layers - The layers
 */
DuAELayer.unparent = function (layers) {
  for (var i = layers.length - 1; i >= 0; i--) {
    layers[i].parent = null;
  }
};

/**
 * (Un)parent the children of the layer.< br/>
 * When children are unparented, an effect is added and the name of the layer is changed to show the "edit mode" is enabled.<br />
 * When toggled again, the effect is removed, and the name is restored.
 * @param {Layer} layer - The layer to toggle.
 */
DuAELayer.toggleEditMode = function (layer) {
  // Check if it's already in edit mode
  var setEditMode = true;
  var editMode = DuAETag.getValue(
    layer,
    DuAETag.Key.EDIT_MODE,
    DuAETag.Type.BOOL,
  );
  if (editMode) {
    setEditMode = false;
  }

  var comp = layer.containingComp;

  // TRANSLATORS: must be relatively short
  var editName = i18n._p("in layer name", "Edit mode");

  if (setEditMode) {
    // Get children
    var children = DuAELayer.getChildren(layer);
    var childLayers = [];
    for (var j = 0, num = children.length; j < num; j++) {
      var child = children[j];
      childLayers.push(child.index);
      var l = child.locked;
      child.locked = false;
      child.parent = null;
      child.locked = l;
    }

    // Set the name
    layer.name = "=EDIT= " + layer.name;
    // The previous tag name
    var tagName = DuAETag.getName(layer);
    // Set new Tag
    DuAETag.set(layer, tagName + " | =" + editName + "=");
    // Add to edit group
    DuAETag.addGroup(layer, editName);
    // Store the list of children
    childLayers = childLayers.join(",");
    DuAETag.setValue(layer, DuAETag.Key.CHILD_LAYERS, childLayers);
    DuAETag.setValue(layer, DuAETag.Key.EDIT_MODE, true);

    // Tint the layer
    var tint = layer.property("ADBE Effect Parade").addProperty("ADBE Tint");
    tint.name = editName;
    tint(1).setValue([0.5, 0, 0, 1]);
    tint(2).setValue([1, 0, 0, 1]);
  } else {
    var childLayers = DuAETag.getValue(
      layer,
      DuAETag.Key.CHILD_LAYERS,
      DuAETag.Type.ARRAY,
    );
    if (childLayers == null) return;
    for (var i = 0, n = childLayers.length; i < n; i++) {
      var index = parseInt(childLayers[i]);
      var child = comp.layer(index);
      var l = child.locked;
      child.locked = false;
      child.parent = layer;
      child.locked = l;
    }

    DuAETag.setValue(layer, DuAETag.Key.CHILD_LAYERS, "");
    DuAETag.setValue(layer, DuAETag.Key.EDIT_MODE, false);
    // Remove from edit group
    DuAETag.removeGroup(layer, editName);
    // Reset original tag
    var tagName = DuAETag.getName(layer);
    tagName = tagName.replace(" | =" + editName + "=", "");
    if (tagName == "") DuAETag.remove(layer);
    else DuAETag.set(layer, tagName);
    // Reset the layer name
    layer.name = layer.name.replace("=EDIT= ", "");

    //Remove tint
    layer.property("ADBE Effect Parade").property(editName).remove();
  }
};

/**
 * Creates a sequence with the layers, but using opacities.
 * This enables more possibilities to rig them, like with the Duik Connector
 * @param {Layer[]|LayerCollection} [layers] - The layers. The selected layers by default.
 * @param {string} [expr] - An expression to add to the opacity of the layers
 */
DuAELayer.sequence = function (layers, expr) {
  layers = def(DuAEComp.getSelectedLayers());
  if (layers.length == 0) return;
  expr = def(expr, "");
  var comp = layers[0].containingComp;
  var it = new DuList(layers);
  it.do(function (layer) {
    while (layer.transform.opacity.numKeys > 0) {
      layer.transform.opacity.removeKey(layer.transform.opacity.numKeys);
    }
    var i = it.current;
    var t = i * comp.frameDuration;
    var endTime = (layers.length - 1) * comp.frameDuration;
    layer.transform.opacity.setValueAtTime(0, 0);
    layer.transform.opacity.setValueAtTime(endTime, 0);
    layer.transform.opacity.setValueAtTime(t, 100);
    if (i < layers.length - 1)
      layer.transform.opacity.setValueAtTime(t + comp.frameDuration, 0);
    for (
      var keyIndex = 1;
      keyIndex <= layer.transform.opacity.numKeys;
      keyIndex++
    ) {
      layer.transform.opacity.setInterpolationTypeAtKey(
        keyIndex,
        KeyframeInterpolationType.HOLD,
        KeyframeInterpolationType.HOLD,
      );
    }
    layer.transform.opacity.expression = expr;
  });
};

/**
 * Adds a new Null object just above a layer, at the same position.<br />
 * This is a convenience function calling {@link DuAEComp.addNull}.
 * @param {Layer} layer - The layer
 * @return {Layer} the null
 */
DuAELayer.addNull = function (layer) {
  return DuAEComp.addNull(layer.containingComp, undefined, layer);
};

/**
 * Locks the scale with an expression so its value cannot be changed
 * @param {Layer} layer - The layer
 */
DuAELayer.lockScale = function (layer) {
  DuAEProperty.lock(layer.transform.scale);
};

/**
 * Copies the layers to another comp
 * @param {Layer[]} layers - The layers to copy and paste
 * @param {CompItem} destinationComp - The composition to copy to
 * @param {boolean} [withPropertyLinks=false] - Add expressions on the properties to link them to the orriginal layers<br />
 * Works only on 12.0 and above, ignored on 11.0 (CS6) and below
 * @return {Layer[]} The new layers
 */
DuAELayer.copyToComp = function (layers, destinationComp, withPropertyLinks) {
  if (DuAE.version.version < 12.0) withPropertyLinks = false;
  withPropertyLinks = def(withPropertyLinks, false);

  if (layers.length == 0) return;

  var it = new DuList(layers);

  var previousActiveComp = DuAEProject.getActiveComp();

  //activate the origin comp
  var originComp = it.first().containingComp;
  originComp.openInViewer();

  //select the layers
  var previousSelection = DuAEComp.unselectLayers(originComp);
  DuAEComp.selectLayers(layers);

  //copy
  if (withPropertyLinks) DuAE.copyWithPropertyLinks();
  else DuAE.copy();

  //destination
  destinationComp.openInViewer();

  //unselect layers in destination
  var previousSelectionDestination = DuAEComp.unselectLayers(destinationComp);

  //paste
  DuAE.paste();

  //keep new layers to return them
  var newLayers = destinationComp.selectedLayers;

  //restore previous state
  DuAEComp.selectLayers(previousSelection);
  previousActiveComp.openInViewer();
  DuAEComp.selectLayers(previousSelectionDestination);

  return newLayers;
};

/**
 * Parents all (unparented) layers
 * @param {Layer|LayerCollection|Layer[]|DuList.<Layer>} layers - The layers to parent
 * @param {Layer} [parent] - The parent. If not defined, will use the last layer of the list
 * @param {boolean} [unparentedOnly=true] - True to parent only layers which do not have a parent yet
 * @param {boolean} [insert=false] - When true, the parent will be parented to the previous parent of the given layer (or first layer if the layers param is a list)
 */
DuAELayer.parent = function (layers, parent, unparentedOnly, insert) {
  unparentedOnly = def(unparentedOnly, true);
  insert = def(insert, false);
  layers = new DuList(layers);

  if (!isdef(parent)) {
    if (layers.length() <= 1) return;
    parent = layers.pop();
  }

  if (insert) parent.parent = layers.first().parent;

  layers.do(function (layer) {
    var locked = layer.locked;
    layer.locked = false;
    if ((layer.parent == null && unparentedOnly) || !unparentedOnly) {
      if (parent == null || layer.index != parent.index) layer.parent = parent;
    }
    layer.locked = locked;
  });
};

/**
 * Gets all the (selected) puppet pins found on the layer.<br />
 * Will return all puppet pins if there is no puppet selection.
 * @param {Layer} layer - The layer
 * @return {DuAEProperty[]} The properties
 */
DuAELayer.getPuppetPins = function (layer) {
  var pins = [];
  var selectedProps = layer.selectedProperties;

  function getPins(puppet) {
    //get pins
    var mesh = puppet
      .property("ADBE FreePin3 ARAP Group")
      .property("ADBE FreePin3 Mesh Group")
      .property("ADBE FreePin3 Mesh Atom")
      .property("ADBE FreePin3 PosPins");
    for (var i = 1, num = mesh.numProperties; i <= num; i++) {
      pins.push(new DuAEProperty(mesh.property(i)));
    }
  }

  if (selectedProps == 0) {
    //look for puppet effects
    for (
      var i = 1, num = layer("ADBE Effect Parade").numProperties;
      i <= num;
      i++
    ) {
      var effect = layer.effect(i);
      if (effect.matchName == "ADBE FreePin3") {
        getPins(effect);
      }
    }
  } else {
    //get any selected pin
    var itProps = new DuList(selectedProps);
    itProps.do(function (prop) {
      if (prop.matchName == "ADBE FreePin3 PosPin Atom")
        pins.push(new DuAEProperty(prop));
    });
    //try to find selected puppets
    if (pins.length == 0) {
      itProps.do(function (prop) {
        if (prop.matchName == "ADBE FreePin3") getPins(prop);
      });
    }
  }

  return pins;
};

/**
 * Aligns a layer in position to another layer
 * @param {Layer} layer - The layer to align.
 * @param {Layer} target - The reference layer.
 */
DuAELayer.alignPosition = function (layer, target) {
  //parent to target
  var layerParent = layer.parent;
  if (layerParent != target) layer.parent = target;

  var comp = layer.containingComp;

  //TODO if dimensions dimensions separated
  //TODO if 3D

  //set position
  if (layer.transform.position.dimensionsSeparated) {
    var xpos = layer.transform.property("ADBE Position_0");
    if (xpos.numKeys == 0) xpos.setValue(target.transform.anchorPoint.value[0]);
    else xpos.setValueAtTime(comp.time, target.transform.anchorPoint.value[0]);

    var ypos = layer.transform.property("ADBE Position_1");
    if (ypos.numKeys == 0) ypos.setValue(target.transform.anchorPoint.value[1]);
    else ypos.setValueAtTime(comp.time, target.transform.anchorPoint.value[1]);
  } else {
    if (layer.transform.position.numKeys == 0)
      layer.transform.position.setValue(target.transform.anchorPoint.value);
    else
      layer.transform.position.setValueAtTime(
        comp.time,
        target.transform.anchorPoint.value,
      );
  }

  //reparent
  if (layerParent != target) layer.parent = layerParent;
};

/**
 * Aligns a layer's orientation to another layer
 * @param {Layer} layer - The layer to align.
 * @param {Layer} target - The reference layer.
 */
DuAELayer.alignOrientation = function (layer, target) {
  //parent to target
  var layerParent = layer.parent;
  if (layerParent != target) layer.parent = target;

  var comp = layer.containingComp;

  //TODO if 3D/2D

  //set rotation
  if (layer.transform.rotation.numKeys == 0)
    layer.transform.rotation.setValue(0);
  else layer.transform.rotation.setValueAtTime(comp.time, 0);

  //reparent
  if (layerParent != target) layer.parent = layerParent;
};

/**
 * Aligns a layer's scale to another layer
 * @param {Layer} layer - The layer to align.
 * @param {Layer} target - The reference layer.
 */
DuAELayer.alignScale = function (layer, target) {
  //parent to target
  var layerParent = layer.parent;
  if (layerParent != target) layer.parent = target;

  var comp = layer.containingComp;

  //TODO 3D

  //set scale
  if (layer.transform.scale.numKeys == 0)
    layer.transform.scale.setValue([100, 100]);
  else layer.transform.scale.setValueAtTime(comp.time, [100, 100]);

  //reparent
  if (layerParent != target) layer.parent = layerParent;
};

/**
 * Aligns a layer's opcaity to another layer
 * @param {Layer} layer - The layer to align.
 * @param {Layer} target - The reference layer.
 */
DuAELayer.alignOpacity = function (layer, target) {
  var comp = layer.containingComp;

  //set scale
  if (layer.transform.opacity.numKeys == 0)
    layer.transform.opacity.setValue(target.transform.opacity.value);
  else
    layer.transform.opacity.setValueAtTime(
      comp.time,
      target.transform.opacity.value,
    );
};

/**
 * Aligns the layers' transformations (position, rotation, scale) to another layer
 * @param {Layer[]|LayerCollection} layers - The layers to align.
 * @param {Layer} target - The reference layer.
 * @param {boolean} [position=true] - True to align position.
 * @param {boolean} [rotation=true] - True to align orientation.
 * @param {boolean} [scale=true] - True to align scale.
 * @param {boolean} [opacity=false] - True to align opcacity.
 */
DuAELayer.align = function (
  layers,
  target,
  position,
  rotation,
  scale,
  opacity,
) {
  position = def(position, true);
  rotation = def(rotation, true);
  scale = def(scale, true);
  opacity = def(opacity, false);

  var it = new DuList(layers);

  var targetParent = target.parent;
  target.parent = null;

  //set values
  it.do(function (layer) {
    if (layer == target) return;

    if (position) DuAELayer.alignPosition(layer, target);
    if (rotation) DuAELayer.alignOrientation(layer, target);
    if (scale) DuAELayer.alignScale(layer, target);
    if (opacity) DuAELayer.alignOpacity(layer, target);
  });

  target.parent = targetParent;
};

/**
 * Gets the transformation matrix of the layer from the compostion.<br />
 * Use Matrix.applyToPoint(point) to transform any coordinate with the matrix returned by this method.
 * @param {Layer} layer - the layer
 * @param {float} [time] - the time at which to get the coordinates. Current time by default.
 * @return {Matrix} The coordinates.
 */
DuAELayer.getTransformMatrix = function (layer, time) {
  time = def(time, layer.containingComp.time);

  var matrix = new Matrix();

  //get the ancestors
  var layers = [layer];
  var parent = layer.parent;
  while (parent) {
    layers.push(parent);
    parent = parent.parent;
  }

  //apply transforms from the ancestor
  for (var i = layers.length - 1; i >= 0; i--) {
    var l = layers[i];

    //position
    matrix.translate(l.transform.position.valueAtTime(time, false));

    //rotation
    if (l.threeDLayer || l instanceof CameraLayer)
      matrix.rotate(l.transform.zRotation.valueAtTime(time, false));
    else matrix.rotate(l.transform.rotation.valueAtTime(time, false));

    if (!(l instanceof CameraLayer)) {
      //anchor point inverse transform, taking scale into account
      var ap = l.transform.anchorPoint.valueAtTime(time, false);
      var sca = l.transform.scale.valueAtTime(time, false);
      var aPX = -((ap[0] * sca[0]) / 100);
      var aPY = -((ap[1] * sca[1]) / 100);

      matrix.translate([aPX, aPY]);

      //scale
      matrix.scale(l.transform.scale.valueAtTime(time, false) / 100);
    }
  }

  return matrix;
};

/**
 * Moves a layer to the coordinates of a spatial property
 * @param {Layer} layer - The layer
 * @param {Property|DuAEProperty} prop - The property
 */
DuAELayer.moveLayerToProperty = function (layer, prop) {
  var propInfo;
  if (prop instanceof DuAEProperty) {
    propInfo = prop;
    prop = propInfo.getProperty();
  } else {
    propInfo = new DuAEProperty(prop);
  }

  var propLayer = propInfo.layer;
  var comp = propInfo.comp;

  if (!(propLayer instanceof ShapeLayer)) {
    var matrix = DuAELayer.getTransformMatrix(propLayer);
    var pos = matrix.applyToPoint(prop.value);
    var parent = layer.parent;
    layer.parent = null;
    layer.position.setValue(pos);
    layer.parent = parent;
  } else {
    var parent = layer.parent;
    layer.parent = null;
    layer.position.setValue(prop.value);
    layer.parent = parent;
  }
};

/**
 * Sets the In and Out points of a layer according to its opacity (cuts at 0%)
 * @param {Layer} layer - The layer
 * @param {boolean} [preExpression=false] - Whether to check for the opacity post or pre-expression value
 */
DuAELayer.autoDuration = function (layer, preExpression) {
  if (!isdef(preExpression)) preExpression = false;

  var comp = layer.containingComp;

  var inPoint = layer.inPoint;
  var outPoint = layer.outPoint;
  var inFrame = inPoint / comp.frameDuration;
  var outFrame = outPoint / comp.frameDuration;

  //search in
  if (layer.transform.opacity.valueAtTime(inPoint, preExpression) == 0) {
    for (var i = inFrame; i < outFrame; i++) {
      var time = i * comp.frameDuration;
      if (layer.transform.opacity.valueAtTime(time, preExpression) == 0)
        inPoint = time + comp.frameDuration;
      else break;
    }
  }

  //search out
  if (layer.transform.opacity.valueAtTime(outPoint, preExpression) == 0) {
    for (var i = outFrame; i > inFrame; i--) {
      var time = i * comp.frameDuration;
      if (layer.transform.opacity.valueAtTime(time, preExpression) == 0)
        outPoint = time;
      else break;
    }
  }

  //set new in and out points
  if (inPoint != layer.inPoint) layer.inPoint = inPoint;
  if (outPoint != layer.outPoint) layer.outPoint = outPoint;
};

/**
 * Checks if a layer is 3D (ie is a threeDLayer or a camera or a light)
 * @param {Layer} layer - The layer
 * @return {bool} true if the layer is a 3D layer
 */
DuAELayer.isThreeD = function (layer) {
  if (layer.threeDLayer) return true;
  if (layer instanceof CameraLayer) return true;
  if (layer instanceof LightLayer) return true;
  return false;
};

/**
 * Gets an expression linking to the layer
 * @param {Layer} layer The layer
 * @param {Boolean} [useThisComp=false] Whether to begin the expression by 'thisComp' or 'comp("name")'
 * @return {str} The expression link to the layer
 */
DuAELayer.expressionLink = function (layer, useThisComp) {
  useThisComp = def(useThisComp, false);

  var comp = layer.containingComp;
  var exprCode;
  // Prefix the layer reference
  name = '"' + layer.name + '"';
  exprCode = "layer(" + name + ")";
  // Prefix the comp reference
  if (useThisComp) exprCode = "thisComp." + exprCode;
  else exprCode = 'comp("' + comp.name + '").' + exprCode;

  return exprCode;
};

/**
 * Checks if the given layer is a solid.
 * @param {Layer} layer The layer to test
 * @returns {Boolean} true if it is a solid
 */
DuAELayer.isSolid = function (layer) {
  if (layer.nullLayer) return false;

  if (DuAELayer.isType(layer, DuAELayer.Type.SOLID)) return true;

  if (!(layer instanceof AVLayer)) return false;

  if (!(layer.source instanceof FootageItem)) return false;

  if (layer.source.mainSource instanceof SolidSource) return true;
};

/**
 * Checks if the given layer is a precomposition.
 * @param {Layer} layer The layer to test
 * @returns {Boolean} true if it is a composition
 */
DuAELayer.isComp = function (layer) {
  if (layer.nullLayer) return false;

  if (!(layer instanceof AVLayer)) return false;

  if (layer.source instanceof CompItem) return true;

  return false;
};

/**
 * Checks if the layer is inside the bounds of the composition
 * @param {Layer} layer the layer to check
 * @param {Boolean} [useBounds=false] (not implemented yet) Checks the layer bounds if true, just the anchor point if false.
 * @returns {Boolean} true if the layer is inside the composition
 */
DuAELayer.insideComp = function (layer, useBounds) {
  useBounds = def(useBounds, false);

  var comp = layer.containingComp;
  var layerPos = DuAELayer.getWorldPos(layer);

  var compBounds = [0, comp.width, 0, comp.height, -9999999, 9999999];
  return DuMath.isInside(layerPos, compBounds);
};

/**
 * Moves a layer in the center of the comp if it is outside
 * @param {Layer} layer the layer to check
 * @param {Boolean} [useBounds=false] (not implemented yet) Checks the layer bounds if true, just the anchor point if false.
 */
DuAELayer.moveInsideComp = function (layer, useBounds) {
  if (DuAELayer.insideComp(layer)) return;
  var comp = layer.containingComp;
  var layerParent = layer.parent;
  layer.parent = null;
  layer.transform.position.setValue([comp.width / 2, comp.height / 2]);
  layer.parent = layerParent;
};

/**
 * Gets the last corresponding effect (instead of the first with the native layer.effect() method)
 * @param {Layer} layer The layer
 * @param {string} [name] The name or matchname to look for. If omitted, will return the last effect.
 * @param {int} [skip=0] Number of effects to skip
 * @returns {PropertyGroup|null} The effect or null if not found.
 */
DuAELayer.lastEffect = function (layer, name, skip) {
  skip = def(skip, 0);
  name = def(name, "");

  if (layer.property("ADBE Effect Parade").numProperties <= skip) return null;

  for (
    var i = layer.property("ADBE Effect Parade").numProperties - skip, n = 0;
    i > n;
    i--
  ) {
    var e = layer.effect(i);
    if (e.matchName == name) return e;
    if (e.name == name) return e;
  }
  return null;
};

/**
 * Changes the coordinates of the anchor point without moving the layer
 * @param {Layer} layer The layer
 * @param {Number[]} value The new coordinates
 */
DuAELayer.repositionAnchorPoint = function (layer, value) {
  // Unparent
  var parent = layer.parent;
  layer.parent = null;

  // Get future position for each position keyframe

  // New positions, one per keyframe
  /*var newPositions = [];
    var newXPositions = [];
    var newYPositions = [];
    var newZPositions = [];
    // The position property
    if (layer.transform.position.dimensionsSeparated) {
        var p = layer.transform.property('ADBE Position_0');
        var nK = p.numKeys;
        if (nK > 0) {
            for (var i = 1; i <= nK; i++) {
                var newPos = DuAELayer.getWorldPos(layer, value, p.keyTime(i));
                newXPositions.push(newPos[0]);
            }
        } else {
            var newPos = DuAELayer.getWorldPos(layer, value);
            newXPositions.push(newPos[0]);
        }

        p = layer.transform.property('ADBE Position_1');
        nK = p.numKeys;
        if (nK > 0) {
            for (var i = 1; i <= nK; i++) {
                var newPos = DuAELayer.getWorldPos(layer, value, p.keyTime(i));
                newYPositions.push(newPos[1]);
            }
        } else {
            var newPos = DuAELayer.getWorldPos(layer, value);
            newYPositions.push(newPos[1]);
        }

        p = layer.transform.property('ADBE Position_2');
        nK = p.numKeys;
        if (nK > 0) {
            for (var i = 1; i <= nK; i++) {
                var newPos = DuAELayer.getWorldPos(layer, value, p.keyTime(i));
                newZPositions.push(newPos[2]);
            }
        } else {
            var newPos = DuAELayer.getWorldPos(layer, value);
            newZPositions.push(newPos[2]);
        }
    }
    else {
        // Number of keyframes
        var p = layer.transform.position;
        var nK = p.numKeys;
        if (nK > 0) {
            for (var i = 1; i <= nK; i++) {
                var newPos = DuAELayer.getWorldPos(layer, value, p.keyTime(i));
                newPositions.push(newPos);
            }
        } else {
            var newPos = DuAELayer.getWorldPos(layer, value);
            newPositions.push(newPos);
        }
    }*/

  // Keep the current position of the layer
  var position = DuAELayer.getWorldPos(layer, [0, 0, 0]);

  // Set anchor point
  var ap = layer.transform.anchorPoint;
  /* @ts-ignore */
  if (ap.numKeys > 0) ap.setValueAtTime(layer.containingComp.time, value);
  /* @ts-ignore */ else layer.transform.anchorPoint.setValue(value);

  // Get the position offset
  /* @ts-ignore // Yes, we can do arithmetics with array/vectors */
  var offset = DuAELayer.getWorldPos(layer, [0, 0, 0]) - position;

  // Adjust position for keyframes
  if (layer.transform.position.dimensionsSeparated) {
    var p = layer.transform.property("ADBE Position_0");
    var nK = p.numKeys;
    if (nK > 0) {
      for (var i = 1; i <= nK; i++)
        p.setValueAtKey(i, p.keyValue(i) - offset[0]);
    } else p.setValue(p.value - offset[0]);

    p = layer.transform.property("ADBE Position_1");
    nK = p.numKeys;
    if (nK > 0) {
      for (var i = 1; i <= nK; i++)
        p.setValueAtKey(i, p.keyValue(i) - offset[1]);
    } else p.setValue(p.value - offset[1]);

    p = layer.transform.property("ADBE Position_2");
    nK = p.numKeys;
    if (nK > 0) {
      for (var i = 1; i <= nK; i++)
        p.setValueAtKey(i, p.keyValue(i) - offset[2]);
    } else if (layer.threeDLayer) p.setValue(p.value - offset[2]);
  } else {
    var p = layer.transform.position;
    nK = p.numKeys;
    if (nK > 0) {
      for (var i = 1; i <= nK; i++) p.setValueAtKey(i, p.keyValue(i) - offset);
    } else p.setValue(p.value - offset);
  }

  // Reparent
  layer.parent = parent;
};

/**
 * Returns the bounds of the layer in local coordinates, like the sourceRectAtTime() function does in expressions, but can also include masks.
 * @param {Layer} layer The layer
 * @param {float} [time] The time at which to get the bounds, the current time by default
 * @param {Boolean} [includeExtents=true] Includes the extents (strokes, accents...)
 * @param {Boolean} [includeMasks=true] Includes the masks
 * @return {float[]} The bounds [top, left, width, height]
 */
DuAELayer.sourceRect = function (layer, time, includeExtents, includeMasks) {
  time = def(layer.containingComp.time);
  includeExtents = def(includeExtents, true);
  includeMasks = def(includeMasks, true);

  var top = 0;
  var left = 0;
  var width = layer.width;
  var height = layer.height;

  // Texts and shapes: use an expression
  if (layer instanceof ShapeLayer || layer instanceof TextLayer) {
    // Expression
    var exp = "thisLayer.sourceRectAtTime(" + time + ",";
    if (includeExtents) exp += "true";
    else exp += "false";
    exp += ").{*};";

    // Create a slider
    var slider = layer
      .property("ADBE Effect Parade")
      .addProperty("ADBE Slider Control");

    slider(1).expression = exp.replace("{*}", "top");
    top = slider(1).value;
    slider(1).expression = exp.replace("{*}", "left");
    left = slider(1).value;
    slider(1).expression = exp.replace("{*}", "width");
    width = slider(1).value;
    slider(1).expression = exp.replace("{*}", "height");
    height = slider(1).value;

    // Remove slider
    slider.remove();
  }

  // Get masks
  if (includeMasks) {
    var masks = DuAEProperty.getProps(
      layer.property("ADBE Mask Parade"),
      "ADBE Mask Shape",
    );
    if (masks.length > 0) {
      var maskBounds = DuAEProperty.pathBounds(masks, false);
      if (maskBounds[0] > top) top = maskBounds[0];
      if (maskBounds[1] > left) left = maskBounds[1];
      if (maskBounds[2] < width) width = maskBounds[2];
      if (maskBounds[3] < height) height = maskBounds[3];
    }
  }

  return [top, left, width, height];
};

/**
 * Gets or create a layer control effect targetting the given target layer.
 * @param {Layer} layer The layer to get the effect from
 * @param {Layer} targetLayer The targetted layer, which must be in the same comp than the layer.
 * @param {string} [effectName] The name to use when creating the effect.
 * @return {DuAEProperty|null} The effect or null if the two layers are not in the same comp.
 */
DuAELayer.getCreateLayerEffect = function (layer, targetLayer, effectName) {
  var sourceComp = layer.containingComp;
  var targetComp = targetLayer.containingComp;
  if (sourceComp !== targetComp) return null;
  var sourceEffects = layer.property("ADBE Effect Parade");
  for (var i = 1, n = sourceEffects.numProperties; i <= n; i++) {
    var fx = sourceEffects(i);
    if (fx.matchName != "ADBE Layer Control") continue;
    if (fx(1).value == targetLayer.index) return fx;
  }
  var fx = sourceEffects.addProperty("ADBE Layer Control");
  if (isdef(effectName))
    fx.name = DuAELayer.newUniqueEffectName(effectName, layer);
  fx(1).setValue(targetLayer.index);
  return fx;
};

/**
 * Creates a new locator linked to the layer
 * @param {Layer|CompItem} [layerOrComp] The layer or the containing comp
 * @returns {ShapeLayer} The locator
 */
DuAELayer.createLocator = function (layerOrComp) {
  var layer = null;
  var comp = null;
  if (!isdef(layerOrComp)) comp = DuAEProject.getActiveComp();
  else if (layerOrComp instanceof CompItem) comp = layerOrComp;
  else {
    layer = layerOrComp;
    comp = layer.containingComp;
  }
  if (!comp) return null;

  //create null object
  var loc = DuAEComp.addNull(comp, 50);
  loc.moveToEnd();
  var name = "LOC";
  if (layer) Duik.Layer.copyAttributes(loc, layer, Duik.Layer.Type.LOCATOR);
  else
    Duik.Layer.setAttributes(loc, Duik.Layer.Type.LOCATOR, i18n._("Locator"));

  //add layer control
  var layerfx = loc
    .property("ADBE Effect Parade")
    .addProperty("ADBE Layer Control");
  layerfx.name = i18n._("Locator");
  if (layer) layerfx(1).setValue(layer.index);

  //add expressions
  loc.transform.rotation.expression = [
    DuAEExpression.Id.LOCATOR,
    DuAEExpression.Library.get([
      "sign",
      "dishineritRotation",
      "getOrientation",
    ]),
    "var result = 0;",
    "var l = null;",
    'try{ l = effect("' + layerfx.name + '")(1) } catch(e) { }',
    "if (l)",
    "{",
    "    var sign = getScaleMirror( thisLayer );",
    "    var flip = getScaleUTurn( thisLayer );",
    "    result = getOrientation( l ) * sign + flip;",
    "    result += dishineritRotation( thisLayer ) - value;",
    "}",
    "result;",
  ].join("\n");

  loc.transform.position.expression = [
    DuAEExpression.Id.LOCATOR,
    "var result = [thisComp.width/2,thisComp.height/2];",
    "var l = null;",
    'try{ l = effect("' + layerfx.name + '")(1) } catch(e) { }',
    "if (l)",
    "{",
    "   result = l.toWorld(l.anchorPoint);",
    "}",
    "if (hasParent)",
    "{",
    "   result = parent.fromWorld(result);",
    "}",
    "result;",
  ].join("\n");

  loc.transform.anchorPoint.expression = [
    DuAEExpression.Id.LOCATOR,
    "var result = value;",
    "var l = null;",
    'try{ l = effect("' + layerfx.name + '")(1) } catch(e) { }',
    "if (l)",
    "{",
    "   result =l.anchorPoint.value;",
    "}",
    "result;",
  ].join("\n");

  loc.transform.scale.expression = [
    DuAEExpression.Id.LOCATOR,
    "var l = null;",
    'try{ l = effect("' + layerfx.name + '")(1) } catch(e) { }',
    DuAEExpression.Library.get(["getScale", "dishineritScale"]),
    "",
    "var threeD = value.length == 3;",
    "var result = dishineritScale( thisLayer ) - value;",
    "if (threeD) result += [100,100,100];",
    "else result += [100,100];",
    "",
    "if (l)",
    "{",
    "    var sl = getScale( l )/100;",
    "    if (result.length == 3 && sl.length == 3) {",
    "        result = [ result[0]*sl[0], result[1]*sl[1], result[2]*sl[2] ];",
    "    }",
    "    else if (result.length == 3) {",
    "        result = [result[0]*sl[0], result[1]*sl[1], result[2] ];",
    "    }",
    "    else {",
    "        result = [result[0]*sl[0], result[1]*sl[1] ];",
    "    }",
    "}",
    "",
    "result;",
  ].join("\n");

  return loc;
};

/**
 * Checks if a layer is renderable. A non-renderable layer can be:<br />
 * <ul>
 * <li>A Null layer</li>
 * <li>A Guide layer</li>
 * <li>An empty shape layer</li>
 * <li>An empty text layer</li>
 * <li>A layer with the opacity at 0% for the whole composition</li>
 * </ul>
 * @return {Bool}
 */
DuAELayer.isRenderable = function (layer) {
  if (!layer.enabled) return false;
  if (layer.guideLayer) return false;
  if (layer.nullLayer) return false;
  if (layer instanceof ShapeLayer) {
    var contents = layer.property("ADBE Root Vectors Group");
    if (contents.numProperties == 0) return false;
  }
  if (layer instanceof TextLayer) {
    var contents = layer.sourceText.value.text;
    if (contents == "") return false;
  }
  if (
    layer.transform.opacity.expression == "" &&
    layer.transform.opacity.value == 0 &&
    layer.transform.opacity.numKeys == 0
  )
    return false;
  else if (layer.transform.opacity.expression == "") return true;

  // Check opacity for each frame if there's an expression in it
  var comp = layer.containingComp;
  var frameDuration = comp.frameDuration;
  for (var i = 0, n = comp.duration; i <= n; i += frameDuration) {
    if (layer.transform.opacity.valueAtTime(i, false) != 0) return true;
  }

  return false;
};

/**
 * Bakes the expressions to keyframes and removes all non-renderable layers.
 * @param {Layer} layer The layer to bake.
 * @param {DuAEExpression.BakeAlgorithm} [mode=DuAEExpression.BakeAlgorithm.SMART] The algorithm to use for baking the expressions.
 * @param {Number} [frameStep=1.0] By default, checks one value per keyframe. A lower value increases the precision and allows for sub-frame sampling. A higher value is faster but less precise.
 */
DuAELayer.bake = function (mode, frameStep, layer) {
  // First, check transform properties.
  // If the parent layer is not renderable, we need a locator to get the transform properties
  var parent = layer.parent;
  var locked = layer.locked;
  layer.locked = false;
  if (parent) {
    if (!DuAELayer.isRenderable(parent)) {
      // Add locator
      var loc = DuAELayer.createLocator(layer);
      // Bake it's transform properties
      var transformProp = new DuAEProperty(loc.transform);
      transformProp.bakeExpressions(mode, frameStep);
      // unparent the layer
      layer.parent = null;

      // Copy the locator transform property keyframes to the layer transform properties
      loc.transform.anchorPoint.expression = "";
      var apAnim = new DuAEProperty(loc.transform.anchorPoint).animation();
      layer.transform.anchorPoint.expression = "";
      var ap = new DuAEProperty(layer.transform.anchorPoint);
      ap.setAnim(apAnim, 0, false, true);

      loc.transform.position.expression = "";
      var posAnim = new DuAEProperty(loc.transform.position).animation();
      layer.transform.position.expression = "";
      var pos = new DuAEProperty(layer.transform.position);
      pos.setAnim(posAnim, 0, false, true);

      loc.transform.rotation.expression = "";
      var rotAnim = new DuAEProperty(loc.transform.rotation).animation();
      layer.transform.rotation.expression = "";
      var rot = new DuAEProperty(layer.transform.rotation);
      rot.setAnim(rotAnim, 0, false, true);

      loc.transform.scale.expression = "";
      var scaAnim = new DuAEProperty(loc.transform.scale).animation();
      layer.transform.scale.expression = "";
      var sca = new DuAEProperty(layer.transform.scale);
      sca.setAnim(scaAnim, 0, false, true);

      // Remove the locator
      loc.remove();
    }
  }

  // Bake all expressions on the layer
  new DuAEProperty(layer).bakeExpressions(mode, frameStep);

  layer.locked = locked;
};

/**
 * Gets the actual width of a layer (including it's scale)
 * @param {AVLayer} layer The layer
 * @return {Number} The width, in pixels.
 */
DuAELayer.width = function (layer) {
  var parent = layer.parent;
  layer.parent = null;

  var rect = layer.sourceRectAtTime(0, false);
  var w = (rect.width * layer.transform.scale.value[0]) / 100;
  w = Math.abs(w);

  layer.parent = parent;

  return w;
};

/**
 * Gets the actual height of a layer (including it's scale)
 * @param {AVLayer} layer The layer
 * @return {Number} The height, in pixels.
 */
DuAELayer.height = function (layer) {
  var parent = layer.parent;
  layer.parent = null;

  var rect = layer.sourceRectAtTime(0, false);
  var h = (rect.height * layer.transform.scale.value[0]) / 100;
  h = Math.abs(h);

  layer.parent = parent;

  return h;
};

/**
 * Stacks the layers in the timeline according to their order in the given array/DuList
 * @param {LayerCollection|Layer[]|DuList.<Layer>} layers The layers to stack
 */
DuAELayer.stack = function (layers) {
  layers = new DuList(layers);
  var l = layers.next();
  while ((l = layers.next())) {
    l.moveBefore(layers.at(layers.current - 1));
  }
};

/**
 * Sets the new coordinates of the layer to translate it by offset.
 * @param {Layer} layer The layer to move
 * @param {float[]} offset The value of the translation. A two or three dimensionnal array.
 * @param {boolean} [world=false] Set to true to offset in world coordinates.
 */
DuAELayer.translate = function (layer, offset, world) {
  var p = layer.transform.position.value;
  p[0] += offset[0];
  p[1] += offset[1];
  if (offset.length == 3) {
    if (p.length == 2) p.push(offset[2]);
    else p[2] += offset[2];
  }

  DuAELayer.setPosition(layer, p, world);
};

/**
 * Sets the new coordinates of the layer.
 * @param {Layer} layer The layer to move
 * @param {float[]} position The new coordinates
 * @param {boolean} [world=false] Set to true to use world coordinates.
 */
DuAELayer.setPosition = function (layer, position, world) {
  world = def(world, false);

  var l = layer.locked;
  layer.locked = false;

  var p = layer.parent;
  if (world) layer.parent = null;

  var pos = new DuAEProperty(layer.transform.position);
  pos.setValue(position);

  if (world) layer.parent = p;
  layer.locked = l;
};

/**
 * Checks if the layer has some keyframes
 * @param {Layer} layer The layer
 * @return {Boolean}
 */
DuAELayer.hasKeys = function (layer) {
  var p = new DuAEProperty(layer);
  return p.hasKeys();
};

/**
 * Checks if the layer has some expressions
 * @param {Layer} layer The layer
 * @return {Boolean}
 */
DuAELayer.hasExpressions = function (layer) {
  var p = new DuAEProperty(layer);
  return p.hasExpressions();
};

/**
 * Checks if the layer has some masks
 * @param {Layer} layer The layer
 * @return {Boolean}
 */
DuAELayer.hasMask = function (layer) {
  return layer.property("ADBE Mask Parade").numProperties > 0;
};

/**
 * Checks if this is a null layer, either a true AE Null layer,
 * or a "Shape as Null" as created by DuAEF with {@link DuAEComp.addNull}.
 * @param {Layer} layer The layer to test
 * @return {bool}
 */
DuAELayer.isNull = function (layer) {
  if (layer.nullLayer) return true;

  return DuAELayer.isType(layer, DuAELayer.Type.NULL);
};

DuAELayer.isAdjustment = function (layer) {
  if (layer.adjustmentLayer) return true;

  return DuAELayer.isType(layer, DuAELayer.Type.ADJUSTMENT);
};

/**
 * Finds the angle formed by three layers
 * @param {Layer} angleLayer The layer at which to measure the angle
 * @param {Layer} oppositeLayerA One of the opposite layers
 * @param {Layer} oppositeLayerB The other opposite layer
 * @return {Number} The angle in degrees. This is an oriented angle (the value can be negative).
 */
DuAELayer.angleFromLayers = function (
  angleLayer,
  oppositeLayerA,
  oppositeLayerB,
) {
  var p = DuAELayer.getWorldPos(angleLayer);
  var pA = DuAELayer.getWorldPos(oppositeLayerA);
  var pB = DuAELayer.getWorldPos(oppositeLayerB);

  var vecA = DuVector.fromPoints(p, pA);
  var vecB = DuVector.fromPoints(p, pB);

  return vecA.orientedAngle(vecB);
};

/**
 * Returns the location of the layer relative to the reference.
 * @param {Layer} point The layer to check
 * @param {Layer} referenceLayer The reference
 * @return {DuMath.Location} The location
 */
DuAELayer.relativeLocation = function (layer, referenceLayer) {
  var lP = DuAELayer.getWorldPos(layer);
  var rP = DuAELayer.getWorldPos(referenceLayer);
  return DuMath.relativeLocation(lP, rP);
};
