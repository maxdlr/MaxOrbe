/**
 * Gets the layer containing the property
 * @static
 * @deprecated
 * @param {PropertyBase|DuAEProperty}	prop	- The After Effects Property
 * @return {Layer}	The layer
 */
DuAEProperty.getLayer = function (prop) {
  if (!isdef(prop)) {
    DuDebug.throwUndefinedError("prop", "DuAEProperty.getLayer( prop )");
    return;
  }
  if (prop instanceof DuAEProperty) prop = prop.getProperty();
  var parentProp = prop;
  while (parentProp.parentProperty) {
    // Traverse up the property tree
    parentProp = parentProp.parentProperty;
  }
  return parentProp;
};

/**
 * Gets the number of dimensions of a property
 * @static
 * @deprecated
 * @param {Property|DuAEProperty}	prop	- The After Effects Property
 * @return {int}	The number of dimensions, 0 if this is not a dimensionnal value (ie color, text, shape...)
 */
DuAEProperty.getDimensions = function (prop) {
  if (prop instanceof DuAEProperty) prop = prop.getProperty();
  var dimensions = 0;
  if (
    prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL ||
    prop.propertyValueType == PropertyValueType.ThreeD
  ) {
    //if this is a position or scale and the layer is not 3D, AFX uses a 3D value in the position (with 0 as Z position), but the expression must return a 2D value.......
    if (
      (prop.matchName == "ADBE Scale" || prop.matchName == "ADBE Position") &&
      !DuAEProperty.getLayer(prop).threeDLayer
    ) {
      dimensions = 2;
    } else {
      dimensions = 3;
    }
  } else if (
    prop.propertyValueType == PropertyValueType.TwoD_SPATIAL ||
    prop.propertyValueType == PropertyValueType.TwoD
  ) {
    dimensions = 2;
  } else if (prop.propertyValueType == PropertyValueType.OneD) {
    dimensions = 1;
  } else if (prop.propertyValueType == PropertyValueType.COLOR) {
    dimensions = 4;
  }
  return dimensions;
};

/**
 * Checks if this property value can be edited
 * @static
 * @deprecated
 * @param {Property|DuAEProperty} prop - The After Effects Property
 * @return {bool} true if the value of the property can be edited, false otherwise
 */
DuAEProperty.isEditable = function (prop) {
  if (prop instanceof DuAEProperty) prop = prop.getProperty();

  if (prop.propertyType != PropertyType.PROPERTY) return false;
  if (prop.elided) return false;
  if (prop.dimensionsSeparated) return false;
  if (prop.propertyValueType == PropertyValueType.NO_VALUE) return false;
  if (prop.propertyValueType == PropertyValueType.CUSTOM_VALUE) return false;
  if (prop.propertyValueType == PropertyValueType.LAYER_INDEX) return false;
  if (prop.propertyValueType == PropertyValueType.MASK_INDEX) return false;
  try {
    if (typeof prop.value === "undefined") return false;
  } catch (e) {
    return false;
  }
  if (DuAEProperty.isMasterProperty(prop)) return true;

  //TODO find a way to detect if prop is hidden without using a try/catch and without setting a value
  //try to set a value if there's no keyframe
  if (prop.numKeys == 0) {
    try {
      prop.setValue(prop.valueAtTime(0, true));
      return true;
    } catch (e) {
      return false;
    }
  } else {
    try {
      prop.setValueAtKey(1, prop.keyValue(1));
      return true;
    } catch (e) {
      return false;
    }
  }

  return true;
};

/**
 * Checks if a property is part of the master properties of a precomp
 * @static
 * @deprecated
 * @param {Property|DuAEProperty} prop - The After Effects Property
 * @return {bool} true if property is part of the master properties
 */
DuAEProperty.isMasterProperty = function (prop) {
  while (prop.parentProperty !== null) {
    if (prop.matchName == "ADBE Layer Overrides") return true;
    prop = prop.parentProperty;
  }
  return false;
};

/**
 * Checks if this property value can be rigged (with an expression)
 * @static
 * @deprecated
 * @param {Property|DuAEProperty} prop - The After Effects Property
 * @return {bool} true if the value of the property can be rigged, false otherwise
 */
DuAEProperty.isRiggable = function (prop) {
  if (prop instanceof DuAEProperty) prop = prop.getProperty();

  if (prop.propertyType != PropertyType.PROPERTY) return false;
  if (!prop.canVaryOverTime) return false;
  if (!prop.canSetExpression) return false;
  if (prop.elided) return false;
  if (prop.dimensionsSeparated) return false;
  if (typeof prop.expression !== "string") return false;
  //TODO find a way to detect if prop is hidden without using a try/catch
  var expressionEnabled = prop.expressionEnabled;
  try {
    prop.expressionEnabled = expressionEnabled;
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Gets the key at a given index on a property
 * @static
 * @deprecated
 * @param {Property|DuAEProperty}	prop	- The property.
 * @param {int}	keyIndex	- The index of the key to retrieve. If the index is negative, it is counted from the end i.e. to retrieve the keyframe before the last one, use -2 (-1 is the last)
 * @return {DuAEKeyframe}	The keyframe, or null if incorrect index
 */
DuAEProperty.getKeyFrameAtIndex = function (prop, keyIndex) {
  if (prop instanceof DuAEProperty) prop = prop.getProperty();
  if (Math.abs(keyIndex) > prop.numKeys || keyIndex == 0) {
    return null;
  }
  if (keyIndex < 0) {
    keyIndex = prop.numKeys - keyIndex + 1;
  }

  var key = new DuAEKeyframe();
  key._time = prop.keyTime(keyIndex);
  key.value = prop.keyValue(keyIndex);
  key._inInterpolationType = prop.keyInInterpolationType(keyIndex);
  key._outInterpolationType = prop.keyOutInterpolationType(keyIndex);
  if (
    prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL ||
    prop.propertyValueType == PropertyValueType.TwoD_SPATIAL
  ) {
    key._spatial = true;
    key.spatialProperties.inTangent = prop.keyInSpatialTangent(keyIndex);
    key.spatialProperties.outTangent = prop.keyOutSpatialTangent(keyIndex);
    key.spatialProperties._continuous = prop.keySpatialContinuous(keyIndex);
    key.spatialProperties._autoBezier = prop.keySpatialAutoBezier(keyIndex);
    key.spatialProperties._roving = prop.keyRoving(keyIndex);
  }
  key.inEase = prop.keyInTemporalEase(keyIndex);
  key.outEase = prop.keyOutTemporalEase(keyIndex);
  key._continuous = prop.keyTemporalContinuous(keyIndex);
  key._autoBezier = prop.keyTemporalAutoBezier(keyIndex);
  key._index = keyIndex;

  return key;
};

/**
 * Gets the nearest key at a given time on a property
 * @static
 * @deprecated
 * @param {Property|DuAEProperty}	prop	- The property.
 * @param {float}	time	- The time of the key to retrieve.
 * @return {DuAEKeyframe}	The keyframe, or null if incorrect time or not found
 */
DuAEProperty.getNearestKeyFrameAtTime = function (prop, time) {
  if (prop instanceof DuAEProperty) prop = prop.getProperty();
  return DuAEProperty.getKeyFrameAtIndex(prop.nearestKeyIndex(time));
};

/**
 * Gets the key at an exactly given time on a property
 * @static
 * @deprecated
 * @param {Property|DuAEProperty}	prop	- The property.
 * @param {float}	time	- The time of the key to retrieve.
 * @return {DuAEKeyframe}	The keyframe, or null if incorrect time
 */
DuAEProperty.getKeyFrameAtTime = function (prop, time) {
  if (prop instanceof DuAEProperty) prop = prop.getProperty();
  if (!prop.canVaryOverTime) return null;
  if (prop.numKeys == 0) return null;
  var key = DuAEProperty.getKeyFrameAtIndex(prop, prop.nearestKeyIndex(time));
  if (key === null) return key;
  if (key._time == time) return key;
  else return null;
};

/**
 * Gets the property keyframes in the whole timeline or in the time range<br />
 * The DuAEKeyframe._time will be adjusted relatively to the start of the time range instead of the startTime of the composition.
 * @static
 * @deprecated
 * @param {Property|DuAEProperty}	prop	- The property.
 * @param {boolean}	[selected=false]	- true to get only selected keyframes.
 * @param {float[]}	[timeRange]	- The time range, an array of two time values, in seconds. If not provided, will use the comp time range.<br />
 * Ignored if selected is true;
 * @return {DuAEKeyframe[]}	The keyframes, or null of this property is of type PropertyValueType.NO_VALUE or PropertyValueType.CUSTOM_VALUE
 */
DuAEProperty.getKeyFrames = function (prop, selected, timeRange) {
  if (prop instanceof DuAEProperty) prop = prop.getProperty();
  if (prop.propertyValueType == PropertyValueType.NO_VALUE) return [];
  if (prop.propertyValueType == PropertyValueType.CUSTOM_VALUE) return [];

  var comp = DuAEProperty.getComp(prop);
  if (timeRange == undefined) timeRange = [0, comp.duration];
  if (selected == undefined) selected = false;

  var keyFrames = [];

  if (prop.elided) return keyFrames;

  if (prop.isTimeVarying) {
    if (selected) {
      for (var keyIndex = 0; keyIndex < prop.selectedKeys.length; keyIndex++) {
        var key = DuAEProperty.getKeyFrameAtIndex(
          prop,
          prop.selectedKeys[keyIndex],
        );
        if (key._time >= timeRange[0] && key._time <= timeRange[1]) {
          key._time = key._time - timeRange[0];
          keyFrames.push(key);
        }
      }
    } else if (prop.numKeys > 0) {
      for (var keyIndex = 1; keyIndex <= prop.numKeys; keyIndex++) {
        var key = DuAEProperty.getKeyFrameAtIndex(prop, keyIndex);
        if (key._time >= timeRange[0] && key._time <= timeRange[1]) {
          key._time = key._time - timeRange[0];
          keyFrames.push(key);
        }
      }
    }
  }
  return keyFrames;
};

/**
 * Gets all animations in the group in the whole timeline or in the time range<br />
 * The first DuAEKeyframe._time will be adjusted relatively to the start of the time range (if provided) instead of the startTime of the composition.
 * @static
 * @deprecated
 * @param {PropertyGroup|DuAEProperty}	prop	- The property.
 * @param {boolean}	[selected=false]	- true to get only selected keyframes.
 * @param {float[]}	[timeRange]	- The time range, an array of two time values, in seconds. If not provided, will use the comp time range.
 * @return {DuAEPropertyGroupAnimation|DuAEPropertyAnimation}	The animations. A DuAEPropertyAnimation if prop is a Property, a PopertyGroupAnim if it is a PropertyGroup
 */
DuAEProperty.getAnim = function (prop, selected, timeRange) {
  var comp = DuAEProperty.getComp(prop);
  timeRange = def(timeRange, [0, comp.duration]);
  selected = def(selected, false);

  if (prop instanceof DuAEProperty) prop = prop.getProperty();

  if (selected && !DuAEProperty.hasSelectedKeys(prop)) return null;

  if (prop.propertyType === PropertyType.PROPERTY) {
    if (prop.propertyValueType == PropertyValueType.NO_VALUE) return null;
    if (prop.elided) return null;
    if (!prop.canVaryOverTime) return null;
    var anim = new DuAEPropertyAnimation();
    anim._name = prop.name;
    anim._matchName = prop.matchName;
    anim.startValue = prop.valueAtTime(timeRange[0], true);
    anim.endValue = prop.valueAtTime(timeRange[1], true);
    anim.keys = DuAEProperty.getKeyFrames(prop, selected, timeRange);
    if (anim.keys.length > 0) {
      anim.startTime = anim.keys[0]._time;
      anim.endTime = anim.keys[anim.keys.length - 1]._time;
    } else {
      anim.startTime = 0;
      anim.endTime = 0;
    }
    anim.dimensions = DuAEProperty.getDimensions(prop);
    if (prop.canSetExpression) anim.expression = prop.expression;
    return anim;
  } else if (prop.numProperties > 0) {
    var groupAnim = new DuAEPropertyGroupAnimation();
    groupAnim._name = prop.name;
    groupAnim._matchName = prop.matchName;

    for (var propIndex = 1; propIndex <= prop.numProperties; propIndex++) {
      var anim = DuAEProperty.getAnim(
        prop.property(propIndex),
        selected,
        timeRange,
      );
      if (anim != null) {
        if (groupAnim.startTime == null) groupAnim.startTime = anim.startTime;
        else if (groupAnim.startTime > anim.startTime)
          groupAnim.startTime = anim.startTime;
        if (groupAnim.endTime == null) groupAnim.endTime = anim.endTime;
        else if (groupAnim.endTime > anim.endTime)
          groupAnim.endTime = anim.endTimeendTime;
        groupAnim.anims.push(anim);
      }
    }
    return groupAnim;
  }
  return null;
};

// low-level undocumented method to get all expressions and cache them
DuAEProperty.addToExpressionCache = function (prop) {
  //it it's a prop, add to cache
  if (prop.propertyType === PropertyType.PROPERTY) {
    var exp = new DuAEPropertyExpression(prop);
    if (!exp.empty) DuAEExpression.cache.push(exp);
  }
  //if it's a group, get props inside
  else if (prop.numProperties > 0) {
    for (var p = 1; p <= prop.numProperties; p++) {
      DuAEProperty.addToExpressionCache(prop.property(p));
    }
  }
};

/**
 * Gets the time of the first keyFrame
 * @static
 * @deprecated
 * @param {PropertyBase[]|DuAEProperty[]} props - The properties
 * @param {boolean} selected - true to check selected keyframes only
 * @return {float|null} The keyframe time or null if there are no keyframe
 */
DuAEProperty.firstKeyFrameTime = function (props, selected) {
  var time = null;

  if (prop instanceof DuAEProperty) prop = prop.getProperty();
  if (prop.propertyType == PropertyType.PROPERTY) {
    if (!prop.canVaryOverTime) return null;
    if (selected) {
      if (prop.selectedKeys.length == 0) return null;
      for (var keyIndex = 0; keyIndex < prop.selectedKeys.length; keyIndex++) {
        var key = DuAEProperty.getKeyFrameAtIndex(
          prop,
          prop.selectedKeys[keyIndex],
        );
        if (time == null) time = key._time;
        else if (time > key._time) time = key._time;
      }
    } else {
      if (prop.numKeys == 0) return null;
      for (var keyIndex = 1; keyIndex <= prop.numKeys; keyIndex++) {
        var key = DuAEProperty.getKeyFrameAtIndex(prop, keyIndex);
        if (time == null) time = key._time;
        else if (time > key._time) time = key._time;
      }
    }
  } else if (prop.numProperties > 0) {
    for (var propIndex = 1; propIndex <= prop.numProperties; propIndex++) {
      var test = DuAEProperty.firstKeyFrameTime(
        prop.property(propIndex),
        selected,
      );
      if (time == null) time = test;
      else if (test != null) {
        if (time > test) time = test;
      }
    }
  }

  return time;
};

/**
 * Sets a {@linkcode DuAEKeyframe} on a property
 * @static
 * @deprecated
 * @param {Property|DuAEProperty}	prop	- The property.
 * @param {DuAEKeyframe}	key	- The DuAEKeyframe.
 * @param {float}	[timeOffset=comp.time]	- The time offset (added to DuAEKeyframe._time) where to add the key frame.
 */
DuAEProperty.setKey = function (prop, key, timeOffset) {
  if (prop instanceof DuAEProperty) prop = prop.getProperty();
  if (prop.elided) return;
  if (!prop.propertyType === PropertyType.PROPERTY) {
    DuDebug.throwError(
      "Can not set a key on a group property",
      "DuAEProperty.setKey",
    );
    return;
  }
  if (!prop.canVaryOverTime) return;
  if (prop.isSeparationLeader) if (prop.dimensionsSeparated) return;

  if (timeOffset == undefined) timeOffset = DuAEProperty.getComp(prop).time;
  var time = key._time + timeOffset;
  var propDimensions = DuAEProperty.getDimensions(prop);
  var val = key.value;

  if (propDimensions > 1 && !(val instanceof Array)) {
    val = [val];
  }

  //adjust dimensions
  if (val instanceof Array) {
    while (val.length < propDimensions) {
      val.push(0);
    }
    while (val.length > propDimensions) {
      val.pop();
    }
  }

  DuAEProperty.setValueAtTime(prop, val, time);
  if (prop.numKeys == 0) return;

  //get the index of the created key
  var index = prop.nearestKeyIndex(time);

  //set interpolations
  if (
    key._spatial &&
    (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL ||
      prop.propertyValueType == PropertyValueType.TwoD_SPATIAL)
  ) {
    try {
      prop.setSpatialContinuousAtKey(index, key.spatialProperties._continuous);
      prop.setSpatialAutoBezierAtKey(index, key.spatialProperties._autoBezier);
      prop.setRovingAtKey(index, key.spatialProperties._roving);
      prop.setSpatialTangentsAtKey(
        index,
        key.spatialProperties.inTangent,
        key.spatialProperties.outTangent,
      );
    } catch (err) {
      if (DuESF.debug) alert(err.description);
    }
  }

  try {
    prop.setTemporalContinuousAtKey(index, key._continuous);
    prop.setTemporalAutoBezierAtKey(index, key._autoBezier);
    prop.setTemporalEaseAtKey(index, key.inEase, key.outEase);
    prop.setInterpolationTypeAtKey(
      index,
      key._inInterpolationType,
      key._outInterpolationType,
    );
  } catch (err) {
    if (DuESF.debug) alert(err.description);
  }
};

/**
 * Sets the property animation on the property.<br />
 * Use this method only to force the animation onto the property without checks.<br />
 * Must be used on a Property (not a group) with a DuAEPropertyAnimation (not a DuAEPropertyGroupAnimation).<br />
 * To easily set an animation on a property with automatic compatibility checks, you should use setGroupAnim().
 * @static
 * @deprecated
 * @param {Property|DuAEProperty}	prop	- The property.
 * @param {DuAEPropertyAnimation} anims	- The animation
 * @param {float}	[time=comp.time]	- The time where to begin the animation
 * @param {boolean}	[setExpression=false]	- Sets the expression too
 * @param {boolean}	[replace=false]	- true to remove any existing keyframe on the properties before adding new keyframes
 * @param {boolean}	[offset=false]	- true to offset the current value, instead of replacing it
 * @return {boolean} true if the anim was actually set.
 */
DuAEProperty.setAnim = function (
  prop,
  anim,
  time,
  setExpression,
  replace,
  offset,
) {
  var propInfo = new DuAEProperty(prop);
  prop = propInfo.getProperty();
  var comp = propInfo.comp;
  time = def(time, comp.time);
  setExpression = def(setExpression, false);
  replace = def(replace, false);
  offset = def(offset, false);

  if (!propInfo.numerical) offset = false;

  var dimensions = anim.dimensions;

  var ok = false;

  if (anim == null) return true;
  if (anim.type == "group") return false;

  if (propInfo.editable) {
    //keep current value
    var val = prop.valueAtTime(comp.time, true);

    //remove keyframes
    if (replace && prop.numKeys > 0) {
      for (var i = prop.numKeys; i > 0; i--) {
        prop.removeKey(i);
      }
      DuAEProperty.setValue(prop, val);
    }

    //if there are keys, set them
    if (anim.keys.length > 0) {
      for (var iclef = 0; iclef < anim.keys.length; iclef++) {
        var key = anim.keys[iclef];
        if (offset) {
          if (iclef == 0) key.value = val;
          else key.value = val + (key.value - anim.startValue);
        }
        DuAEProperty.setKey(prop, key, time);
        ok = true;
      }
    } //set the start value
    else {
      var value = anim.startValue;
      if (value instanceof Array) {
        while (value.length < dimensions) {
          value.push(0);
        }
        while (value.length > dimensions) {
          value.pop();
        }
      }

      if (anim.startValue != null && !offset) {
        if (prop.numKeys == 0) {
          DuAEProperty.setValue(prop, anim.startValue);
        } else {
          try {
            prop.setValueAtTime(time, anim.startValue);
          } catch (e) {}
        }
      }
      ok = true;
    }

    //set the expression
    if (propInfo.riggable && setExpression) {
      try {
        prop.expression = anim.expression;
      } catch (e) {
        if (DuESF.debug) alert(e.description);
      }
    }
  }

  return ok;
};

/**
 * Checks if the property value is a number or an Array of Number.<br >
 * I.e if its value type is one of: one D, two D, three D (spatial or not), Color.
 * @static
 * @deprecated
 * @param {Property}	 prop	- The property
 * @return {bool}
 */
DuAEProperty.isNumerical = function (prop) {
  if (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL) return true;
  if (prop.propertyValueType == PropertyValueType.ThreeD) return true;
  if (prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) return true;
  if (prop.propertyValueType == PropertyValueType.TwoD) return true;
  if (prop.propertyValueType == PropertyValueType.OneD) return true;
  if (prop.propertyValueType == PropertyValueType.COLOR) return true;
  return false;
};

/**
 * Sets a value on a property, adjusting the dimensions if needed
 * @static
 * @deprecated
 * @param {Property|DuAEProperty} prop - The property
 * @param {any} value - The value to set
 * @param {float} defaultTime - The time at which to set the value if the property has keyframes
 * @return {boolean} True if the value has correctly been set, false otherwise.
 */
DuAEProperty.setValue = function (prop, value, defaultTime) {
  var dimensions = 0;
  var editable = false;
  if (prop instanceof DuAEProperty) {
    propInfo = prop;
    prop = propInfo.getProperty();
  } else {
    propInfo = new DuAEProperty(prop);
  }
  dimensions = propInfo.dimensions;
  editable = propInfo.editable;

  if (prop.isSeparationLeader) if (prop.dimensionsSeparated) return false;

  if (!editable) return false;

  if (prop.numKeys > 0 && isdef(defaultTime))
    return DuAEProperty.setValueAtTime(prop, value, defaultTime);
  else if (prop.numKeys > 0) return false;

  //check dimensions of the property
  if (dimensions == 0 || dimensions == 1) {
    if (value instanceof Array) value = value[0];
    try {
      prop.setValue(value);
      return true;
    } catch (e) {
      if (DuESF.debug) alert(e.description);
      return false;
    }
  } else {
    if (!(value instanceof Array)) value = [value];
    while (value.length < dimensions) {
      value.push(0);
    }
    while (value.length > dimensions) {
      value.pop();
    }
    try {
      prop.setValue(value);
      return true;
    } catch (e) {
      if (DuESF.debug) alert(e.description);
      return false;
    }
  }
};

/**
 * Sets a new keyframe on a property, adjusting the dimensions if needed, at desired time
 * @static
 * @deprecated
 * @param {Property|DuAEProperty} prop - The property
 * @param {any} value - The value to set
 * @param {float} [time] - The time of the new keyframe
 * @return {boolean} True if the value has correctly been set, false otherwise.
 */
DuAEProperty.setValueAtTime = function (prop, value, time) {
  var dimensions = 0;
  var editable = false;
  if (prop instanceof DuAEProperty) {
    propInfo = prop;
    prop = propInfo.getProperty();
  } else {
    propInfo = new DuAEProperty(prop);
  }
  dimensions = propInfo.dimensions;
  editable = propInfo.editable;

  if (!isdef(time)) time = propInfo.comp.time;

  if (!prop.canVaryOverTime) return false;
  if (prop.isSeparationLeader) if (prop.dimensionsSeparated) return false;

  if (!editable) return false;

  //check dimensions of the property
  if (dimensions == 0 || dimensions == 1) {
    if (value instanceof Array) value = value[0];
    try {
      prop.setValueAtTime(time, value);
      return true;
    } catch (e) {
      if (DuESF.debug) alert(e.description);
      return false;
    }
  } else {
    if (!(value instanceof Array)) value = [value];
    while (value.length < dimensions) {
      value.push(0);
    }
    while (value.length > dimensions) {
      value.pop();
    }
    try {
      prop.setValueAtTime(time, value);
      return true;
    } catch (e) {
      if (DuESF.debug) alert(e.description);
      return false;
    }
  }
};

/**
 * Sets all animations on a Property or a PropertyGroup.
 * @static
 * @deprecated
 * @param {PropertyGroup|DuAEProperty}	prop	- The property group.
 * @param {DuAEPropertyAnimation} anims	- The animation
 * @param {float}	[time=comp.time]	- The time where to begin the animation
 * @param {boolean}	[ignoreName=false]	- true to set the anim even if name of the property do not match the animation.
 * @param {boolean}	[setExpression=false]	- Sets the expression too
 * @param {boolean}	[onlyKeyframes=true]	- If false, the value of properties without keyframes will be set too.
 * @param {boolean}	[replace=false]	- true to remove any existing keyframe on the properties before adding new keyframes
 * @param {string[]}	[whiteList]	- A list of matchNames used as a white list for properties to set anims.<br />
 * Can be the matchName of a propertyGroup to set all the subproperties.<br />
 * Ignored if the list is empty.
 * @param {boolean}	[offset=false]	- true to offset the current value, instead of replacing it
 * @return {boolean} true if the anim was actually set.
 */
DuAEProperty.setGroupAnim = function (
  prop,
  anim,
  time,
  ignoreName,
  setExpression,
  onlyKeyframes,
  replace,
  whiteList,
  offset,
  set,
) {
  if (prop instanceof DuAEProperty) prop = prop.getProperty();
  time = def(time, DuAEProperty.getComp(prop).time);
  ignoreName = def(ignoreName, false);
  setExpression = def(setExpression, false);
  onlyKeyframes = def(onlyKeyframes, false);
  replace = def(replace, false);
  whiteList = def(whiteList, []);
  offset = def(offset, false);
  reverse = def(reverse, false);
  set = def(set, false);

  if (whiteList.length == 0) set = true;

  whiteList = new DuList(whiteList);
  if (whiteList.indexOf(anim._matchName) >= 0) set = true;

  var ok = false;

  if (anim == null) return true;

  if (anim.type == "anim") {
    if (set) {
      var okToSet = false;
      if (prop.matchName == anim._matchName) {
        if (!ignoreName && prop.name == anim._name) okToSet = true;
        if (ignoreName) okToSet = true;
        if (onlyKeyframes && anim.keys.length == 0) okToSet = false;
      }

      if (okToSet)
        return DuAEProperty.setAnim(
          prop,
          anim,
          time,
          setExpression,
          replace,
          offset,
        );
    }
  } else {
    for (var i = 0; i < anim.anims.length; i++) {
      var propAnim = anim.anims[i];
      //find the property with the same name and matchname
      for (var j = 1; j <= prop.numProperties; j++) {
        var subProp = prop.property(j);
        var okToSet = false;
        if (subProp.matchName == propAnim._matchName) {
          if (!ignoreName && subProp.name == propAnim._name) okToSet = true;
          if (ignoreName) okToSet = true;
        }
        if (okToSet) {
          ok = DuAEProperty.setGroupAnim(
            subProp,
            propAnim,
            time,
            ignoreName,
            setExpression,
            onlyKeyframes,
            replace,
            whiteList,
            offset,
            set,
          );
          break;
        }
      }
    }
  }

  return ok;
};

/**
 * Removes the animation from the property
 * @static
 * @deprecated
 * @param {Property|DuAEProperty} prop -The property
 * @param {boolean} [removeExpression=false] - Set to true to remove the expression too
 */
DuAEProperty.removeAnim = function (prop, removeExpression) {
  if (prop instanceof DuAEProperty) prop = prop.getProperty();
  while (prop.numKeys > 0) {
    prop.removeKey(1);
  }
  if (removeExpression && prop.canSetExpression) {
    prop.expression = "";
  }
};

/**
 * Selects the keyframes in the propoerty.<br />
 * Selects all nested keyframes if the property is a group.
 * @static
 * @deprecated
 * @param {PropertyBase|DuAEProperty} property - The property
 * @param {float} [inTime=0] - The time at which to select the keyframes
 * @param {float} [outTime=inTime] - The end time
 */
DuAEProperty.selectKeyFrames = function (property, inTime, outTime) {
  if (inTime == undefined) inTime = 0;
  if (outTime == undefined) outTime = inTime;
  var prop;
  if (property instanceof DuAEProperty) prop = property.getProperty();
  else prop = property;

  if (prop.propertyType == PropertyType.PROPERTY) {
    if (prop.elided) return;
    if (prop.isSeparationLeader) if (prop.dimensionsSeparated) return;
    if (inTime == outTime) {
      //get key
      var key = DuAEProperty.getKeyFrameAtTime(prop, inTime);
      if (key) prop.setSelectedAtKey(key._index, true);
    } else {
      //get keys
      var keys = DuAEProperty.getKeyFrames(prop, false, [inTime, outTime]);
      if (!keys) return;
      for (var i = 0; i < keys.length; i++) {
        prop.setSelectedAtKey(keys[i]._index, true);
      }
    }
  } else if (prop.numProperties > 0) {
    for (var i = 1; i <= prop.numProperties; i++) {
      DuAEProperty.selectKeyFrames(prop.property(i), inTime, outTime);
    }
  }
};

/**
 * Gets an expression link to the property
 * @static
 * @deprecated
 * @memberof DuAEProperty
 * @param {Property|DuAEProperty}	prop			- The property
 * @param {bool}		[useThisComp=false]		- Whether to begin the expression by 'thisComp' or 'comp("name")'
 * @param {bool}		[fromLayer=true]		- Whether to begin the expression by comp.layer or directly from the first prop of the layer
 * @return {str}		The expression link to the property
 */
DuAEProperty.getExpressionLink = function (prop, useThisComp, fromLayer) {
  if (prop instanceof DuAEProperty) prop = prop.getProperty();
  if (useThisComp == undefined) useThisComp = false;
  if (fromLayer == undefined) fromLayer = true;

  //get compact expression from matchName, if available
  function getCompactExpression(matchName, name) {
    var translatedName = DuAE.CompactExpression[matchName];

    if (translatedName !== undefined) return eval(translatedName);
    else return "(" + name + ")";
  }

  var exprCode = "";
  var name;
  while (prop.parentProperty !== null) {
    //do not translate master properties
    if (prop.parentProperty.matchName != "ADBE Layer Overrides") {
      if (prop.propertyType == PropertyType.PROPERTY) name = prop.propertyIndex;
      else if (prop.parentProperty.propertyType == PropertyType.INDEXED_GROUP) {
        name = '"' + prop.name + '"';
      } else {
        name = '"' + prop.matchName + '"';
      }
      compactName = getCompactExpression(prop.matchName, name);
      exprCode = compactName + exprCode;
    } else {
      exprCode = '("' + prop.name + '")';
    }

    // Traverse up the property tree
    prop = prop.parentProperty;
  }

  if (exprCode.indexOf("(") != 0 && exprCode != "") exprCode = "." + exprCode;

  if (fromLayer) {
    var comp = prop.containingComp;
    // Prefix the layer reference
    name = '"' + prop.name + '"';
    exprCode = "layer(" + name + ")" + exprCode;
    // Prefix the comp reference
    if (useThisComp) exprCode = "thisComp." + exprCode;
    else exprCode = 'comp("' + comp.name + '").' + exprCode;
  }

  return exprCode;
};

/**
 * Sets interpolations on a keyframe.
 * @static
 * @deprecated
 * @param {Property} prop - The property
 * @param {int} key - The key index
 * @param {KeyframeInterpolationType|string} typeIn - The in interpolation type (see AE API) or the string "roving" or "continuous"
 * @param {KeyframeInterpolationType|string} [typeOut=typeIn] - The out interpolation type (see AE API)
 * @param {int[]|int} [easeInValue=33] - The in interpolation ease value (used if typeIn is KeyframeInterpolationType.BEZIER)
 * @param {int[]|int} [easeOutValue=easeInValue] - The out interpolation ease value (used if typeOut is KeyframeInterpolationType.BEZIER)
 */
DuAEProperty.setKeyInterpolation = function (
  prop,
  key,
  typeIn,
  typeOut,
  easeInValue,
  easeOutValue,
) {
  if (typeOut == undefined) typeOut = typeIn;
  if (easeInValue == undefined) easeInValue = 33;
  if (isNaN(easeInValue)) easeInValue = 33;
  if (easeOutValue == undefined) easeOutValue = easeInValue;
  if (isNaN(easeOutValue)) easeOutValue = 33;

  easeInValue = new KeyframeEase(0, easeInValue);
  easeOutValue = new KeyframeEase(0, easeOutValue);

  if (typeIn == "roving" && prop.isSpatial) {
    prop.setRovingAtKey(key, true);
  } else if (typeIn == "continuous") {
    prop.setInterpolationTypeAtKey(key, KeyframeInterpolationType.BEZIER);
    prop.setTemporalContinuousAtKey(key, true);
    prop.setTemporalAutoBezierAtKey(key, true);
    //not roving
    if (prop.isSpatial) prop.setRovingAtKey(key, false);
  } else if (typeIn != "roving") {
    //influences
    if (!prop.isSpatial && prop.value.length == 3) {
      prop.setTemporalEaseAtKey(
        key,
        [easeInValue, easeInValue, easeInValue],
        [easeOutValue, easeOutValue, easeOutValue],
      );
    } else if (!prop.isSpatial && prop.value.length == 2) {
      prop.setTemporalEaseAtKey(
        key,
        [easeInValue, easeInValue],
        [easeOutValue, easeOutValue],
      );
    } else {
      prop.setTemporalEaseAtKey(key, [easeInValue], [easeOutValue]);
    }
    //type
    prop.setInterpolationTypeAtKey(key, typeIn, typeOut);
    //not roving
    if (prop.isSpatial) {
      if (
        prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL ||
        prop.propertyValueType == PropertyValueType.TwoD_SPATIAL
      )
        prop.setRovingAtKey(key, false);
    }
    //not continuous
    prop.setTemporalContinuousAtKey(key, false);
  }
};

/**
 * Computes a percentage from a velocity on a given keyframe.
 * @static
 * @deprecated
 * @param {Property|DuAEProperty} prop - The property
 * @param {int} key - The index of the keyframe where to compute the velocity
 * @return {float[]} The velocities [in, out] as a percentage.
 */
DuAEProperty.velocityToPercent = function (prop, key) {
  var propInfo = new DuAEProperty(prop);
  prop = propInfo.getProperty();

  var speedIn = prop.keyInTemporalEase(key)[0].speed;
  var speedOut = prop.keyOutTemporalEase(key)[0].speed;

  //get speed just before and after as if it was linear
  var prevSpeed = 0;
  var nextSpeed = 0;
  var val = prop.keyValue(key);
  var currentTime = prop.keyTime(key);
  if (key > 1) {
    var valBefore = prop.keyValue(key - 1);
    var timeBefore = prop.keyTime(key - 1);
    prevSpeed = DuMath.length(val, valBefore) / (currentTime - timeBefore);
  }

  if (key < prop.numKeys) {
    var valAfter = prop.keyValue(key + 1);
    var timeAfter = prop.keyTime(key + 1);
    nextSpeed = DuMath.length(val, valBefore) / (timeAfter - currentTime);
  }

  //get average speed
  var speed = (prevSpeed + nextSpeed) / 2;

  //compare to the original speeds
  var speedInAsPercent = (speedIn / speed) * 100;
  var speedOutAsPercent = (speedOut / speed) * 100;

  return [speedInAsPercent, speedOutAsPercent];
};

/**
 * Checks if the property has some selected keyframes.<br />
 * The property can be either a Property or a PropertyGroup.
 * @static
 * @deprecated
 * @param {PropertyBase} prop - The property
 * @return {boolean} true if the property have at least one selected keyframe
 */
DuAEProperty.hasSelectedKeys = function (prop) {
  var yes = false;

  if (prop.propertyType == PropertyType.PROPERTY) {
    if (prop.selectedKeys.length > 0) {
      yes = true;
    }
  } else if (prop.numProperties > 0) {
    for (var propIndex = 1; propIndex <= prop.numProperties; propIndex++) {
      yes = DuAEProperty.hasSelectedKeys(prop.property(propIndex));
      if (yes) break;
    }
  }
  return yes;
};

/**
 * Sets the spatial interpolation of the selected keyframes on the property
 * @static
 * @deprecated
 * @param {Property|DuAEProperty} prop - The property
 * @param {KeyframeInterpolationType} typeIn - The in interpolation type (see AE API)
 * @param {KeyframeInterpolationType} [typeOut=typeIn] - The in interpolation type (see AE API)
 */
DuAEProperty.setSpatialInterpolation = function (prop, typeIn, typeOut) {
  if (prop instanceof DuAEProperty) prop = prop.getProperty();
  if (typeOut == undefined) typeOut = typeIn;
  if (!prop.isSpatial) return;
  if (prop.selectedKeys.length == 0) return;
  for (var k = 0; k < prop.selectedKeys.length; k++) {
    if (
      typeIn == KeyframeInterpolationType.BEZIER &&
      typeOut == KeyframeInterpolationType.BEZIER
    ) {
      prop.setSpatialAutoBezierAtKey(prop.selectedKeys[k], true);
    } else if (
      typeIn == KeyframeInterpolationType.LINEAR &&
      typeOut == KeyframeInterpolationType.LINEAR
    ) {
      prop.setSpatialContinuousAtKey(prop.selectedKeys[k], false);
      prop.setSpatialAutoBezierAtKey(prop.selectedKeys[k], false);
      if (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL) {
        prop.setSpatialTangentsAtKey(
          prop.selectedKeys[k],
          [0, 0, 0],
          [0, 0, 0],
        );
      } else if (prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) {
        prop.setSpatialTangentsAtKey(prop.selectedKeys[k], [0, 0], [0, 0]);
      }
    } else if (typeIn == KeyframeInterpolationType.BEZIER) {
      prop.setSpatialContinuousAtKey(prop.selectedKeys[k], false);
      prop.setSpatialAutoBezierAtKey(prop.selectedKeys[k], false);
      var keyIndex = prop.selectedKeys[k];
      if (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL) {
        if (
          prop.keyInSpatialTangent(keyIndex)[0] == 0 &&
          prop.keyInSpatialTangent(keyIndex)[1] == 0 &&
          prop.keyInSpatialTangent(keyIndex)[2] == 0
        ) {
          prop.setSpatialAutoBezierAtKey(prop.selectedKeys[k], true);
        }
        prop.setSpatialTangentsAtKey(
          keyIndex,
          prop.keyInSpatialTangent(keyIndex),
          [0, 0, 0],
        );
      } else if (prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) {
        if (
          prop.keyInSpatialTangent(keyIndex)[0] == 0 &&
          prop.keyInSpatialTangent(keyIndex)[1] == 0
        ) {
          prop.setSpatialAutoBezierAtKey(prop.selectedKeys[k], true);
        }
        prop.setSpatialTangentsAtKey(
          keyIndex,
          prop.keyInSpatialTangent(keyIndex),
          [0, 0],
        );
      }
    } else if (typeIn == KeyframeInterpolationType.LINEAR) {
      prop.setSpatialContinuousAtKey(prop.selectedKeys[k], false);
      prop.setSpatialAutoBezierAtKey(prop.selectedKeys[k], false);
      var keyIndex = prop.selectedKeys[k];
      if (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL) {
        if (
          prop.keyOutSpatialTangent(keyIndex)[0] == 0 &&
          prop.keyOutSpatialTangent(keyIndex)[1] == 0 &&
          prop.keyOutSpatialTangent(keyIndex)[2] == 0
        ) {
          prop.setSpatialAutoBezierAtKey(prop.selectedKeys[k], true);
        }
        prop.setSpatialTangentsAtKey(
          keyIndex,
          [0, 0, 0],
          prop.keyOutSpatialTangent(keyIndex),
        );
      } else if (prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) {
        if (
          prop.keyOutSpatialTangent(keyIndex)[0] == 0 &&
          prop.keyOutSpatialTangent(keyIndex)[1] == 0
        ) {
          prop.setSpatialAutoBezierAtKey(prop.selectedKeys[k], true);
        }
        prop.setSpatialTangentsAtKey(
          keyIndex,
          [0, 0],
          prop.keyOutSpatialTangent(keyIndex),
        );
      }
    }
  }
};

/**
 * Fixes the spatial interpolation of the selected keys.<br />
 * Sets the interpolation to linear when the property does not move between keyframes
 * @static
 * @deprecated
 * @param {Property|DuAEProperty} prop - The property
 */
DuAEProperty.fixSpatialInterpolation = function (prop) {
  if (prop instanceof DuAEProperty) prop = prop.getProperty();

  if (!prop.isSpatial) return;
  if (!prop.canVaryOverTime) return;

  var keyIndices = prop.selectedKeys;
  if (keyIndices.length < 2) return;

  for (var k = 0; k < keyIndices.length - 1; k++) {
    var key = keyIndices[k];
    var nextKey = keyIndices[k + 1];
    //get this key value
    var keyValue = prop.valueAtTime(prop.keyTime(key), true);
    //get next key value
    var nextKeyValue = prop.valueAtTime(prop.keyTime(key + 1), true);

    //compare and set
    if (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL) {
      if (
        keyValue[0] == nextKeyValue[0] &&
        keyValue[1] == nextKeyValue[1] &&
        keyValue[2] == nextKeyValue[2]
      ) {
        prop.setSpatialTangentsAtKey(
          key,
          prop.keyInSpatialTangent(key),
          [0, 0, 0],
        );
        prop.setSpatialTangentsAtKey(
          nextKey,
          [0, 0, 0],
          prop.keyOutSpatialTangent(nextKey),
        );
      }
    } else if (prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) {
      if (keyValue[0] == nextKeyValue[0] && keyValue[1] == nextKeyValue[1]) {
        prop.setSpatialTangentsAtKey(
          key,
          prop.keyInSpatialTangent(key),
          [0, 0],
        );
        prop.setSpatialTangentsAtKey(
          nextKey,
          [0, 0],
          prop.keyOutSpatialTangent(nextKey),
        );
      }
    }
  }
};

/**
 * Removes all unneeded keyframes from the property.< br/>
 * Also checks the interpolation values to reset the correct display as linear/smooth.
 * @static
 * @deprecated
 * @param {Property|DuAEProperty} property - The property
 */
DuAEProperty.cleanKeyframes = function (property) {
  var prop = property;
  if (prop instanceof DuAEProperty) prop = property.getProperty();

  var numKeys = prop.numKeys;
  if (numKeys == 0) return;
  if (numKeys == 1) {
    prop.removeKey(1);
    return;
  }

  for (var i = numKeys; i > 0; i--) {
    var currentKey = DuAEProperty.getKeyFrameAtIndex(prop, i);

    if (i > 1) var prevKey = DuAEProperty.getKeyFrameAtIndex(prop, i - 1);
    if (i < prop.numKeys)
      var nextKey = DuAEProperty.getKeyFrameAtIndex(prop, i + 1);

    //check values
    var currentValue = new DuList(currentKey.value);
    if (i > 1 && !currentValue.equals(prevKey.value, 3)) continue;
    if (i < prop.numKeys && !currentValue.equals(nextKey.value, 3)) continue;
    //check velocities
    var remove = false;
    for (var j = 0; j < currentKey.inEase.length; j++) {
      remove = false;
      if (i > 1 && !DuMath.equals(prevKey.outEase[j].speed, 0, 4)) break;
      if (i > 1 && !DuMath.equals(currentKey.inEase[j].speed, 0, 4)) break;
      if (i < prop.numKeys && !DuMath.equals(currentKey.outEase[j].speed, 0, 4))
        break;
      if (i < prop.numKeys && !DuMath.equals(nextKey.inEase[j].speed, 0, 4))
        break;
      remove = true;
    }
    //remove key
    if (remove) prop.removeKey(i);
  }
};

/**
 * Gets the speed of a property at a given time
 * @static
 * @deprecated
 * @param {Property|DuAEProperty} prop - The property
 * @param {float} [time=composition.time] - The time.
 * @param {boolean} [preExpression=true] - true to get the pre-expression speed.
 * @return {float} The speed
 */
DuAEProperty.getSpeed = function (prop, time, preExpression) {
  preExpression = def(preExpression, true);
  if (prop instanceof DuAEProperty) prop = prop.getProperty();
  if (prop.propertyType != PropertyType.PROPERTY) return 0;
  if (prop.numKeys == 0 && preExpression) return 0;
  var comp = DuAEProperty.getComp(prop);
  if (time == undefined) time = comp.time;

  var speed = DuMath.length(
    prop.valueAtTime(time + comp.frameDuration / 2, preExpression),
    prop.valueAtTime(time - comp.frameDuration / 2, preExpression),
  );
  return speed / comp.frameDuration;
};

/**
 * Sets an expression to a property.<br />
 * With the ability to keep the initial value.
 * @static
 * @deprecated
 * @param {string} expr - The expression
 * @param {bool} [keepValue=true] - When true, the method will try to keep the same resulting value as before applying the expression.
 */
DuAEProperty.setExpression = function (property, expr, keepValue) {
  keepValue = def(keepValue, true);

  var propInfo = new DuAEProperty(property);
  if (!propInfo.riggable) return;

  property = propInfo.getProperty();

  var originalValue = property.valueAtTime(propInfo.comp.time, false);

  //remove current expression
  if (keepValue) DuAEProperty.removeExpression(property);
  else
    try {
      property.expression = "";
    } catch (e) {
      if (DuESF.debug) alert(e.description);
      return;
    }
  //set new expression
  try {
    property.expression = expr;
  } catch (e) {
    if (DuESF.debug) alert(e.description);
  }

  //restore value
  if (propInfo.editable && keepValue && propInfo.dimensions > 0)
    DuAEProperty.setValue(
      property,
      2 * originalValue - property.valueAtTime(propInfo.comp.time, false),
    );
};

/**
 * Recursively (if it's a group) replaces text in Expressions
 * @static
 * @deprecated
 * @param {string} oldString - The string to replace
 * @param {string} newString - The new string
 * @param {boolean} [caseSensitive=true] - Whether the search has to be case sensitive
 */
DuAEProperty.replaceInExpressions = function (
  prop,
  oldString,
  newString,
  caseSensitive,
) {
  caseSensitive = def(caseSensitive, true);

  if (prop.propertyType == PropertyType.PROPERTY) {
    if (prop.canSetExpression) {
      if ((prop.expression = "")) return;
      if (prop.expression.length < oldString.length) return;
      try {
        prop.expression = DuString.replace(
          prop.expression,
          oldString,
          newString,
          caseSensitive,
        );
      } catch (e) {}
    }
  } else if (prop.numProperties > 0) {
    for (
      var propertyIndex = 1;
      propertyIndex <= prop.numProperties;
      propertyIndex++
    ) {
      DuAEProperty.replaceInExpressions(
        prop.property(propertyIndex),
        oldString,
        newString,
        caseSensitive,
      );
    }
  }
};

/**
 * Adds an expression to the property, linking it to the parent property
 * @static
 * @deprecated
 * @param {Property} childProp - The child property (the one which gets an expression).
 * @param {Property} parentProp - The parent property.
 * @param {bool} useThisComp - Whether to begin the expression by 'thisComp' or 'comp("name")', default: will detect if the properties are in the same comp
 */
DuAEProperty.pickWhip = function (childProp, parentProp, useThisComp) {
  if (childProp instanceof DuAEProperty) childProp = childProp.getProperty();
  if (parentProp instanceof DuAEProperty) parentProp = parentProp.getProperty();
  if (!childProp.canSetExpression) return;
  if (!isdef(useThisComp)) {
    var parentComp = DuAEProperty.getComp(parentProp);
    var childComp = DuAEProperty.getComp(childProp);
    if (parentComp.id == childComp.id) useThisComp = true;
    else useThisComp = false;
  }
  var exp = DuAEProperty.getExpressionLink(parentProp, useThisComp);
  DuAEProperty.setExpression(childProp, exp, false);
};

/**
 * Link all the properties found in childProp to all the same properties of parentProp (this is a recursive method)<br />
 * Note: any Property or PropertyGroup (and its subproperties) named "Data" will be linked the opposite way (from parentProp to childProp).
 * @static
 * @deprecated
 * @memberof DuAEProperty
 * @param {PropertyBase} childProp - The child property
 * @param {PropertyBase} parentProp - The parent property
 * @param {bool} [useThisComp] - Whether to begin the expression by 'thisComp' or 'comp("name")', default: will detect if the properties are in the same comp
 * @param {LayerItem} [timeLayer=null] - A layer used to offset the time (typically, in case of link between precompositions, the precomposition layer).<br />
 * When not null, the start time of this layer will be taken into account to get the values and synchronize them.
 */
DuAEProperty.linkProperties = function (
  childProp,
  parentProp,
  useThisComp,
  timeLayer,
) {
  if (parentProp.name.toLowerCase() == "data") return;

  if (
    childProp.propertyType == PropertyType.PROPERTY &&
    !childProp.elided &&
    childProp.propertyValueType != PropertyValueType.NO_VALUE
  ) {
    if (!isdef(timeLayer)) timeLayer = null;

    if (!isdef(useThisComp)) {
      var parentComp = DuAEProperty.getComp(parentProp);
      var childComp = DuAEProperty.getComp(childProp);

      useThisComp = parentComp.id == childComp.id;
    }

    //copy paste the animation / value
    var anim = DuAEProperty.getAnim(parentProp, false);
    if (anim != null)
      DuAEProperty.setAnim(childProp, anim, 0, true, true, false);

    // Expression
    var exp = [
      DuAEF.Duik.expressionIds.LINK,
      "var link = " +
        DuAEProperty.getExpressionLink(parentProp, useThisComp) +
        ";",
    ].join("\n");
    if (timeLayer != null) {
      exp += [
        "\nvar timeLayer = " + DuAEProperty.getExpressionLink(timeLayer) + ";",
        "var timeOffset = timeLayer.startTime;",
        "link.valueAtTime(time + timeOffset);",
      ].join("\n");
    } else {
      exp += "\nlink.value;";
    }

    //set the link
    DuAEProperty.setExpression(childProp, exp, false);
  } else {
    if (parentProp.isEffect) {
      var insideData = 0;
      for (var p = 1, num = childProp.numProperties; p <= num; p++) {
        var subProp = parentProp(p);
        if (subProp.propertyValueType == PropertyValueType.NO_VALUE) {
          if (subProp.name.toLowerCase() == "data") {
            insideData++;
            continue;
          }

          if (insideData > 0) {
            if (subProp.name == parentProp.name || subProp.name == "")
              insideData--;
            else insideData++;
            continue;
          }
        }

        if (insideData == 0)
          DuAEProperty.linkProperties(
            childProp(p),
            subProp,
            useThisComp,
            timeLayer,
          );
        else
          DuAEProperty.linkProperties(
            subProp,
            childProp(p),
            useThisComp,
            timeLayer,
          );
      }
    } else {
      for (var p = 1, num = childProp.numProperties; p <= num; p++) {
        try {
          DuAEProperty.linkProperties(
            childProp(p),
            parentProp(p),
            useThisComp,
            timeLayer,
          );
        } catch (e) {
          if (DuESF.debug)
            alert(
              childProp.name +
                " could not be linked.\nError at line: " +
                e.line +
                " in " +
                e.fileName +
                "\n" +
                e.description,
            );
        }
      }
    }
  }
};

/**
 * Removes all expressions found in groups or sections named "Data" in the property.
 * @static
 * @deprecated
 * @param {PropertyBase} prop - The property
 */
DuAEProperty.removeDataExpressions = function (prop) {
  if (
    prop.propertyType == PropertyType.PROPERTY &&
    prop.name.toLowerCase() == "data"
  ) {
    DuAEProperty.removeExpression(prop);
  } else if (prop.isEffect) {
    var insideData = 0;
    for (var p = 1, num = prop.numProperties; p <= num; p++) {
      var subProp = prop(p);
      if (subProp.propertyValueType == PropertyValueType.NO_VALUE) {
        if (subProp.name.toLowerCase() == "data") {
          insideData++;
          continue;
        }

        if (insideData > 0) {
          if (subProp.name == "" || subProp.name == prop.name) insideData--;
          else insideData++;
          continue;
        }
      }
      if (insideData > 0) DuAEProperty.removeExpression(subProp);
    }
  } else {
    if (prop.name.toLowerCase() == "data") DuAEProperty.removeExpressions(prop);
    for (var p = 1, num = prop.numProperties; p <= num; p++) {
      DuAEProperty.removeDataExpressions(prop(p));
    }
  }
};

/**
 * Removes all expressions found in the property.
 * @static
 * @deprecated
 * @param {PropertyBase} prop - The property
 * @param {function} filter - A function which takes a string as a parameter (the expression). Returns true if the expression has to be removed.
 * @param {bool} [keepPostExpressionValue=true] Set to false to just remove the expressions and get back the pre expression value
 */
DuAEProperty.removeExpressions = function (
  prop,
  filter,
  keepPostExpressionValue,
) {
  if (prop.propertyType == PropertyType.PROPERTY) {
    DuAEProperty.removeExpression(prop, filter, keepPostExpressionValue);
  } else {
    for (var p = 1, num = prop.numProperties; p <= num; p++) {
      DuAEProperty.removeExpressions(prop(p), filter, keepPostExpressionValue);
    }
  }
};
/**
 * Removes the expression from the property, keeping the post-expression value.
 * @static
 * @deprecated
 * @param {Property|DuAEProperty} prop - The property
 * @param {function} filter - A function which takes a string as a parameter (the expression). Returns true if the expression has to be removed.
 * @param {bool} [keepPostExpressionValue=true] Set to false to just remove the expressions and get back the pre expression value
 */
DuAEProperty.removeExpression = function (
  prop,
  filter,
  keepPostExpressionValue,
) {
  if (typeof prop === "undefined") return;
  keepPostExpressionValue = def(keepPostExpressionValue, true);

  var propInfo = new DuAEProperty(prop);
  prop = propInfo.getProperty();

  var expression = prop.expression;

  if (expression == "") return;
  if (typeof filter === "function") {
    if (!filter(expression)) return;
  }
  if (propInfo.riggable) {
    if (keepPostExpressionValue) DuAEProperty.setValue(prop, prop.value);
    prop.expression = "";
  }
};

/**
 * Recursilvely adds all the (supported) properties found to the essential graphics panel<br />
 * Note: any Property or PropertyGroup (and its subproperties) named "data" will be ignored.
 * @static
 * @deprecated
 * @param {PropertyBase} prop - The property
 * @return {int} The number of properties added
 */
DuAEProperty.addToEGP = function (prop) {
  var numProps = 0;
  if (prop.name.toLowerCase() == "data") return numProps;
  if (
    prop.propertyType == PropertyType.PROPERTY &&
    prop.propertyValueType != PropertyValueType.NO_VALUE
  ) {
    var comp = DuAEProperty.getComp(prop);
    var layer = DuAEProperty.getLayer(prop);
    //set the link
    if (
      prop.canAddToMotionGraphicsTemplate(comp) &&
      !prop.elided &&
      prop.canSetExpression
    ) {
      //get the name
      var mPropName =
        layer.name + " / " + DuAEProperty.getExpressionLink(prop, true, false);
      //add with name
      if (DuAE.version.version >= 16.1) {
        prop.addToMotionGraphicsTemplateAs(comp, mPropName);
      } else {
        prop.addToMotionGraphicsTemplate(comp);
      }

      //rename the master property if >=15.1 and < 16.1
      if (DuAE.version.version >= 15.1 && DuAE.version.version < 16.1) {
        var it = new DuList(comp.usedIn);
        it.do(function (mainComp) {
          //search the layer of the precomp
          for (var i = 1, num = mainComp.numLayers; i <= num; i++) {
            var l = mainComp.layer(i);
            if (l.source)
              if (l.source.id == comp.id) {
                l("ADBE Layer Overrides")(1).name = mPropName;
              }
          }
        });
      }
      numProps++;
    }
  } else {
    if (prop.isEffect) {
      var insideData = 0;
      for (var p = 1, num = prop.numProperties; p <= num; p++) {
        var subProp = prop(p);
        if (subProp.propertyValueType == PropertyValueType.NO_VALUE) {
          if (subProp.name.toLowerCase() == "data") {
            insideData++;
            continue;
          }

          if (insideData > 0) {
            if (subProp.name == prop.name) insideData--;
            else insideData++;
            continue;
          }
        }
        if (insideData == 0) numProps += DuAEProperty.addToEGP(subProp);
      }
    } else {
      for (var p = 1; p <= prop.numProperties; p++) {
        numProps += DuAEProperty.addToEGP(prop(p));
      }
    }
  }
  return numProps;
};

/**
 * Checks if the property has an animation (keyframes)
 * @static
 * @deprecated
 * @param {Property} prop - The property
 * @return {boolean} True if the property is animated
 */
DuAEProperty.isAnimated = function (prop) {
  if (prop.canVaryOverTime) {
    if (prop.numKeys > 0) return true;
  }
  return false;
};

/**
 * Gets the After Effects animated (with keyframes) properties in the propertyGroup
 * @static
 * @deprecated
 * @param {PropertyGroup}	 prop	- The parent propertyGroup where to search for animations
 * @param {PropertyType|PropertyValueType|string|function}	 [filter]	- A filter to get only a certain type, or value type, or property name or matchName.<br />
 * A function which take one PropertyBase as argument can be used to filter the properties: the Property will be returned if the function returns true.
 * @param {boolean}	[strict=false]	- If a string filter is provided, whether to search for the exact name/matchName or if it contains the filter.
 * @param {boolean}	[caseSensitive=true]	- If a string filter is provided, and not strict is false, does the search have to be case sensitive?
 * @return {DuAEProperty[]} The selected properties, an empty Array if nothing active or selected
 */
DuAEProperty.getAnimatedProps = function (prop, filter, strict, caseSensitive) {
  if (strict == undefined) strict = false;
  if (caseSensitive == undefined) caseSensitive = true;

  var props = [];

  if (!caseSensitive && typeof filter === "string")
    filter = filter.toLowerCase();

  if (
    prop.propertyType == PropertyType.PROPERTY &&
    prop.matchName != "ADBE Marker"
  ) {
    if (DuAEProperty.isAnimated(prop)) {
      if (!isdef(filter)) {
        props.push(prop);
      } else {
        var name = prop.name;
        var matchName = prop.matchName;
        if (!caseSensitive) {
          name = name.toLowerCase();
          matchName = matchName.toLowerCase();
        }

        if (strict && name === filter) props.push(prop);
        else if (strict && matchName === filter) props.push(prop);
        else if (typeof filter === "string") {
          if (name.indexOf(filter) >= 0) props.push(prop);
          else if (matchName.indexOf(filter) >= 0) props.push(prop);
        } else if (prop.propertyValueType == filter) props.push(prop);
        else if (typeof filter === "function") {
          if (filter(prop)) props.push(prop);
        }
      }
    }
  } else {
    for (var i = 0, num = prop.numProperties; i < num; i++) {
      props = props.concat(
        DuAEProperty.getAnimatedProps(
          prop.property(i + 1),
          filter,
          strict,
          caseSensitive,
        ),
      );
    }
  }

  return DuAE.getDuAEProperty(props);
};

/**
 * Gets the value range of the animated property.<br >
 * The property type must be one of: one D, two D, three D (spatial or not), Color.
 * If the property is not one of these types, returns an empty Array.
 * @static
 * @deprecated
 * @param {Property|DuAEProperty}	 prop	- The property
 * @param {int}	 [axis=0]	- The axis (or the color channel) to get the range
 * @param {bool}	 [preExpression=true]	- True to get the range from keyframes instead of the result of the exression
 * @param {bool}	 [fastMode=true]	- True to check the range with values only at keyframe times. False to check the range with all values, at each frame of the comp.
 * @return {float[]} The minimum and maximum value.<br />
 * The first item in the Array is not necesarily the lowest value, it is the first in time.
 */
DuAEProperty.getRange = function (prop, axis, preExpression, fastMode) {
  axis = def(axis, 0);
  preExpression = def(preExpression, true);
  fastMode = def(fastMode, true);

  var propInfo = new DuAEProperty(prop);
  prop = propInfo.getProperty();

  if (!propInfo.numerical) return [];

  if (prop.expression == "" || !prop.expressionEnabled) preExpression = true;

  var comp = propInfo.comp;
  var frames = comp.duration / comp.frameDuration;
  var min = prop.valueAtTime(0, preExpression);
  var minTime = 0;
  var max = prop.valueAtTime(0, preExpression);
  var maxTime = 0;

  if (propInfo.dimensions > 1) {
    max = max[axis];
    min = min[axis];
  }

  var count = frames - 1;
  if (fastMode && prop.numKeys > 1) count = prop.numKeys;
  else count = comp.duration / 4;

  if (count == 0) return [min, max];
  if (prop.numKeys < 2 && preExpression) return [min, max];

  for (var i = 0; i < count; i++) {
    var iTime = i * 0.25;
    if (fastMode && prop.numKeys > 1) iTime = prop.keyTime(i + 1);
    var val = prop.valueAtTime(iTime, preExpression);
    if (propInfo.dimensions > 1) val = val[axis];
    if (val < min) {
      min = val;
      minTime = i;
    }
    if (val > max) {
      max = val;
      maxTime = i;
    }
  }

  if (minTime < maxTime) return [min, max];
  else return [max, min];
};

/**
 * Gets the maximum velocity of the animated property.<br >
 * The property type must be one of: one D, two D, three D (spatial or not), Color.
 * If the property is not one of these types, returns 0.
 * @static
 * @deprecated
 * @param {Property|DuAEProperty}	 prop	- The property
 * @param {bool}	 [preExpression=true]	- True to get the velocity from keyframes instead of the result of the exression
 * @param {bool}	 [fastMode=true]	- True to limit the number of samples used to compute the velocity and make the process faster.<br />
 * The number of samples is automatically adapted from the duration of the composition.<br />
 * When true and if there are more than one keyframe, the velocity is sampled only between keyframes.
 * @return {float} The velocity.
 */
DuAEProperty.getMaxVelocity = function (prop, preExpression, fastMode) {
  preExpression = def(preExpression, true);
  fastMode = def(fastMode, true);

  var propInfo = prop;
  if (!(prop instanceof DuAEProperty)) {
    propInfo = new DuAEProperty(prop);
  } else {
    prop = propInfo.getProperty();
  }

  var velocity = 0;
  if (!propInfo.numerical) return velocity;

  if (prop.expression == "") preExpression = true;

  var comp = propInfo.comp;
  var frames = comp.duration / comp.frameDuration;

  var startFrame = 0;
  var endFrame = frames;
  var step = 1;
  if (fastMode) {
    if (prop.numKeys > 1) {
      startFrame = prop.keyTime(1) / comp.frameDuration;
      endFrame = prop.keyTime(prop.numKeys) / comp.frameDuration;
    }
  }

  var numFrames = endFrame - startFrame;

  if (numFrames > 1000 && fastMode) {
    step = Math.floor(numFrames / 500);
  }

  for (var i = startFrame; i < endFrame; i = i + step) {
    var vel = DuAEProperty.getSpeed(
      prop,
      i * comp.frameDuration,
      preExpression,
    );
    if (vel > velocity) velocity = vel;
  }

  return velocity;
};

/**
 * Bézier Path methods
 * @namespace
 */
DuAEBezier = {};

/**
 * Scriptifies the given shape property.<br/>
 * @static
 * @deprecated
 * @param {Property}	 [shapeProp]	- The path property to export
 * @param {boolean}	[offsetToCenter=false]	- If true, offset the path to the center
 * @param {string}	[varName=shape]	- A name for the variable storing the shape
 * @return {string} The scriptified shape
 */
DuAEBezier.scriptify = function (pathProperty, offsetToCenter, varName) {
  if (pathProperty instanceof DuAEProperty)
    pathProperty = pathProperty.getProperty();
  offsetToCenter = def(offsetToCenter, false);
  varName = def(varName, "shape");

  if (pathProperty.propertyType !== PropertyType.PROPERTY)
    throw "Expected a shape property, got a group.";
  if (pathProperty.propertyValueType !== PropertyValueType.SHAPE)
    throw "Expected a shape property, got another type of value.";
  offsetToCenter = def(offsetToCenter, false);

  var shape = pathProperty.value;
  var vertices = shape.vertices;

  if (offsetToCenter) {
    //get center and offset
    var sum = [0, 0];
    for (var i = 0; i < vertices.length; i++) {
      sum[0] += vertices[i][0];
      sum[1] += vertices[i][1];
    }
    var center = sum / vertices.length;
    //adjust values
    for (var i = 0; i < vertices.length; i++) {
      vertices[i][0] -= center[0];
      vertices[i][1] -= center[1];
    }
  }

  var verticesStr = vertices.toSource();
  var inTangentsStr = shape.inTangents.toSource();
  var outTangentsStr = shape.outTangents.toSource();
  var closedStr = shape.closed ? "true" : "false";

  var scriptified = [
    "var " + varName + " = new Shape();",
    varName + ".vertices = " + verticesStr + ";",
    varName + ".inTangents = " + inTangentsStr + ";",
    varName + ".outTangents = " + outTangentsStr + ";",
    varName + ".closed = " + closedStr + ";",
  ].join("\n");

  return scriptified;
};

/**
 * Export the given shape property to the given file <br/>
 * The file name in the given path will be used to name the shape in the jsx code
 * @static
 * @deprecated
 * @example
 * var props = DuAEComp.getSelectedProps(PropertyValueType.SHAPE);
 * var prop = props[0].getProperty();
 * var out = DuAEProperty.Shape.exportToJsxinc(prop, "D:/shape.test");
 * @param {Property}	 [shapeProp]	- The path property to export
 * @param {String}	[file]	- The path or File where the jsxinc shape will be written
 * @param {boolean}	[offsetToCenter=false]	- If true, offset the path to the center
 * @param {boolean}	[append=false]	- If true, appends the shape at the end of the file instead of overwriting it.
 * @param {string}	[varName=shape]	- A name for the variable storing the shape
 * @return {int} A status code. [0: success, ...]
 */
DuAEBezier.exportToJsxinc = function (
  pathProperty,
  file,
  offsetToCenter,
  append,
  varName,
) {
  append = def(append, false);

  if (!(file instanceof File)) file = new File(file);

  var mode = "w";
  if (append) mode = "a";

  if (!file.open(mode)) return 3;

  if (append) file.write("\n");
  file.write(DuAEBezier.scriptify(pathProperty, offsetToCenter, varName));

  file.close();
  return 0;
};

/**
 * Makes a horizontal symetry transformation on the paths, using the same axis of symetry for all shapes (shapes must be on the same layer).
 * @static
 * @deprecated
 * @param {Property[]}	pathProperties	- The After Effects Properties containing the paths to symetrize
 */
DuAEBezier.horizontalSymetry = function (pathProperties) {
  if (!(pathProperties instanceof Array)) pathProperties = [pathProperties];

  var shapes = [];
  //get shapes and center
  var center = 0;
  var verticesCount = 0;
  for (var i = 0; i < pathProperties.length; i++) {
    var prop = pathProperties[i];
    if (prop instanceof DuAEProperty) prop = prop.getProperty();
    var shape = prop.value;
    shapes.push(shape);
    for (var j = 0; j < shape.vertices.length; j++) {
      verticesCount++;
      center += shape.vertices[j][0];
    }
  }
  center = center / verticesCount;
  center = center * 2;

  //compute
  for (var i = 0; i < shapes.length; i++) {
    var prop = pathProperties[i];
    if (prop instanceof DuAEProperty) prop = prop.getProperty();
    var shape = shapes[i];
    var vertices = shape.vertices;
    var inTangents = shape.inTangents;
    var outTangents = shape.outTangents;
    for (var j = 0; j < shape.vertices.length; j++) {
      vertices[j][0] = center - vertices[j][0];
      inTangents[j][0] = -inTangents[j][0];
      outTangents[j][0] = -outTangents[j][0];
    }
    shape.vertices = vertices;
    shape.inTangents = inTangents;
    shape.outTangents = outTangents;
    if (prop.numKeys > 0) {
      prop.setValueAtTime(DuAEProperty.getComp(prop).time, shape);
    } else {
      prop.setValue(shape);
    }
  }
};

/**
 * Makes a vertical symetry transformation on the paths, using the same axis of symetry for all shapes (shapes must be on the same layer).
 * @static
 * @deprecated
 * @param {Property[]}	pathProperties	- The After Effects Properties containing the paths to symetrize
 */
DuAEBezier.verticalSymetry = function (pathProperties) {
  if (!(pathProperties instanceof Array)) pathProperties = [pathProperties];

  var shapes = [];
  //get shapes and center
  var center = 0;
  var verticesCount = 0;
  for (var i = 0; i < pathProperties.length; i++) {
    var prop = pathProperties[i];
    if (prop instanceof DuAEProperty) prop = prop.getProperty();
    var shape = prop.value;
    shapes.push(shape);
    for (var j = 0; j < shape.vertices.length; j++) {
      verticesCount++;
      center += shape.vertices[j][1];
    }
  }
  center = center / verticesCount;
  center = center * 2;

  //compute
  for (var i = 0; i < shapes.length; i++) {
    var prop = pathProperties[i];
    if (prop instanceof DuAEProperty) prop = prop.getProperty();
    var shape = shapes[i];
    var vertices = shape.vertices;
    var inTangents = shape.inTangents;
    var outTangents = shape.outTangents;
    for (var j = 0; j < shape.vertices.length; j++) {
      vertices[j][1] = center - vertices[j][1];
      inTangents[j][1] = -inTangents[j][1];
      outTangents[j][1] = -outTangents[j][1];
    }
    shape.vertices = vertices;
    shape.inTangents = inTangents;
    shape.outTangents = outTangents;
    if (prop.numKeys > 0) {
      prop.setValueAtTime(DuAEProperty.getComp(prop).time, shape);
    } else {
      prop.setValue(shape);
    }
  }
};

/**
 * Gets the vertices array in comp coordinates.
 * @static
 * @deprecated
 * @param {Property|DuAEProperty} prop - The property, a bezier path.
 * @return {float[][]} The vertices in comp coordinates.
 */
DuAEBezier.verticesToComp = function (pathProperty) {
  var propInfo = DuAEBezier.checkProperty(pathProperty);
  if (!propInfo) throw "Expected a shape property, got another type of value.";
  var pathProperty = propInfo.getProperty();

  //get the layer matrix
  var matrix = DuAEShapeLayer.getTransformMatrix(propInfo);

  //apply transform
  var vertices = [];
  var origin = pathProperty.value.vertices;
  for (var i = 0, num = origin.length; i < num; i++) {
    vertices.push(matrix.applyToPoint(origin[i]));
  }

  return vertices;
};

/**
 * Checks if the property is a bezier property, or return the child bezier property if this is a shape or a mask
 * @static
 * @deprecated
 * @param {Property|DuAEProperty} prop - The property
 * @return {DuAEProperty|null} the bezier property or null if it is not.
 */
DuAEBezier.checkProperty = function (prop) {
  propInfo = new DuAEProperty(prop);
  prop = propInfo.getProperty();

  //get the path property in case it was a mask or a shape path selected
  if (prop.matchName == "ADBE Vector Shape - Group") {
    prop = prop.property("ADBE Vector Shape");
    return new DuAEProperty(prop);
  } else if (prop.matchName == "ADBE Mask Atom") {
    prop = prop.property("ADBE Mask Shape");
    return new DuAEProperty(prop);
  } else if (prop.propertyType !== PropertyType.PROPERTY) return null;
  if (prop.propertyValueType !== PropertyValueType.SHAPE) return null;

  return propInfo;
};
