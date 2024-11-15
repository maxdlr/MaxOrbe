﻿/**
 * Constructs a new DuAEProperty
 * @example
 * var propInfo = new DuAEProperty(property);
 * layer("ADBE effect parade").addProperty("ADBE layer control"); //now the property object is broken
 * property = propInfo.getProperty(); // You can retrieve the property like this, fixed if it's an effect
 * @class DuAEProperty
 * @classdesc Get some handy informations about a property<br />
 * This class is able to "fix" effects properties which have been broken by
 * the addition of another effect on the same layer, as long as the class has been
 * instanciated before the effect has been broken.<br />
 * Some methods in this class (but not all) are recursive: they can be run even if the property is a group containing other properties.
 * @param {PropertyBase|DuAEProperty} property - The property. If a DuAEProperty is provided, the constructor returns it (it does not make a copy).<br />
 * This makes it easy to avoid type checking, as you can always pass any property or DuAEProperty to the constructor to be sure to handle a DuAEProperty, without any impact on performance.<br />
 * @example
 * myFunction (prop) //This function can be passed either a property or a DuAEProperty
 * {
 *   propInfo = new DuAEProperty(prop);
 *   prop = propInfo.getProperty();
 * }
 * @category DuAEF
 */
function DuAEProperty(property) {
  if (property instanceof DuAEProperty) return property;
  if (!isdef(property)) {
    DuDebug.throwTypeError(
      property,
      "property",
      "Property",
      "DuAEProperty(property)",
    );
    return;
  }

  var expressionEnabled = property.expressionEnabled;

  this.property = property;
  /**
   * The original name of the property, same as DuAEProperty.getProperty().name
   * @memberof DuAEProperty.prototype
   * @name name
   * @readonly
   * @type {string}
   */
  this.name = property.name;
  /**
   * The original matchName of the property, same as DuAEProperty.getProperty().matchName
   * @memberof DuAEProperty.prototype
   * @name matchName
   * @readonly
   * @type {string}
   */
  this.matchName = property.matchName;
  /**
   * The original property index of the property, same as DuAEProperty.getProperty().propertyIndex
   * @memberof DuAEProperty.prototype
   * @name name
   * @readonly
   * @type {int}
   */
  this.index = property.propertyIndex;
  this.propertyIndex = property.propertyIndex;
  /**
   * Is this an effect? same as DuAEProperty.getProperty().isEffect
   * @memberof DuAEProperty.prototype
   * @name isEffect
   * @readonly
   * @type {Boolean}
   */
  this.isEffect = property.isEffect;
  /**
   * The containing effect, if any.
   * @memberof DuAEProperty.prototype
   * @name effect
   * @readonly
   * @type {PropertyGroup|null}
   */
  this.effect = null;
  if (this.isEffect) this.effect = property;
  /**
   * The containing layer
   * @memberof DuAEProperty.prototype
   * @name layer
   * @readonly
   * @type {Layer}
   */
  this.layer = null;

  // Get layer and effect
  // And generate some kind of unique ID
  var parentProp = property;
  this.parentIndices = [];
  var id = "";
  while (parentProp.parentProperty) {
    var isEffect = parentProp.isEffect;
    if (isEffect) {
      this.isEffect = true;
      this.effect = parentProp;
    }

    // If not the layer, keep index
    this.parentIndices.unshift(parentProp.propertyIndex);

    id += parentProp.propertyIndex;

    // Traverse up the property tree
    parentProp = parentProp.parentProperty;
  }
  this.layer = parentProp;

  /**
   * The containing comp
   * @memberof DuAEProperty.prototype
   * @name comp
   * @readonly
   * @type {CompItem}
   */
  this.comp = this.layer.containingComp;

  // Recent versions of Ae have an id attribute, use it
  if (typeof property.id !== "undefined") id = property.id;
  else {
    id += this.comp.id;
    id = parseInt(id);
  }
  this.id = id;
}

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Recursively runs a method on all nested properties
 * @param {function} func The function to run. It must take a DuAEProperty object as its single argument
 */
DuAEProperty.prototype.do = function (func) {
  if (this.getProperty().propertyType == PropertyType.PROPERTY) {
    func(this);
  } else {
    for (var p = 1, num = this.numProperties(); p <= num; p++) {
      this.prop(p).do(func);
    }
  }
};

/**
 * Checks if this source property is a group of properties or a property
 * @return {Boolean} True if it's a group
 */
DuAEProperty.prototype.isGroup = function () {
  // Already checked
  if (typeof this.__isGroup !== "undefined") return this.__isGroup;
  // Check
  var p = this.getProperty();
  if (p.propertyType == PropertyType.PROPERTY) {
    this.__isGroup = false;
  } else {
    this.__isGroup = true;
  }
  return this.__isGroup;
};

/**
 * Checks if this source property is a group of properties or a property
 * @return {Boolean} True if it's a property
 */
DuAEProperty.prototype.isProperty = function () {
  return !this.isGroup();
};

/**
 * Reimplements the <code>Property.isSpatial</code> attribute for convenience.
 * @return {Boolean} true if the property is spatial.
 */
DuAEProperty.prototype.isSpatial = function () {
  if (this.isGroup()) return false;
  return this.getProperty().isSpatial;
};

/**
 * Gets the root property group (the group just before the layer, e.g. transform, effects, masks, content...) containing the property
 * @return {PropertyGroup} The property group
 */
DuAEProperty.prototype.rootPropertyGroup = function () {
  var parentProp = this.getProperty();
  var rootProp = null;
  while (parentProp.parentProperty) {
    rootProp = parentProp;
    // Traverse up the property tree
    parentProp = parentProp.parentProperty;
  }
  /* @ts-ignore The root is a PropertyGroup */
  return rootProp;
};

/**
 * Reimplements the <code>Property.isSeparationLeader</code> attribute for convenience.
 * @return {Bool} true if the property is a separation leader.
 */
DuAEProperty.prototype.isSeparationLeader = function () {
  if (this.isGroup()) return false;
  return this.getProperty().isSeparationLeader;
};

/**
 * Reimplements the <code>Property.dimensionsSeparated</code> attribute for convenience.
 * @return {Bool} true if the property is a separation leader and has its dimensions seperated.
 */
DuAEProperty.prototype.dimensionsSeparated = function () {
  if (this.isGroup()) return false;
  if (!this.isSeparationLeader()) return false;
  return this.getProperty().dimensionsSeparated;
};

/**
 * Reimplements the <code>Property.expression</code> attribute for convenience.
 * @return {string} the expression.
 */
DuAEProperty.prototype.expression = function () {
  if (this.isGroup()) return "";
  return this.getProperty().expression;
};

/**
 * Reimplements the <code>Property.value</code> attribute for convenience.
 * @param {Bool} [preExpression = false] Set to true to get the pre-expression value.
 * @return {*} A value appropriate for the type of the property (see Property.propertyValueType), or null if the property doesn't have a value (i.e. it's a group)
 */
DuAEProperty.prototype.value = function (preExpression) {
  if (this.isGroup()) return null;
  preExpression = def(preExpression, false);

  var v;
  if (preExpression) v = this.getProperty().valueAtTime(this.comp.time, true);
  else v = this.getProperty().value;

  v = this.fixValue(v);

  return v;
};

/**
 * Reimplements the <code>Property.expressionEnabled</code> attribute for convenience.
 * @return {boolean} When true, the named property uses its associated expression to generate a value.<br>
 * When false, the keyframe information or static value of the property is used. This attribute can be set to true only if canSetExpression for the named property is true and expression contains a valid expression string.
 */
DuAEProperty.prototype.expressionEnabled = function (preExpression) {
  if (this.isGroup()) return false;

  return this.getProperty().expressionEnabled;
};

/**
 * Reimplements the <code>Property.valueAtTime</code> mehtod for convenience.
 * @param {float} [time] If omitted, the current comp time.
 * @param {Bool} [preExpression = false] Set to true to get the pre-expression value.
 * @return {*} A value appropriate for the type of the property (see Property.propertyValueType), or null if the property doesn't have a value (i.e. it's a group)
 */
DuAEProperty.prototype.valueAtTime = function (time, preExpression) {
  if (this.isGroup()) return null;
  preExpression = def(preExpression, false);
  time = def(time, this.comp.time);

  var d = this.dimensions();
  var v = this.getProperty().valueAtTime(time, preExpression);
  v = this.fixValue(v);
  return v;
};

/**
 * Reimplements the <code>Property.selectedKeys</code> attribute for convenience.
 * @param {Boolean} [asObject=false] If true, returns {@link DuAEKeyframe} objects instead of key indices
 * @return {int[]} The list of selected keyframe indices.
 */
DuAEProperty.prototype.selectedKeys = function (asObject) {
  if (this.isGroup()) return [];
  asObject = def(asObject, false);
  var prop = this.getProperty();
  var ks = prop.selectedKeys;
  if (!asObject) return ks;
  var keys = [];
  for (var k = 0, nk = ks.length; k < nk; k++) {
    keys.push(this.keyAtIndex(ks[k]));
  }
  return keys;
};

/**
 * Reimplements the <code>Property.keyTime</code> method for convenience.
 * @param {int} index The index of the keyframe.
 * @return {float} The time of the key.
 */
DuAEProperty.prototype.keyTime = function (index) {
  if (this.isGroup()) return 0;
  var prop = this.getProperty();
  return prop.keyTime(index);
};

/**
 * Reimplements the <code>Property.keyValue</code> method for convenience.
 * @param {int} index The index of the keyframe.
 * @return {*} The value of the key.
 */
DuAEProperty.prototype.keyValue = function (index) {
  if (this.isGroup()) return 0;
  var prop = this.getProperty();
  return prop.keyValue(index);
};

/**
 * Reimplements the <code>Property.keyValue</code> method for convenience.
 * @param {int} index The index of the keyframe.
 * @return {*} The value of the key.
 */
DuAEProperty.prototype.keyLabel = function (index) {
  // Doesn't exist in all versions
  if (jstype(prop.keyLabel) === "undefined") return 0;
  if (this.isGroup()) return 0;
  var prop = this.getProperty();
  return prop.keyLabel(index);
};

/**
 * Reimplements the <code>Property.removeKey</code> method for convenience.
 * @param {int|DuAEKeyframe} key The index or the keyframe.
 */
DuAEProperty.prototype.removeKey = function (key) {
  if (this.isGroup()) return;

  if (key instanceof DuAEKeyframe) key = key._index;

  var prop = this.getProperty();
  prop.removeKey(key);
};

/**
 * Reimplements the <code>Property.nearestKeyIndex</code> method for convenience.
 * @param {float} t The time of the keyframe.
 */
DuAEProperty.prototype.nearestKeyIndex = function (t) {
  if (this.isGroup()) return 0;
  var prop = this.getProperty();
  return prop.nearestKeyIndex(t);
};

/**
 * Gets the index of the key just before the given time
 * @param {float} t The time of the keyframe.
 */
DuAEProperty.prototype.keyIndexBefore = function (t) {
  if (this.isGroup()) return 0;
  var prop = this.getProperty();
  if (prop.numKeys == 0) return 0;
  var keyIndex = prop.nearestKeyIndex(t);
  if (prop.keyTime(keyIndex) < t) return keyIndex;
  return keyIndex - 1;
};

/**
 * Gets the index of the key just after the given time
 * @param {float} t The time of the keyframe.
 */
DuAEProperty.prototype.keyIndexAfter = function (t) {
  if (this.isGroup()) return 0;
  var prop = this.getProperty();
  if (prop.numKeys == 0) return 0;
  var keyIndex = prop.nearestKeyIndex(t);
  if (prop.keyTime(keyIndex) > t) return keyIndex;
  if (keyIndex == prop.numKeys) return 0;
  return keyIndex + 1;
};

/**
 * Gets the unit of the property
 * @return {string} The unit
 */
DuAEProperty.prototype.unit = function () {
  if (typeof this.__unit !== "undefined") return this.__unit;

  var prop = this.getProperty();
  this.__unitsText = prop.unitsText;
  this.__isPercent =
    this.__unitsText ==
    localize("$$$/AE/TLW/GraphEditor/PercentSource=percent");
  this.__isAngle =
    this.__unitsText ==
    localize("$$$/AE/TLW/GraphEditor/DegreesSource=degrees");
  this.__isPixels =
    this.__unitsText == localize("$$$/AE/TLW/GraphEditor/PixelsSource=pixels");
  this.__unit = "";
  if (this.__isPercent) this.__unit = "%";
  if (this.__isAngle) this.__unit = "\u00B0";
  if (this.__isPixels)
    this.__unit = localize("$$$/AE/TLW/GraphEditor/PixelsDest=px");
  return this.__unit;
};

/**
 * The units text of the property, same as DuAEProperty.getProperty().unitsText
 * @return {string} The unit
 */
DuAEProperty.prototype.unitsText = function () {
  this.unit();
  return this.__unitsText;
};

/**
 * Whether the value is a percent
 * @return {Boolean}
 */
DuAEProperty.prototype.isPercent = function () {
  this.unit();
  return this.__isPercent;
};

/**
 * Whether the value is an angle
 * @return {Boolean}
 */
DuAEProperty.prototype.isAngle = function () {
  this.unit();
  return this.__isAngle;
};

/**
 * Whether the value is a pixel value
 * @return {Boolean}
 */
DuAEProperty.prototype.isPixels = function () {
  this.unit();
  return this.__isPixels;
};

/**
 * Check if this is a dropdown property or effect.<br />
 * Note: On After Effects < 17.0.1 this always returns false.
 * @return {Boolean}
 */
DuAEProperty.prototype.isDropdown = function () {
  if (typeof this.__isDropdown !== "undefined") return this.__isDropdown;

  if (this.isGroup()) {
    this.__isDropdown = false;
    return this.__isDropdown;
  }

  if (DuAE.version.atLeast("17.0.1")) {
    this.__isDropdown = this.getProperty().isDropdownEffect;
    return this.__isDropdown;
  }

  this.__isDropdown = false;
  return this.__isDropdown;
};

/**
 * Gets the number of keyframes in the property
 * @param {Boolean} [recursive=true] If true and this is a group, returns the number of keyframes of all contained property
 * @return {int}
 */
DuAEProperty.prototype.numKeys = function (recursive) {
  recursive = def(recursive, true);
  if (!recursive && this.isGroup()) return 0;

  var prop = this.getProperty();

  var numKeys = 0;

  if (prop.propertyType == PropertyType.PROPERTY) {
    return prop.numKeys;
  } else {
    for (var p = 1, num = this.numProperties(); p <= num; p++) {
      numKeys += this.prop(p).numKeys();
    }
  }

  return numKeys;
};

/**
 * Checks if this property has some keyframes
 * @param {Boolean} [recursive=true] If true and this is a group, checks all contained properties
 * @return {Boolean}
 */
DuAEProperty.prototype.hasKeys = function (recursive) {
  recursive = def(recursive, true);
  if (!recursive && this.isGroup()) return false;
  if (this.matchName == "ADBE Marker") return false;

  var prop = this.getProperty();

  if (prop.propertyType == PropertyType.PROPERTY) {
    if (prop.numKeys > 0) return true;
  } else {
    for (var p = 1, num = this.numProperties(); p <= num; p++) {
      if (this.prop(p).hasKeys()) return true;
    }
  }

  return false;
};

/**
 * Checks if this property has some expressions
 * @param {Boolean} [recursive=true] If true and this is a group, checks all contained properties
 * @return {Boolean}
 */
DuAEProperty.prototype.hasExpressions = function (recursive) {
  recursive = def(recursive, true);
  if (!recursive && this.isGroup()) return false;

  var prop = this.getProperty();

  if (prop.propertyType == PropertyType.PROPERTY) {
    if (prop.expression != "") return true;
  } else {
    for (var p = 1, num = this.numProperties(); p <= num; p++) {
      if (this.prop(p).hasExpressions()) return true;
    }
  }

  return false;
};

/**
 * Reimplements the <code>PropertyGroup.numProperties</code> attribute.<br />
 * Use this to be sure to get the right number of props, in case some have been added or removed after the creation of the DuAEProperty object.
 * @return {int} The number of sub-properties.
 */
DuAEProperty.prototype.numProperties = function () {
  var prop = this.getProperty();
  if (prop.propertyType === PropertyType.PROPERTY) return 0;
  else return prop.numProperties;
};

/**
 * Reimplements the <code>PropertyGroup.setSelectedAtKey</code> method.
 * @param {int|DuAEKeyframe} key The key to (un)select
 * @param {Boolean} [selected=true] Whether to select or unselect
 */
DuAEProperty.prototype.setSelectedAtKey = function (key, selected) {
  if (this.isGroup()) return;
  if (key instanceof DuAEKeyframe) key = key._index;
  var prop = this.getProperty();
  prop.setSelectedAtKey(key, def(selected, true));
};

/**
 * Reimplements the <code>PropertyGroup.property()</code> method for convenience.
 * @param {string|int} index Either the name, matchName or the index.
 * @return {DuAEProperty|null} The sub-property as DuAEProperty object or null if not found.
 */
DuAEProperty.prototype.prop = function (index) {
  var prop = this.getProperty();
  if (prop.propertyType === PropertyType.PROPERTY) return null;
  return new DuAEProperty(prop.property(index));
};

/**
 * Getter for the <code>PropertyBase.parentProperty</code> attribute for convenience.
 * @return {DuAEProperty|null} The parent property or null if not found.
 */
DuAEProperty.prototype.parentProperty = function () {
  return new DuAEProperty(this.getProperty().parentProperty);
};

/**
 * Reimplements the <code>Property.setPropertyParameters()</code> method.<br/>
 * <p>Works around issues caused by the AE API:<br/>
 * - The property object is invalidated (-> fix: use of DuAEProperty.getProperty)<br/>
 * - The effect loses its name (-> fix: name is reset afterwards)<br/>
 * - Names are not sanitized and may throw errors (-> fix: names are sanitized so no errors are thrown)<br/>
 * - Throws an error on AE < 17.0.1 (-> fix: just do nothing in this case)</p>
 * This method can be called either from the actual Property or its containing effect.
 * @param {string[]} names The list of names.
 */
DuAEProperty.prototype.setPropertyParameters = function (names) {
  if (!DuAE.version.atLeast("17.0.1")) return;
  var p = null;
  if (this.isGroup()) p = this.prop(1);
  else p = this;
  if (!p) return;
  // Sanitize names
  for (var i = 0, n = names.length; i < n; i++) {
    var n = names[i];
    n = DuString.replace(n, "|", "/");
    n = DuString.trim(n);
    if (n == "") n = "-";
    // Must be unique
    names[i] = "***Duik Temp Name***";
    n = DuString.generateUnique(n, names);
    names[i] = n;
  }
  var effect = p.parentProperty();
  var name = effect.name;
  p.getProperty().setPropertyParameters(names);
  effect = p.parentProperty().getProperty();
  effect.name = name;
};

/**
 * Gets the original Property<br />
 * Always works even if this DuAEProperty represents an effect which has been broken<br />
 * ---AE Hack---
 * @memberof DuAEProperty
 * @return {PropertyBase} The property
 * @todo When returning an effect, check if the matchName corresponds too.
 */
DuAEProperty.prototype.getProperty = function () {
  // If the property is still valid, just return it
  if (Object.isValid(this.property)) return this.property;

  var parentProp = this.layer;
  for (var i = 0, n = this.parentIndices.length; i < n; i++) {
    parentProp = parentProp.property(this.parentIndices[i]);
  }
  this.property = parentProp;
  return this.property;
};

/**
 * Gets the number of dimensions of a property
 * @return {int}	The number of dimensions, 0 if this is not a dimensionnal value (ie color, text, shape...)
 */
DuAEProperty.prototype.dimensions = function () {
  // Already checked
  if (typeof this.__dimensions !== "undefined") return this.__dimensions;

  var prop = this.getProperty();

  this.__dimensions = 0;
  if (
    prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL ||
    prop.propertyValueType == PropertyValueType.ThreeD
  ) {
    //if this is a position or scale and the layer is not 3D, AFX uses a 3D value in the position (with 0 as Z position), but the expression must return a 2D value.......
    if (
      (prop.matchName == "ADBE Scale" || prop.matchName == "ADBE Position") &&
      !this.layer.threeDLayer
    ) {
      this.__dimensions = 2;
    } else {
      this.__dimensions = 3;
    }
  } else if (
    prop.propertyValueType == PropertyValueType.TwoD_SPATIAL ||
    prop.propertyValueType == PropertyValueType.TwoD
  ) {
    this.__dimensions = 2;
  } else if (prop.propertyValueType == PropertyValueType.OneD) {
    this.__dimensions = 1;
  } else if (prop.propertyValueType == PropertyValueType.COLOR) {
    this.__dimensions = 4;
  }
  return this.__dimensions;
};

/**
 * Checks if this property value can be edited
 * @return {bool} true if the value of the property can be edited, false otherwise
 */
DuAEProperty.prototype.editable = function () {
  var prop = this.getProperty();

  if (prop.propertyType != PropertyType.PROPERTY) return false;
  if (prop.elided) return false;
  if (prop.dimensionsSeparated) return false;
  if (!prop.canVaryOverTime) return false;
  if (prop.propertyValueType == PropertyValueType.NO_VALUE) return false;
  if (prop.propertyValueType == PropertyValueType.CUSTOM_VALUE) return false;
  if (prop.propertyValueType == PropertyValueType.LAYER_INDEX) return false;
  if (prop.propertyValueType == PropertyValueType.MASK_INDEX) return false;
  try {
    if (typeof prop.value === "undefined") return false;
  } catch (e) {
    return false;
  }

  if (this.isMasterProperty(prop)) return true;

  //TODO find a way to detect if prop is hidden without using a try/catch and without setting a value
  //try to set a value if there's no keyframe
  if (prop.numKeys == 0) {
    try {
      prop.setValueAtTime(0, prop.valueAtTime(0, true));
      prop.removeKey(1);
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
 * @return {Boolean} true if property is part of the master properties
 */
DuAEProperty.prototype.isMasterProperty = function () {
  var prop = this.getProperty();
  while (prop.parentProperty !== null) {
    if (prop.matchName == "ADBE Layer Overrides") return true;
    prop = prop.parentProperty;
  }
  return false;
};

/**
 * Checks if this property value can be rigged (with an expression)
 * @return {bool} true if the value of the property can be rigged, false otherwise
 */
DuAEProperty.prototype.riggable = function () {
  var prop = this.getProperty();

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
 * @param {int}	keyIndex The index of the key to retrieve. If the index is negative, it is counted from the end i.e. to retrieve the keyframe before the last one, use -2 (-1 is the last)
 * @return {DuAEKeyframe}	The keyframe, or null if incorrect index
 */
DuAEProperty.prototype.keyAtIndex = function (keyIndex) {
  var prop = this.getProperty();
  if (Math.abs(keyIndex) > prop.numKeys || keyIndex == 0) {
    return null;
  }
  if (keyIndex < 0) {
    keyIndex = prop.numKeys - keyIndex + 1;
  }

  var key = new DuAEKeyframe();
  key._time = prop.keyTime(keyIndex);
  if (prop.propertyValueType == PropertyValueType.TEXT_DOCUMENT) {
    key.value = prop.keyValue(keyIndex).text;
  } else {
    key.value = prop.keyValue(keyIndex);
  }
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
  // Doesn't exist in all versions
  if (jstype(prop.keyLabel) === "function") key.label = prop.keyLabel(keyIndex);

  return key;
};

/**
 * Gets the nearest key at a given time on a property
 * @param {float}	[time]	- The time of the key to retrieve. The current time by default.
 * @return {DuAEKeyframe|null}	The keyframe, or null if incorrect time or not found
 */
DuAEProperty.prototype.nearestKeyAtTime = function (time) {
  time = def(time, this.comp.time);
  var prop = this.getProperty();
  return this.keyAtIndex(prop.nearestKeyIndex(time));
};

/**
 * Gets the key at an exactly given time on a property
 * @param {float}	time	- The time of the key to retrieve.
 * @return {DuAEKeyframe}	The keyframe, or null if incorrect time
 */
DuAEProperty.prototype.keyAtTime = function (time) {
  var prop = this.getProperty();
  if (!prop.canVaryOverTime) return null;
  if (prop.numKeys == 0) return null;
  var key = this.keyAtIndex(prop.nearestKeyIndex(time));
  if (key === null) return key;
  if (DuMath.equals(key._time, time, 4)) return key;
  else return null;
};

/**
 * Gets the property keyframes in the whole timeline or in the time range<br />
 * The DuAEKeyframe._time will be adjusted relatively to the start of the time range instead of the startTime of the composition.
 * @param {boolean}	[selected=false]	- true to get only selected keyframes.
 * @param {float[]}	[timeRange]	- The time range, an array of two time values, in seconds. If not provided, will use the comp time range.<br />
 * Ignored if selected is true;
 * @return {DuAEKeyframe[]}	The keyframes, or null of this property is of type PropertyValueType.NO_VALUE or PropertyValueType.CUSTOM_VALUE
 */
DuAEProperty.prototype.keys = function (selected, timeRange) {
  var prop = this.getProperty();
  if (prop.propertyValueType == PropertyValueType.NO_VALUE) return [];
  if (prop.propertyValueType == PropertyValueType.CUSTOM_VALUE) return [];

  var comp = this.comp;
  if (timeRange == undefined) timeRange = [0, comp.duration];
  if (selected == undefined) selected = false;

  var keyFrames = [];

  if (prop.elided) return keyFrames;

  if (prop.isTimeVarying) {
    if (selected) {
      for (var keyIndex = 0; keyIndex < prop.selectedKeys.length; keyIndex++) {
        var key = this.keyAtIndex(prop.selectedKeys[keyIndex]);
        if (key._time >= timeRange[0] && key._time <= timeRange[1]) {
          key._time = key._time - timeRange[0];
          keyFrames.push(key);
        }
      }
    } else if (prop.numKeys > 0) {
      for (var keyIndex = 1; keyIndex <= prop.numKeys; keyIndex++) {
        var key = this.keyAtIndex(keyIndex);
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
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Recursilvely gets all animations in the property and subproperties in the whole timeline or in the time range<br />
 * The first DuAEKeyframe._time will be adjusted relatively to the start of the time range (if provided) instead of the startTime of the composition.
 * @param {boolean}	[selected=false]	- true to get only selected keyframes.
 * @param {float[]}	[timeRange]	- The time range, an array of two time values, in seconds. If not provided, will use the comp time range.
 * @return {DuAEPropertyGroupAnimation|DuAEPropertyAnimation}	The animations. A DuAEPropertyAnimation if prop is a Property, a PopertyGroupAnim if it is a PropertyGroup
 */
DuAEProperty.prototype.animation = function (selected, timeRange) {
  var comp = this.comp;
  timeRange = def(timeRange, [0, comp.duration]);
  selected = def(selected, false);

  var prop = this.getProperty();

  if (selected && !this.hasSelectedKeys()) return null;

  if (prop.propertyType === PropertyType.PROPERTY) {
    if (prop.propertyValueType == PropertyValueType.NO_VALUE) return null;
    if (prop.propertyValueType == PropertyValueType.CUSTOM_VALUE) return null;
    if (prop.elided) return null;
    if (!prop.canVaryOverTime) return null;
    var anim = new DuAEPropertyAnimation();
    anim._name = prop.name;
    anim._matchName = prop.matchName;
    if (prop.propertyValueType == PropertyValueType.TEXT_DOCUMENT) {
      anim.startValue = prop.valueAtTime(timeRange[0], true).text;
      anim.endValue = prop.valueAtTime(timeRange[1], true).text;
    } else {
      anim.startValue = prop.valueAtTime(timeRange[0], true);
      anim.endValue = prop.valueAtTime(timeRange[1], true);
    }

    anim.keys = this.keys(selected, timeRange);
    if (anim.keys.length > 0) {
      anim.startTime = anim.keys[0]._time;
      anim.endTime = anim.keys[anim.keys.length - 1]._time;
    } else {
      anim.startTime = 0;
      anim.endTime = 0;
    }
    anim.dimensions = this.dimensions();
    if (prop.canSetExpression && prop.expressionEnabled)
      anim.expression = prop.expression;
    return anim;
  } else if (prop.numProperties > 0) {
    var groupAnim = new DuAEPropertyGroupAnimation();
    groupAnim._name = prop.name;
    groupAnim._matchName = prop.matchName;

    for (
      var propIndex = 1, numP = prop.numProperties;
      propIndex <= numP;
      propIndex++
    ) {
      var subProp = new DuAEProperty(prop.property(propIndex));
      var anim = subProp.animation(selected, timeRange);
      if (anim != null) {
        if (groupAnim.startTime == null) groupAnim.startTime = anim.startTime;
        else if (groupAnim.startTime > anim.startTime)
          groupAnim.startTime = anim.startTime;
        if (groupAnim.endTime == null) groupAnim.endTime = anim.endTime;
        else if (groupAnim.endTime < anim.endTime)
          groupAnim.endTime = anim.endTime;
        groupAnim.anims.push(anim);
      }
    }
    return groupAnim;
  }
  return null;
};

// low-level undocumented method to get all expressions and cache them
DuAEProperty.prototype.addToExpressionCache = function () {
  this.do(function (prop) {
    var exp = new DuAEPropertyExpression(prop);
    if (!exp.empty) $.global["DUAEF_DATA"].expressionCache.push(exp);
  });
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Recursilvely gets the time of the first keyFrame in this prop or subprops
 * @param {Boolean} [selected=false] - true to check selected keyframes only
 * @return {float|null} The keyframe time or null if there are no keyframe
 */
DuAEProperty.prototype.firstKeyTime = function (selected) {
  selected = def(selected, false);
  var time = null;

  var prop = this.getProperty();

  if (prop.propertyType == PropertyType.PROPERTY) {
    if (!prop.canVaryOverTime) return null;
    if (selected) {
      var keys = prop.selectedKeys;
      if (keys.length == 0) return null;
      for (var i = 0, n = keys.length; i < n; i++) {
        var t = prop.keyTime(keys[i]);
        if (time == null) time = t;
        else if (time > t) time = t;
      }
    } else {
      if (prop.numKeys == 0) return null;
      return prop.keyTime(1);
    }
  } else if (prop.numProperties > 0) {
    for (var i = 1, n = prop.numProperties; i <= n; i++) {
      var subProp = this.prop(i);
      var t = subProp.firstKeyTime(selected);
      if (time == null) time = t;
      else if (t != null) {
        if (time > t) time = t;
      }
    }
  }

  return time;
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Recursilvely gets the time of the last keyFrame in this prop or subprops
 * @param {boolean} [selected=false] - true to check selected keyframes only
 * @return {float|null} The keyframe time or null if there are no keyframe
 */
DuAEProperty.prototype.lastKeyTime = function (selected) {
  selected = def(selected, false);
  var time = null;

  var prop = this.getProperty();

  if (prop.propertyType == PropertyType.PROPERTY) {
    if (!prop.canVaryOverTime) return null;
    if (selected) {
      var keys = prop.selectedKeys;
      if (keys.length == 0) return null;
      for (var i = 0, n = keys.length; i < n; i++) {
        var t = prop.keyTime(keys[i]);
        if (time == null) time = t;
        else if (time < t) time = t;
      }
      return time;
    } else {
      if (prop.numKeys == 0) return null;
      return prop.keyTime(prop.numKeys);
    }
  } else if (prop.numProperties > 0) {
    for (var i = 1, n = prop.numProperties; i <= n; i++) {
      var subProp = this.prop(i);
      var t = subProp.lastKeyTime(selected);
      if (time == null) time = t;
      else if (t != null) {
        if (time < t) time = t;
      }
    }
  }

  return time;
};

/**
 * Sets a {@linkcode DuAEKeyframe} on a property
 * @param {DuAEKeyframe}	key	- The DuAEKeyframe.
 * @param {Number}	[timeOffset=comp.time]	- The time offset (added to DuAEKeyframe._time) where to add the key frame.
 * @return {Boolean} Success
 */
DuAEProperty.prototype.setKey = function (key, timeOffset) {
  /** @type {Property}
   * @ts-ignore */
  var prop = this.getProperty();

  if (prop.elided) return false;

  if (prop.propertyType !== PropertyType.PROPERTY) {
    DuDebug.throwError(
      "Can not set a key on a group property",
      "DuAEProperty.setKey",
    );
    return false;
  }
  if (!prop.canVaryOverTime) return false;
  if (prop.isSeparationLeader) if (prop.dimensionsSeparated) return false;

  timeOffset = def(timeOffset, this.comp.time);
  var time = key._time + timeOffset;
  var val = key.value;

  // For some reason?? Influences change on the key before/after, restore them
  var prevInfluences = null;
  var nextInfluences = null;
  var prevIndex = this.keyIndexBefore(time);
  var nextIndex = this.keyIndexAfter(time);
  if (
    prevIndex > 0 &&
    prop.keyOutInterpolationType(prevIndex) == KeyframeInterpolationType.BEZIER
  ) {
    var prevEase = prop.keyOutTemporalEase(prevIndex);
    prevInfluences = [];
    for (var i = 0, n = prevEase.length; i < n; i++) {
      prevInfluences.push(prevEase[i].influence);
    }
  }
  if (
    nextIndex > 0 &&
    prop.keyInInterpolationType(nextIndex) == KeyframeInterpolationType.BEZIER
  ) {
    var nextEase = prop.keyInTemporalEase(nextIndex);
    nextInfluences = [];
    for (var i = 0, n = nextEase.length; i < n; i++) {
      nextInfluences.push(nextEase[i].influence);
    }
  }

  this.setValueAtTime(val, time);

  if (prop.numKeys == 0) return false;

  //get the index of the created key
  var index = prop.nearestKeyIndex(time);
  key._index = index;

  //set label
  /* @ts-ignore Doesn't exist in all versions*/
  if (jstype(prop.setLabelAtKey) === "function")
    prop.setLabelAtKey(index, key.label);

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

  // Adjust ease dimensions
  var inEase = key.inEase;
  var outEase = key.outEase;
  if (prop.isSpatial) {
    if (inEase.length != 1) inEase = [inEase[0]];
    if (outEase.length != 1) outEase = [outEase[0]];
  }

  try {
    prop.setTemporalContinuousAtKey(index, key._continuous);
    prop.setTemporalAutoBezierAtKey(index, key._autoBezier);
    prop.setTemporalEaseAtKey(index, inEase, outEase);
    prop.setInterpolationTypeAtKey(
      index,
      key._inInterpolationType,
      key._outInterpolationType,
    );

    if (prevInfluences) {
      var ease = prop.keyOutTemporalEase(index - 1);
      for (var i = 0, n = ease.length; i < n; i++) {
        ease[i].influence = prevInfluences[i];
      }
      prop.setTemporalEaseAtKey(
        index - 1,
        prop.keyInTemporalEase(index - 1),
        ease,
      );
    }
    if (nextInfluences) {
      var ease = prop.keyInTemporalEase(index + 1);
      for (var i = 0, n = ease.length; i < n; i++) {
        ease[i].influence = nextInfluences[i];
      }
      prop.setTemporalEaseAtKey(
        index + 1,
        ease,
        prop.keyOutTemporalEase(index + 1),
      );
    }
  } catch (err) {
    if (DuESF.debug)
      alert("DuAEProperty.prototype.setKey:\n" + err.description);
  }

  // Select it
  prop.setSelectedAtKey(index, true);

  return true;
};

/**
 * Checks if the property value is a number or an Array of Number.<br >
 * I.e if its value type is one of: one D, two D, three D (spatial or not), Color.
 * @return {bool}
 */
DuAEProperty.prototype.numerical = function () {
  var prop = this.getProperty();
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
 * @param {any} value - The value to set
 * @param {float} [defaultTime=comp().time] - The time at which to set the value if the property has keyframes
 * @return {boolean} True if the value has correctly been set, false otherwise.
 */
DuAEProperty.prototype.setValue = function (value, defaultTime) {
  var prop = this.getProperty();

  value = this.fixValue(value);

  if (prop.isSeparationLeader)
    if (prop.dimensionsSeparated) {
      var group = prop.parentProperty;
      var index = prop.propertyIndex;
      var ok = true;
      for (var i = 1; i <= value.length; i++) {
        var p = group.property(index + i);
        p = new DuAEProperty(p);
        var test = p.setValue(value[i - 1]);
        if (ok) ok = test;
      }
      return ok;
    }

  if (!this.editable()) return false;

  if (prop.numKeys > 0) return this.setValueAtTime(value, defaultTime);

  try {
    prop.setValue(value);
    return true;
  } catch (e) {
    if (DuESF.debug) alert(e.description);
    return false;
  }
};

/**
 * Adds a new key
 * @param {KeyframeInterpolationType|string} [typeIn=KeyframeInterpolationType.LINEAR] - The in interpolation type (see AE API) or the string "roving" or "continuous"
 * @param {KeyframeInterpolationType|string} [typeOut=typeIn] - The out interpolation type (see AE API)
 * @param {float} [time] - If omitted, the current comp time
 * @param {int[]|int} [easeInValue=33] - The in interpolation ease value (used if typeIn is KeyframeInterpolationType.BEZIER)
 * @param {int[]|int} [easeOutValue=easeInValue] - The out interpolation ease value (used if typeOut is KeyframeInterpolationType.BEZIER)
 */
DuAEProperty.prototype.addKey = function (
  typeIn,
  typeOut,
  time,
  easeInValue,
  easeOutValue,
) {
  if (this.isGroup()) return;

  typeIn = def(typeIn, KeyframeInterpolationType.LINEAR);
  typeOut = def(typeOut, typeIn);
  time = def(time, this.comp.time);

  easeInValue = def(easeInValue, 33);
  if (isNaN(easeInValue)) easeInValue = 33;
  easeOutValue = def(easeOutValue, easeInValue);
  if (isNaN(easeOutValue)) easeOutValue = 33;

  // Set value to create key
  this.setValueAtTime(this.valueAtTime(time, true), time);
  var prop = this.getProperty();
  var keyIndex = prop.nearestKeyIndex(time);
  this.setKeyInterpolation(
    keyIndex,
    typeIn,
    typeOut,
    easeInValue,
    easeOutValue,
  );
};

/**
 * Sets a new keyframe on a property, adjusting the dimensions if needed, at desired time
 * @param {any} value - The value to set
 * @param {float} [time] - The time of the new keyframe
 * @return {boolean} True if the value has correctly been set, false otherwise.
 */
DuAEProperty.prototype.setValueAtTime = function (value, time) {
  var prop = this.getProperty();
  var dimensions = this.dimensions();

  time = def(time, this.comp.time);

  if (!prop.canVaryOverTime) return false;
  if (prop.isSeparationLeader) if (prop.dimensionsSeparated) return false;

  if (!this.editable()) return false;

  value = this.fixValue(value);

  try {
    prop.setValueAtTime(time, value);
    return true;
  } catch (e) {
    if (DuESF.debug) alert(e.description);
    return false;
  }
};

/**
 * Sets a new keyframe value, adjusting the dimensions if needed
 * @param {any} value - The value to set
 * @param {int} key - The index the keyframe
 * @return {boolean} True if the value has correctly been set, false otherwise.
 */
DuAEProperty.prototype.setValueAtKey = function (value, key) {
  var prop = this.getProperty();
  var dimensions = this.dimensions();

  if (!prop.canVaryOverTime) return false;
  if (prop.isSeparationLeader) if (prop.dimensionsSeparated) return false;

  if (!this.editable()) return false;

  if (key <= 0 || key > prop.numKeys) return false;

  value = this.fixValue(value);

  try {
    prop.setValueAtKey(key, value);
    return true;
  } catch (e) {
    if (DuESF.debug) alert(e.description);
    return false;
  }
};

/**
 * Sets the property animation on the property. This is a lower-level method than {@link DuAEProperty#setAnimation DuAEProperty.setAnimation()}.<br />
 * Use this method only to force the animation onto the property without checks.<br />
 * Must be used on a Property (not a group) with a DuAEPropertyAnimation (not a DuAEPropertyGroupAnimation).<br />
 * To easily set an animation on a property with automatic compatibility checks, you should use <code>setAnimation()</code>.
 * @param {DuAEPropertyAnimation} anim	- The animation
 * @param {float}	[time=comp.time]	- The time where to begin the animation
 * @param {boolean}	[setExpression=false]	- Sets the expression too
 * @param {boolean}	[replace=false]	- true to remove any existing keyframe on the properties before adding new keyframes
 * @param {boolean}	[offset=false]	- true to offset the current value, instead of replacing it
 * @return {boolean} true if the anim was actually set.
 */
DuAEProperty.prototype.setAnim = function (
  anim,
  time,
  setExpression,
  replace,
  offset,
) {
  var prop = this.getProperty();
  var comp = this.comp;

  time = def(time, comp.time);
  setExpression = def(setExpression, false);
  replace = def(replace, false);
  offset = def(offset, false);

  if (!this.numerical()) offset = false;

  var dimensions = anim.dimensions;

  var ok = false;

  if (anim == null) return true;
  if (anim.type == "group") return false;

  if (this.editable()) {
    //keep current value
    var val = prop.valueAtTime(comp.time, true);

    //remove keyframes
    if (replace && prop.numKeys > 0) {
      for (var i = prop.numKeys; i > 0; i--) {
        prop.removeKey(i);
      }
      this.setValue(val);
    }

    //if there are keys, set them
    if (anim.keys.length > 0) {
      for (var iclef = 0; iclef < anim.keys.length; iclef++) {
        var key = anim.keys[iclef];
        if (offset) {
          if (iclef == 0) key.value = val;
          else key.value = val + (key.value - anim.startValue);
        }
        this.setKey(key, time);
        ok = true;
      }
    } //set the start value
    else {
      var value = anim.startValue;

      if (anim.startValue != null && !offset) {
        this.setValue(anim.startValue, time);
      }
      ok = true;
    }

    //set the expression
    if (this.riggable() && setExpression) {
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
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Sets all animations on a Property or a PropertyGroup.
 * @param {DuAEPropertyAnimation|DuAEPropertyGroupAnimation} anim The animation
 * @param {float}	[time=comp().time]	- The time where to begin the animation
 * @param {boolean}	[ignoreName=false]	- true to set the anim even if name of the property do not match the animation.
 * @param {boolean}	[setExpression=false]	- Sets the expression too
 * @param {boolean}	[onlyKeyframes=true]	- If false, the value of properties without keyframes will be set too.
 * @param {boolean}	[replace=false]	- true to remove any existing keyframe on the properties before adding new keyframes
 * @param {string[]}	[whiteList]	- A list of matchNames used as a white list for properties to set anims.<br />
 * Can be the matchName of a propertyGroup to set all the subproperties.<br />
 * Ignored if the list is empty.
 * @param {boolean}	[offset=false]	- true to offset the current value, instead of replacing it
 * @param {Boolean} [offsetTransform=false] - When set to true, the transform (position, rotation) values will be offset to 0 before applying the animation.
 * @return {boolean} true if the anim was actually set.
 */
DuAEProperty.prototype.setAnimation = function (
  anim,
  time,
  ignoreName,
  setExpression,
  onlyKeyframes,
  replace,
  whiteList,
  offset,
  set,
  offsetTransform,
) {
  var prop = this.getProperty();

  time = def(time, this.comp.time);
  ignoreName = def(ignoreName, false);
  setExpression = def(setExpression, false);
  onlyKeyframes = def(onlyKeyframes, false);
  replace = def(replace, false);
  whiteList = def(whiteList, []);
  offset = def(offset, false);
  set = def(set, false);
  offsetTransform = def(offsetTransform, false);

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

      if (okToSet) {
        if (
          offsetTransform &&
          (anim._matchName == "ADBE Position" ||
            anim._matchName == "ADBE Rotate Z")
        ) {
          var o = anim.startValue;
          offset = true;
          for (var i = 0, ni = anim.keys.length; i < ni; i++) {
            anim.keys[i].value -= o;
          }
          if (anim._matchName == "ADBE Position") anim.startValue = [0, 0];
          else anim.startValue = 0;
        }
        return this.setAnim(anim, time, setExpression, replace, offset);
      }
    }
  } else {
    for (var i = 0; i < anim.anims.length; i++) {
      var propAnim = anim.anims[i];
      //find the property with the same name and matchname
      for (var j = 1, numProp = prop.numProperties; j <= numProp; j++) {
        var subProp = new DuAEProperty(prop.property(j));
        var okToSet = false;
        if (subProp.matchName == propAnim._matchName) {
          if (!ignoreName && subProp.name == propAnim._name) okToSet = true;
          if (ignoreName) okToSet = true;
        }
        if (okToSet) {
          ok = subProp.setAnimation(
            propAnim,
            time,
            ignoreName,
            setExpression,
            onlyKeyframes,
            replace,
            whiteList,
            offset,
            set,
            offsetTransform,
          );
          break;
        }
      }
    }
  }

  return ok;
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Removes the animation from the property
 * @param {boolean} [removeExpression=false] - Set to true to remove the expression too
 * @return {DuAEPropertyGroupAnimation|DuAEPropertyAnimation}	The animations. A DuAEPropertyAnimation if prop is a Property, a PopertyGroupAnim if it is a PropertyGroup
 */
DuAEProperty.prototype.removeAnimation = function (removeExpression) {
  removeExpression = def(removeExpression, false);
  this.do(function (prop) {
    prop = prop.getProperty();
    while (prop.numKeys > 0) {
      prop.removeKey(1);
    }
    if (removeExpression && prop.canSetExpression) {
      prop.expression = "";
    }
  });
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Removes the animation from the property and returns it
 * @param {Property|DuAEProperty} prop -The property
 * @param {boolean} [removeExpression=false] - Set to true to remove the expression too
 */
DuAEProperty.prototype.takeAnimation = function (removeExpression) {
  var anim = this.animation();
  this.removeAnimation(removeExpression);
  return anim;
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Selects the keyframes in the propoerty.<br />
 * Selects all nested keyframes if the property is a group.
 * @param {float} [inTime=0] - The time at which to select the keyframes
 * @param {float} [outTime=inTime] - The end time
 */
DuAEProperty.prototype.selectKeys = function (inTime, outTime) {
  // Defaults
  inTime = def(inTime, 0);
  outTime = def(outTime, inTime);
  // Run
  this.do(function (propInfo) {
    if (propInfo.matchName == "ADBE Marker") return;
    prop = propInfo.getProperty();
    if (prop.elided) return;
    if (prop.isSeparationLeader) if (prop.dimensionsSeparated) return;
    if (inTime == outTime) {
      //get key
      var key = propInfo.keyAtTime(inTime);
      if (key) prop.setSelectedAtKey(key._index, true);
    } else {
      //get keys
      var keys = propInfo.keys(false, [inTime, outTime]);
      if (!keys) return;
      for (var i = 0; i < keys.length; i++) {
        prop.setSelectedAtKey(keys[i]._index, true);
      }
    }
  });
};

/**
 * Gets an expression link to the property
 * @memberof DuAEProperty
 * @param {bool} [useThisComp=false] Whether to begin the expression by 'thisComp' or 'comp("name")'
 * @param {bool} [fromLayer=true] Whether to begin the expression by comp.layer or directly from the first prop of the layer
 * @return {str} The expression link to the property
 */
DuAEProperty.prototype.expressionLink = function (useThisComp, fromLayer) {
  var prop = this.getProperty();
  useThisComp = def(useThisComp, false);
  fromLayer = def(fromLayer, true);

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
      compactName = DuAE.getCompactExpression(prop.matchName, name, prop);
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
 * @param {int} key - The key index
 * @param {KeyframeInterpolationType|string} typeIn - The in interpolation type (see AE API) or the string "roving" or "continuous"
 * @param {KeyframeInterpolationType|string} [typeOut=typeIn] - The out interpolation type (see AE API)
 * @param {int[]|int} [easeInValue=33] - The in interpolation ease value (used if typeIn is KeyframeInterpolationType.BEZIER)
 * @param {int[]|int} [easeOutValue=easeInValue] - The out interpolation ease value (used if typeOut is KeyframeInterpolationType.BEZIER)
 */
DuAEProperty.prototype.setKeyInterpolation = function (
  key,
  typeIn,
  typeOut,
  easeInValue,
  easeOutValue,
) {
  if (typeOut == undefined) typeOut = def(typeOut, typeIn);
  if (easeInValue == undefined) easeInValue = 33;
  if (isNaN(easeInValue)) easeInValue = 33;
  if (easeOutValue == undefined) easeOutValue = easeInValue;
  if (isNaN(easeOutValue)) easeOutValue = 33;

  easeInValue = new KeyframeEase(0, easeInValue);
  easeOutValue = new KeyframeEase(0, easeOutValue);

  var prop = this.getProperty();

  try {
    if (typeIn == "roving" && prop.isSpatial) {
      prop.setRovingAtKey(key, true);
    } else if (typeIn == "continuous") {
      prop.setInterpolationTypeAtKey(key, KeyframeInterpolationType.BEZIER);
      prop.setTemporalContinuousAtKey(key, true);
      prop.setTemporalAutoBezierAtKey(key, true);
      //not roving
      if (
        prop.propertyValueType == PropertyValueType.TwoD_SPATIAL ||
        prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL
      )
        prop.setRovingAtKey(key, false);
    } else if (typeIn != "roving") {
      // WARNING Influences HAVE TO be set BEFORE interpolation type
      // otherwise, the type gets back to Bézier.

      //influences
      var inInf = [easeInValue];
      var outInf = [easeOutValue];
      if (!prop.isSpatial) {
        var d = prop.value.length;
        while (d > inInf.length) {
          inInf.push(easeInValue);
          outInf.push(easeOutValue);
        }
      }
      prop.setTemporalEaseAtKey(key, inInf, outInf);

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
  } catch (e) {
    if (DuESF.debug)
      alert("DuAEProperty.prototype.setKeyInterpolation\n" + e.description);
  }
};

/**
 * Changes the ease influences of the selected keys
 * @param {PropertyBase[]|PropertyInfo[]} props - The properties
 * @param {int[]|int} [easeInValue] - The in interpolation ease value. Will be ignored if undefined.
 * @param {int[]|int} [easeOutValue] - The out interpolation ease value. Will be ignored if undefined.
 * @param {int[]|int} [velocityInValue] - The out interpolation ease value. Will be ignored if undefined.
 * @param {int[]|int} [velocityOutValue] - The out interpolation ease value. Will be ignored if undefined.
 * @param {boolean} [velocityAsPercent=false] - Use a percent instead of a value to set velocities.<br />
 * In this case, the proper velocity value will be deduced by multiplying the max speed of the property by the percent.
 */
DuAEProperty.prototype.setEase = function (
  easeInValue,
  easeOutValue,
  velocityInValue,
  velocityOutValue,
  velocityAsPercent,
) {
  if (this.isGroup()) return;

  if (isNaN(easeInValue) && isdef(easeInValue)) easeInValue = 33;
  if (isNaN(easeOutValue) && isdef(easeOutValue)) easeOutValue = 33;
  if (isNaN(velocityInValue) && isdef(velocityInValue)) velocityInValue = 0;
  if (isNaN(velocityOutValue) && isdef(velocityOutValue)) velocityOutValue = 0;

  var prop = this.getProperty();

  if (prop.canVaryOverTime) {
    var vInValue = velocityInValue;
    var vOutValue = velocityOutValue;

    for (var k = 0, numK = prop.selectedKeys.length; k < numK; k++) {
      var key = prop.selectedKeys[k];

      //compute the velocity
      if (
        velocityAsPercent &&
        (isdef(velocityInValue) || isdef(velocityOutValue))
      ) {
        //get speed just before and after as if it was linear
        var prevSpeed;
        var nextSpeed;
        var val = prop.keyValue(key);
        var currentTime = prop.keyTime(key);
        var valBefore = val;
        var valAfter = val;
        if (key > 1) {
          var valBefore = prop.keyValue(key - 1);
          var timeBefore = prop.keyTime(key - 1);
          prevSpeed =
            DuMath.length(val, valBefore) / (currentTime - timeBefore);
        }

        if (key < prop.numKeys) {
          var valAfter = prop.keyValue(key + 1);
          var timeAfter = prop.keyTime(key + 1);
          nextSpeed = DuMath.length(val, valAfter) / (timeAfter - currentTime);
        }

        if (!isdef(prevSpeed) && !isdef(nextSpeed)) {
          prevSpeed = 0;
          nextSpeed = 0;
        } else if (!isdef(prevSpeed)) {
          prevSpeed = nextSpeed;
        } else if (!isdef(nextSpeed)) {
          nextSpeed = prevSpeed;
        }

        //detect sign
        var signBefore = 1;
        var signAfter = 1;
        if (this.dimensions() == 1) {
          if (val < valBefore) signBefore = -1;
          if (valAfter < val) signAfter = -1;
        }

        if (
          isdef(velocityInValue) &&
          isdef(velocityOutValue) &&
          velocityInValue == velocityOutValue
        ) {
          //select average speed
          var speed = (prevSpeed + nextSpeed) / 2;
          vInValue = ((velocityInValue * speed) / 100) * signBefore;
          vOutValue = ((velocityOutValue * speed) / 100) * signBefore;
        } else {
          if (isdef(velocityInValue))
            vInValue = ((velocityInValue * prevSpeed) / 100) * signBefore;
          if (isdef(velocityOutValue))
            vOutValue = ((velocityOutValue * nextSpeed) / 100) * signAfter;
        }
      }

      // When setting ease on a linear keyframe, set the velocity to 0 by default
      if (
        prop.keyInInterpolationType(key) == KeyframeInterpolationType.LINEAR &&
        isdef(easeInValue) &&
        !isdef(velocityInValue)
      ) {
        vInValue = 0;
      }
      if (
        prop.keyOutInterpolationType(key) == KeyframeInterpolationType.LINEAR &&
        isdef(easeOutValue) &&
        !isdef(velocityOutValue)
      ) {
        vOutValue = 0;
      }

      //set interpolation
      var easeIn = [
        new KeyframeEase(
          def(vInValue, prop.keyInTemporalEase(key)[0].speed),
          def(easeInValue, prop.keyInTemporalEase(key)[0].influence),
        ),
      ];
      var easeOut = [
        new KeyframeEase(
          def(vOutValue, prop.keyOutTemporalEase(key)[0].speed),
          def(easeOutValue, prop.keyOutTemporalEase(key)[0].influence),
        ),
      ];

      if (!prop.isSpatial) {
        for (
          var j = 1;
          j < prop.keyInTemporalEase(prop.selectedKeys[k]).length;
          j++
        ) {
          easeIn.push(
            new KeyframeEase(
              def(vInValue, prop.keyInTemporalEase(key)[j].speed),
              def(easeInValue, prop.keyInTemporalEase(key)[j].influence),
            ),
          );
          easeOut.push(
            new KeyframeEase(
              def(vOutValue, prop.keyOutTemporalEase(key)[j].speed),
              def(easeOutValue, prop.keyOutTemporalEase(key)[j].influence),
            ),
          );
        }
      }

      //adjust interpolation types
      var inType = KeyframeInterpolationType.BEZIER;
      var outType = KeyframeInterpolationType.BEZIER;

      if (!isdef(easeInValue) && !isdef(velocityInValue)) {
        inType = prop.keyInInterpolationType(key);
      }
      if (!isdef(easeOutValue) && !isdef(velocityOutValue)) {
        outType = prop.keyOutInterpolationType(key);
      }

      prop.setInterpolationTypeAtKey(key, inType, outType);

      prop.setTemporalEaseAtKey(key, easeIn, easeOut);
    }
  }
};

/**
 * Sets the speed of a keyframe.
 * @param {int} key - The key index
 * @param {float} speed - The speed
 */
DuAEProperty.prototype.setKeySpeed = function (key, speed) {
  var prop = this.getProperty();
  // Get the current ease to reset the same tangents
  var inEase = prop.keyInTemporalEase(key);
  var outEase = prop.keyOutTemporalEase(key);

  if (!(speed instanceof Array)) speed = [speed];

  while (speed.length < inEase.length) speed.push(speed[0]);

  // Set the new speed
  for (var i = 0, n = inEase.length; i < n; i++) {
    inEase[i].speed = speed[i];
    outEase[i].speed = speed[i];
  }

  // Some properties can't set interpolation type
  try {
    prop.setTemporalEaseAtKey(key, inEase, outEase);
  } catch (e) {
    if (DuESF.debug)
      alert("DuAEProperty.prototype.setKeySpeed\n" + e.description);
  }
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Sets interpolations for all keyframes.
 * @param {KeyframeInterpolationType|string} typeIn - The in interpolation type (see AE API) or the string "roving" or "continuous"
 * @param {KeyframeInterpolationType|string} [typeOut=typeIn] - The out interpolation type (see AE API)
 * @param {int[]|int} [easeInValue=33] - The in interpolation ease value (used if typeIn is KeyframeInterpolationType.BEZIER)
 * @param {int[]|int} [easeOutValue=easeInValue] - The out interpolation ease value (used if typeOut is KeyframeInterpolationType.BEZIER)
 * @param {Bool} [selectedKeyframesOnly=false] - If true, only set the selected keyframes.
 */
DuAEProperty.prototype.setInterpolation = function (
  typeIn,
  typeOut,
  easeInValue,
  easeOutValue,
  selectedKeyframesOnly,
) {
  // Defaults
  selectedKeyframesOnly = def(selectedKeyframesOnly, false);
  typeOut = def(typeOut, typeIn);
  easeInValue = def(easeInValue, 33);
  if (isNaN(easeInValue)) easeInValue = 33;
  easeOutValue = def(easeOutValue, easeInValue);
  if (isNaN(easeOutValue)) easeOutValue = 33;

  // Run
  this.do(function (propInfo) {
    var prop = propInfo.getProperty();
    if (selectedKeyframesOnly) {
      for (var i = 0; i < prop.selectedKeys.length; i++) {
        propInfo.setKeyInterpolation(
          prop.selectedKeys[i],
          typeIn,
          typeOut,
          easeInValue,
          easeOutValue,
        );
      }
    } else {
      for (var i = 1, n = prop.numKeys; i <= n; i++) {
        propInfo.setKeyInterpolation(
          i,
          typeIn,
          typeOut,
          easeInValue,
          easeOutValue,
        );
      }
    }
  });
};

/**
 * Computes a percentage from a velocity on a given keyframe.
 * @param {int} keyIndex - The index of the keyframe where to compute the velocity
 * @return {float[]} The velocities [in, out] as a percentage.
 */
DuAEProperty.prototype.velocityToPercent = function (key) {
  var prop = this.getProperty();

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
    if (this.dimensions() == 1) {
      if (val - valBefore < 0 && speedIn < 0) prevSpeed = -prevSpeed;
    }
  }

  if (key < prop.numKeys) {
    var valAfter = prop.keyValue(key + 1);
    var timeAfter = prop.keyTime(key + 1);
    nextSpeed = DuMath.length(val, valAfter) / (timeAfter - currentTime);
    // Sign
    if (this.dimensions() == 1) {
      if (valAfter - val < 0 && speedOut < 0) nextSpeed = -nextSpeed;
    }
  }

  //get average speed
  var speed = (prevSpeed + nextSpeed) / 2;

  //compare to the original speeds
  var speedInAsPercent = (speedIn / speed) * 100;
  var speedOutAsPercent = (speedOut / speed) * 100;

  return [speedInAsPercent, speedOutAsPercent];
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Checks if the property has some selected keyframes.<br />
 * The property can be either a Property or a PropertyGroup.
 * @return {boolean} true if the property have at least one selected keyframe
 */
DuAEProperty.prototype.hasSelectedKeys = function () {
  var yes = false;

  var prop = this.getProperty();

  if (prop.propertyType == PropertyType.PROPERTY) {
    if (prop.selectedKeys.length > 0) {
      yes = true;
    }
  } else if (prop.numProperties > 0) {
    for (
      var propIndex = 1, numP = this.numProperties();
      propIndex <= numP;
      propIndex++
    ) {
      yes = this.prop(propIndex).hasSelectedKeys();
      if (yes) break;
    }
  }
  return yes;
};

/**
 * Sets the spatial interpolation of the keyframes on the property
 * @param {KeyframeInterpolationType} typeIn - The in interpolation type (see AE API)
 * @param {KeyframeInterpolationType} [typeOut=typeIn] - The in interpolation type (see AE API)
 * @param {Bool} [selectedKeyframesOnly=false] - If true, only set the selected keyframes.
 */
DuAEProperty.prototype.setSpatialInterpolation = function (
  typeIn,
  typeOut,
  selectedKeyframesOnly,
) {
  var prop = this.getProperty();
  typeOut = def(typeOut, typeIn);
  selectedKeyframesOnly = def(selectedKeyframesOnly, false);

  if (!prop.isSpatial) return;
  if (prop.selectedKeys.length == 0) return;

  var keys = [];
  if (selectedKeyframesOnly) keys = prop.selectedKeys;
  else for (var k = 1, n = prop.numKeys; k <= n; k++) keys.push(k);

  for (var k = 0, numK = keys.length; k < numK; k++) {
    this.setSpatialInterpolationAtKey(keys[k], typeIn, typeOut);
  }
};

/**
 * Sets the spatial interpolation of the keyframes
 * @param {int|DuAEKeyframe} key - The keyframe or its index
 * @param {KeyframeInterpolationType} typeIn - The in interpolation type (see AE API)
 * @param {KeyframeInterpolationType} [typeOut=typeIn] - The in interpolation type (see AE API)
 */
DuAEProperty.prototype.setSpatialInterpolationAtKey = function (
  key,
  typeIn,
  typeOut,
) {
  var prop = this.getProperty();

  typeOut = def(typeOut, typeIn);
  var k = key;
  if (key instanceof DuAEKeyframe) k = key._index;

  if (
    typeIn == KeyframeInterpolationType.BEZIER &&
    typeOut == KeyframeInterpolationType.BEZIER
  ) {
    prop.setSpatialAutoBezierAtKey(k, true);
  } else if (
    typeIn == KeyframeInterpolationType.LINEAR &&
    typeOut == KeyframeInterpolationType.LINEAR
  ) {
    prop.setSpatialContinuousAtKey(k, false);
    prop.setSpatialAutoBezierAtKey(k, false);
    if (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL) {
      prop.setSpatialTangentsAtKey(k, [0, 0, 0], [0, 0, 0]);
    } else if (prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) {
      prop.setSpatialTangentsAtKey(k, [0, 0], [0, 0]);
    }
  } else if (typeIn == KeyframeInterpolationType.BEZIER) {
    prop.setSpatialContinuousAtKey(k, false);
    prop.setSpatialAutoBezierAtKey(k, false);
    if (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL) {
      if (
        prop.keyInSpatialTangent(k)[0] == 0 &&
        prop.keyInSpatialTangent(k)[1] == 0 &&
        prop.keyInSpatialTangent(k)[2] == 0
      ) {
        prop.setSpatialAutoBezierAtKey(k, true);
      }
      prop.setSpatialTangentsAtKey(k, prop.keyInSpatialTangent(k), [0, 0, 0]);
    } else if (prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) {
      if (
        prop.keyInSpatialTangent(k)[0] == 0 &&
        prop.keyInSpatialTangent(k)[1] == 0
      ) {
        prop.setSpatialAutoBezierAtKey(k, true);
      }
      prop.setSpatialTangentsAtKey(k, prop.keyInSpatialTangent(k), [0, 0]);
    }
  } else if (typeIn == KeyframeInterpolationType.LINEAR) {
    prop.setSpatialContinuousAtKey(k, false);
    prop.setSpatialAutoBezierAtKey(k, false);
    if (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL) {
      if (
        prop.keyOutSpatialTangent(k)[0] == 0 &&
        prop.keyOutSpatialTangent(k)[1] == 0 &&
        prop.keyOutSpatialTangent(k)[2] == 0
      ) {
        prop.setSpatialAutoBezierAtKey(k, true);
      }
      prop.setSpatialTangentsAtKey(k, [0, 0, 0], prop.keyOutSpatialTangent(k));
    } else if (prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) {
      if (
        prop.keyOutSpatialTangent(k)[0] == 0 &&
        prop.keyOutSpatialTangent(k)[1] == 0
      ) {
        prop.setSpatialAutoBezierAtKey(k, true);
      }
      prop.setSpatialTangentsAtKey(k, [0, 0], prop.keyOutSpatialTangent(k));
    }
  }
};

/**
 * Fixes the spatial interpolation of the selected keys.<br />
 * Sets the interpolation to linear when the property does not move between keyframes
 * @param {int} [precision=1] - The precision for float number comparison, number of decimals. Set to -1 to not use.
 * @param {Bool} [selectedKeyframesOnly=false] - If true, only set the selected keyframes.
 */
DuAEProperty.prototype.fixSpatialInterpolation = function (
  precision,
  selectedKeyframesOnly,
) {
  precision = def(precision, 1);
  var prop = this.getProperty();

  if (!prop.isSpatial) return;
  if (!prop.canVaryOverTime) return;

  selectedKeyframesOnly = def(selectedKeyframesOnly, false);

  var keys = [];
  if (selectedKeyframesOnly) keys = prop.selectedKeys;
  else for (var k = 1, n = prop.numKeys; k <= n; k++) keys.push(k);

  for (var i = 0, numK = keys.length; i < numK; i++) {
    var k = keys[i];
    if (k == prop.numKeys) continue;
    //get this key value
    var keyValue = prop.valueAtTime(prop.keyTime(k), true);
    //get next key value
    var nextKeyValue = prop.valueAtTime(prop.keyTime(k + 1), true);

    //compare and set
    if (DuMath.equals(keyValue, nextKeyValue, precision)) {
      if (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL) {
        prop.setSpatialTangentsAtKey(k, prop.keyInSpatialTangent(k), [0, 0, 0]);
        prop.setSpatialTangentsAtKey(
          k + 1,
          [0, 0, 0],
          prop.keyOutSpatialTangent(k + 1),
        );
      } else if (prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) {
        prop.setSpatialTangentsAtKey(k, prop.keyInSpatialTangent(k), [0, 0]);
        prop.setSpatialTangentsAtKey(
          k + 1,
          [0, 0],
          prop.keyOutSpatialTangent(k + 1),
        );
      }
    }
  }
};

/**
 * Reimplements the <code>Property.propertyValueType</code> attribute.
 * @return {PropertyValueType|null} The value type, or null if this is a group
 */
DuAEProperty.prototype.propertyValueType = function () {
  if (this.isGroup()) return null;
  var prop = this.getProperty();
  return prop.PropertyValueType;
};

/**
 * Reimplements the <code>Property.keyInSpatialTangent</code> method.
 * @param {int|DuAEKeyframe} key The keyframe or its index.
 * @return {float[]} The tangent
 */
DuAEProperty.prototype.keyInSpatialTangent = function (key) {
  if (this.isGroup()) return [];
  if (!this.isSpatial()) return [];
  var prop = this.getProperty();
  if (key instanceof DuAEKeyframe) key = key._index;
  return prop.keyInSpatialTangent(key);
};

/**
 * Reimplements the <code>Property.keyOutSpatialTangent</code> method.
 * @param {int|DuAEKeyframe} key The keyframe or its index.
 * @return {float[]} The tangent
 */
DuAEProperty.prototype.keyOutSpatialTangent = function (key) {
  if (this.isGroup()) return [];
  if (!this.isSpatial()) return [];
  var prop = this.getProperty();
  if (key instanceof DuAEKeyframe) key = key._index;
  return prop.keyOutSpatialTangent(key);
};

/**
 * Reimplements the <code>Property.setSpatialTangentsAtKey</code> method.
 * @param {int|DuAEKeyframe} key The keyframe or its index.
 * @param {float[]} inTangent The in tangent.
 * @param {float[]} outTangent The out tangent.
 */
DuAEProperty.prototype.setSpatialTangentsAtKey = function (
  key,
  inTangent,
  outTangent,
) {
  if (this.isGroup()) return;
  if (!this.isSpatial()) return;
  if (this.dimensionsSeparated()) return;
  var prop = this.getProperty();
  // Adjust dimensions
  if (prop.propertyValueType == PropertyValueType.ThreeD_SPATIAL) {
    while (inTangent.length > 3) inTangent.pop();
    while (inTangent.length < 3) inTangent.push(0);
    while (outTangent.length > 3) outTangent.pop();
    while (outTangent.length < 3) outTangent.push(0);
  } else if (prop.propertyValueType == PropertyValueType.TwoD_SPATIAL) {
    while (inTangent.length > 2) inTangent.pop();
    while (inTangent.length < 2) inTangent.push(0);
    while (outTangent.length > 2) outTangent.pop();
    while (outTangent.length < 2) outTangent.push(0);
  } else return;
  if (key instanceof DuAEKeyframe) key = key._index;

  prop.setSpatialTangentsAtKey(key, inTangent, outTangent);
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Removes all unneeded keyframes from the property.< br/>
 * Also checks the interpolation values to reset the correct display as linear/smooth.
 * @param {int} [precision=1] - The precision for float number comparison, number of decimals. Set to -1 to not use.
 */
DuAEProperty.prototype.cleanKeyframes = function (precision) {
  precision = def(precision, 1);

  var prop = this.getProperty();

  var frameDuration = this.comp.frameDuration;

  if (prop.propertyType == PropertyType.PROPERTY) {
    var valueType = prop.propertyValueType;
    var numKeys = prop.numKeys;
    if (numKeys == 0) return;
    if (numKeys == 1) {
      prop.removeKey(1);
      return;
    }

    for (var i = numKeys; i >= 1; i--) {
      var t = prop.keyTime(i);
      var cV = prop.keyValue(i);
      var pV = prop.valueAtTime(t - frameDuration, true);
      if (valueType == PropertyValueType.SHAPE) {
        if (!DuAEProperty.shapeValueEquals(cV, pV, precision)) continue;
      } else if (valueType == PropertyValueType.TEXT_DOCUMENT) {
        if (!DuAEProperty.textValueEquals(cV, pV)) continue;
      } else if (!DuMath.equals(pV, cV, precision)) continue;

      var nV = prop.valueAtTime(t + frameDuration, true);

      if (valueType == PropertyValueType.SHAPE) {
        if (!DuAEProperty.shapeValueEquals(cV, nV, precision)) continue;
      } else if (valueType == PropertyValueType.TEXT_DOCUMENT) {
        if (!DuAEProperty.textValueEquals(cV, nV)) continue;
      } else if (!DuMath.equals(nV, cV, precision)) continue;

      prop.removeKey(i);
    }
  } else {
    for (var p = 1, num = this.numProperties(); p <= num; p++) {
      this.prop(p).cleanKeyframes();
    }
  }
};

/**
 * Gets the speed of a property at a given time, in unit per second (and not per frame as speeds in the After Effects API)
 * @param {float} [time=comp().time] - The time.
 * @param {boolean} [preExpression=true] - true to get the pre-expression speed.
 * @return {float} The speed
 */
DuAEProperty.prototype.speedAtTime = function (time, preExpression) {
  preExpression = def(preExpression, true);

  var prop = this.getProperty();

  if (prop.propertyType != PropertyType.PROPERTY) return 0;
  if (prop.numKeys == 0 && preExpression) return 0;

  var comp = this.comp;
  time = def(time, comp.time);

  var speed = DuMath.length(
    prop.valueAtTime(time + comp.frameDuration / 2, preExpression),
    prop.valueAtTime(time - comp.frameDuration / 2, preExpression),
  );
  return speed / comp.frameDuration;
};

/**
 * Gets the velocity of a property at a given time, in unit per second (and not per frame as speeds in the After Effects API)
 * @param {float} [time=comp().time] - The time.
 * @param {boolean} [preExpression=true] - true to get the pre-expression velocity.
 * @return {float[]} The velocity
 */
DuAEProperty.prototype.velocityAtTime = function (time, preExpression) {
  preExpression = def(preExpression, true);

  var prop = this.getProperty();

  if (prop.propertyType != PropertyType.PROPERTY) return 0;
  if (prop.numKeys == 0 && preExpression) return 0;

  var comp = this.comp;
  time = def(time, comp.time);

  // For each axis
  var d = this.dimensions();
  var velocity = [];
  var nextValue = prop.valueAtTime(
    time + comp.frameDuration / 2,
    preExpression,
  );
  var prevValue = prop.valueAtTime(
    time - comp.frameDuration / 2,
    preExpression,
  );
  if (d == 1) velocity = (nextValue - prevValue) / comp.frameDuration;
  else {
    for (var i = 0; i < d; i++) {
      velocity.push((nextValue[i] - prevValue[i]) / comp.frameDuration);
    }
  }
  return velocity;
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Sets an expression to a property.<br />
 * With the ability to keep the initial value.
 * @param {string} expr - The expression
 * @param {Boolean} [keepValue=true] - When true, the method will try to keep the same resulting value as before applying the expression.
 */
DuAEProperty.prototype.setExpression = function (expr, keepValue) {
  keepValue = def(keepValue, true);

  this.do(function (duaeProp) {
    prop = duaeProp.getProperty();

    if (!duaeProp.riggable()) return;
    var comp = duaeProp.comp;

    var keepVal = keepValue;
    if (!duaeProp.editable()) keepVal = false;
    var originalValue;
    if (keepVal) originalValue = prop.valueAtTime(comp.time, false);

    //remove current expression
    if (keepValue) duaeProp.removeExpression();
    else
      try {
        prop.expression = "";
      } catch (e) {
        if (DuESF.debug) alert(e.description);
        return;
      }

    //set new expression
    try {
      prop.expression = expr;
    } catch (e) {
      if (DuESF.debug) alert(e.description);
    }

    //restore value
    if (keepVal)
      if (duaeProp.dimensions() > 0)
        duaeProp.setValue(
          2 * originalValue - prop.valueAtTime(comp.time, false),
        );
  });
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Replaces text in Expressions
 * @param {string} oldString - The string to replace
 * @param {string} newString - The new string
 * @param {boolean} [caseSensitive=true] - Whether the search has to be case sensitive
 */
DuAEProperty.prototype.replaceInExpressions = function (
  prop,
  oldString,
  newString,
  caseSensitive,
) {
  // Defaults
  caseSensitive = def(caseSensitive, true);

  // Run
  this.do(function (prop) {
    if (prop.riggable()) {
      prop = prop.getProperty();
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
  });
};

/**
 * Adds an expression to the property, linking it to the parent property
 * @param {DuAEProperty|Property} parentProp - The parent property.
 * @param {bool} [useThisComp] - Whether to begin the expression by 'thisComp' or 'comp("name")', default: will detect if the properties are in the same comp
 */
DuAEProperty.prototype.pickWhip = function (parentProp, useThisComp) {
  var childProp = this.getProperty();
  var parent = new DuAEProperty(parentProp);
  var parentProp = parent.getProperty();

  if (!this.riggable()) return;

  if (!isdef(useThisComp)) {
    var parentComp = parent.comp;
    var childComp = this.comp;
    if (parentComp.id == childComp.id) useThisComp = true;
    else useThisComp = false;
  }
  var exp = parent.expressionLink(useThisComp);
  this.setExpression(exp, false);
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Link all the properties found in this prop to all the same properties of parentProp (this is a recursive method)<br />
 * Note: any Property or PropertyGroup (and its subproperties) named "Data" will be linked the opposite way (from parentProp to childProp).
 * @memberof DuAEProperty
 * @param {PropertyBase|DuAEProperty} parentProp - The parent property
 * @param {bool} [useThisComp] - Whether to begin the expression by 'thisComp' or 'comp("name")', default: will detect if the properties are in the same comp
 * @param {LayerItem} [timeLayer=null] - A layer used to offset the time (typically, in case of link between precompositions, the precomposition layer).<br />
 * When not null, the start time of this layer will be taken into account to get the values and synchronize them.
 */
DuAEProperty.prototype.linkProperties = function (
  parentProp,
  useThisComp,
  timeLayer,
) {
  if (parentProp.name.toLowerCase() == "data") return;

  var childProp = this.getProperty();
  var parent = new DuAEProperty(parentProp);
  var parentProp = parent.getProperty();
  if (childProp.matchName != parentProp.matchName) return;

  if (
    childProp.propertyType == PropertyType.PROPERTY &&
    !childProp.elided &&
    childProp.propertyValueType != PropertyValueType.NO_VALUE
  ) {
    timeLayer = def(timeLayer, null);

    if (!isdef(useThisComp)) {
      var parentComp = parent.comp;
      var childComp = this.comp;
      useThisComp = parentComp.id == childComp.id;
    }

    //copy paste the animation / value
    var anim = parent.animation(false);
    if (anim != null) this.setAnim(anim, 0, true, true, false);

    // Expression
    var exp = [
      DuAEExpression.Id.LINK,
      "var link = " + parent.expressionLink(useThisComp) + ";",
    ].join("\n");

    if (timeLayer != null) {
      exp += [
        "\nvar timeLayer = " + DuAELayer.expressionLink(timeLayer) + ";",
        "var timeOffset = timeLayer.startTime;",
        "var result = link.valueAtTime(time + timeOffset);",
        "result;",
      ].join("\n");
    } else {
      exp += "\nvar result = link.value;\nresult;";
    }

    //set the link
    this.setExpression(exp, false);
  } else {
    if (parent.isEffect) {
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

        var child = new DuAEProperty(childProp(p));
        var sub = new DuAEProperty(subProp);

        if (insideData == 0)
          child.linkProperties(subProp, useThisComp, timeLayer);
        else sub.linkProperties(child, useThisComp, timeLayer);
      }
    } else {
      for (var p = 1, num = childProp.numProperties; p <= num; p++) {
        try {
          var child = new DuAEProperty(childProp(p));
          child.linkProperties(parentProp(p), useThisComp, timeLayer);
        } catch (e) {
          DuDebug.throwError(
            childProp(p).name + " could not be linked.",
            "DuAEProperty.prototype.linkProperties",
            e,
            true,
          );
        }
      }
    }
  }
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Removes all expressions found in groups or sections named "Data" in the property.
 */
DuAEProperty.prototype.removeDataExpressions = function (prop) {
  var prop = this.getProperty();

  if (
    prop.propertyType == PropertyType.PROPERTY &&
    prop.name.toLowerCase() == "data"
  ) {
    this.removeExpression();
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
      if (insideData > 0) {
        new DuAEProperty(subProp).removeExpression();
      }
    }
  } else {
    if (prop.name.toLowerCase() == "data") this.removeExpressions();
    for (var p = 1, num = this.numProperties(); p <= num; p++) {
      this.prop(p).removeDataExpressions();
    }
  }
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Removes all expressions found in the property.
 * @param {function} filter - A function which takes a string as a parameter (the expression). Returns true if the expression has to be removed.
 * @param {Boolean} [keepPostExpressionValue=true] Set to false to just remove the expressions and get back the pre expression value
 */
DuAEProperty.prototype.removeExpressions = function (
  filter,
  keepPostExpressionValue,
) {
  // Defaults
  keepPostExpressionValue = def(keepPostExpressionValue, true);

  // Run
  this.do(function (propInfo) {
    prop = propInfo.getProperty();
    var expression = prop.expression;

    if (expression == "") return;
    if (typeof filter === "function") {
      if (!filter(expression)) return;
    }

    if (propInfo.riggable()) {
      if (keepPostExpressionValue) propInfo.setValue(prop.value);
      prop.expression = "";
    }
  });
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Enables or disables all expressions found in the property.
 * @param {Boolean} [enable=true] Set to false to disable expressions
 */
DuAEProperty.prototype.enableExpressions = function (enable) {
  // Defaults
  enable = def(enable, true);

  // Run
  this.do(function (propInfo) {
    prop = propInfo.getProperty();
    var expression = prop.expression;

    if (expression == "") return;

    if (propInfo.riggable()) {
      prop.expressionEnabled = enable;
    }
  });
};

/**
 * Alias for {@link DuAEProperty#removeExpressions DuAEProperty.removeExpressions()}
 * @alias DuAEProperty.removeExpressions()
 * @name removeExpression
 * @memberof DuAEProperty.prototype
 * @function
 */
DuAEProperty.prototype.removeExpression =
  DuAEProperty.prototype.removeExpressions;

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Recursilvely adds all the (supported) properties found to the essential graphics panel<br />
 * Note: any Property or PropertyGroup (and its subproperties) named "data" will be ignored.
 * @return {int} The number of properties added
 */
DuAEProperty.prototype.addToEGP = function () {
  var prop = this.getProperty();

  var numProps = 0;
  if (prop.name.toLowerCase() == "data") return numProps;

  if (
    prop.propertyType == PropertyType.PROPERTY &&
    prop.propertyValueType != PropertyValueType.NO_VALUE
  ) {
    var comp = this.comp;
    var layer = this.layer;

    //set the link
    if (
      prop.canAddToMotionGraphicsTemplate(comp) &&
      !prop.elided &&
      prop.canSetExpression
    ) {
      //get the name
      var mPropName = layer.name + " / " + this.expressionLink(true, false);
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
        if (insideData == 0) numProps += new DuAEProperty(subProp).addToEGP();
      }
    } else {
      for (var p = 1, numP = prop.numProperties; p <= numP; p++) {
        numProps += new DuAEProperty(prop.property(p)).addToEGP();
      }
    }
  }
  return numProps;
};

/**
 * Checks if the property has an animation (keyframes)
 * @return {boolean} True if the property is animated
 */
DuAEProperty.prototype.animated = function () {
  var prop = this.getProperty();
  if (prop.canVaryOverTime) {
    if (prop.numKeys > 0) return true;
  }
  return false;
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Gets the After Effects animated (with keyframes) properties in the propertyGroup
 * @param {PropertyType|PropertyValueType|string|function}	 [filter]	- A filter to get only a certain type, or value type, or property name or matchName.<br />
 * A function which take one PropertyBase as argument can be used to filter the properties: the Property will be returned if the function returns true.
 * @param {boolean}	[strict=false]	- If a string filter is provided, whether to search for the exact name/matchName or if it contains the filter.
 * @param {boolean}	[caseSensitive=true]	- If a string filter is provided, and not strict is false, does the search have to be case sensitive?
 * @return {DuAEProperty[]} The selected properties, an empty Array if nothing active or selected
 */
DuAEProperty.prototype.getAnimatedProps = function (
  filter,
  strict,
  caseSensitive,
) {
  var prop = this.getProperty();

  if (strict == undefined) strict = false;
  if (caseSensitive == undefined) caseSensitive = true;

  var props = [];

  if (!caseSensitive && typeof filter === "string")
    filter = filter.toLowerCase();

  if (
    prop.propertyType == PropertyType.PROPERTY &&
    prop.matchName != "ADBE Marker"
  ) {
    if (this.animated()) {
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
    for (var i = 0, num = this.numProperties(); i < num; i++) {
      props = props.concat(
        this.prop(i + 1).getAnimatedProps(filter, strict, caseSensitive),
      );
    }
  }

  return DuAE.getDuAEProperty(props);
};

/**
 * Gets the value range of the animated property.<br >
 * The property type must be one of: one D, two D, three D (spatial or not), Color.
 * If the property is not one of these types, returns an empty Array.
 * @param {int}	 [axis=0]	- The axis (or the color channel) to get the range
 * @param {bool}	 [preExpression=true]	- True to get the range from keyframes instead of the result of the exression
 * @param {bool}	 [fastMode=true]	- True to check the range with values only at keyframe times. False to check the range with all values, at each frame of the comp.
 * @return {float[]} The minimum and maximum value.<br />
 * The first item in the Array is not necesarily the lowest value, it is the first in time.
 */
DuAEProperty.prototype.range = function (axis, preExpression, fastMode) {
  axis = def(axis, 0);
  preExpression = def(preExpression, true);
  fastMode = def(fastMode, true);

  var prop = this.getProperty();

  if (!this.numerical()) return [];

  if (prop.expression == "" || !prop.expressionEnabled) preExpression = true;

  var comp = this.comp;
  var frames = comp.duration / comp.frameDuration;
  var min = prop.valueAtTime(0, preExpression);
  var minTime = 0;
  var max = prop.valueAtTime(0, preExpression);
  var maxTime = 0;
  var dimensions = this.dimensions();

  if (dimensions > 1) {
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
    if (dimensions > 1) val = val[axis];
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
 * Gets the maximum speed of the animated property.<br >
 * The property type must be one of: one D, two D, three D (spatial or not), Color.
 * If the property is not one of these types, returns 0.
 * @param {bool}	 [preExpression=true]	- True to get the velocity from keyframes instead of the result of the exression
 * @param {bool}	 [fastMode=true]	- True to limit the number of samples used to compute the velocity and make the process faster.<br />
 * The number of samples is automatically adapted from the duration of the composition.<br />
 * When true and if there are more than one keyframe, the velocity is sampled only between keyframes.
 * @return {float} The velocity.
 */
DuAEProperty.prototype.maxSpeed = function (preExpression, fastMode) {
  preExpression = def(preExpression, true);
  fastMode = def(fastMode, true);

  var prop = this.getProperty();

  var velocity = 0;
  if (!this.numerical()) return velocity;

  if (prop.expression == "") preExpression = true;

  var comp = this.comp;
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
    var vel = this.speedAtTime(i * comp.frameDuration, preExpression);
    if (vel > velocity) velocity = vel;
  }

  return velocity;
};

/**
 * Gets the maximum velocity of the animated property ofr a given axis.<br >
 * The property type must be one of: one D, two D, three D (spatial or not), Color.
 * If the property is not one of these types, returns 0.
 * @param {int}	 axis	- The axis
 * @param {bool}	 [preExpression=true]	- True to get the velocity from keyframes instead of the result of the exression
 * @param {bool}	 [fastMode=true]	- True to limit the number of samples used to compute the velocity and make the process faster.<br />
 * The number of samples is automatically adapted from the duration of the composition.<br />
 * When true and if there are more than one keyframe, the velocity is sampled only between keyframes.
 * @return {float} The velocity.
 */
DuAEProperty.prototype.maxVelocity = function (axis, preExpression, fastMode) {
  preExpression = def(preExpression, true);
  fastMode = def(fastMode, true);

  var prop = this.getProperty();

  var velocity = null;
  if (!this.numerical()) return velocity;

  if (prop.expression == "") preExpression = true;

  var comp = this.comp;
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
    var vel = this.velocityAtTime(i * comp.frameDuration, preExpression);
    if (this.dimensions() > 1) {
      if (velocity == null) velocity = vel[axis];
      else if (vel[axis] > velocity) velocity = vel[axis];
    } else {
      if (velocity == null) velocity = vel;
      else if (vel > velocity) velocity = vel;
    }
  }

  return velocity;
};

/**
 * Gets the minimum velocity of the animated property ofr a given axis.<br >
 * The property type must be one of: one D, two D, three D (spatial or not), Color.
 * If the property is not one of these types, returns 0.
 * @param {int}	 axis	- The axis
 * @param {bool}	 [preExpression=true]	- True to get the velocity from keyframes instead of the result of the exression
 * @param {bool}	 [fastMode=true]	- True to limit the number of samples used to compute the velocity and make the process faster.<br />
 * The number of samples is automatically adapted from the duration of the composition.<br />
 * When true and if there are more than one keyframe, the velocity is sampled only between keyframes.
 * @return {float} The velocity.
 */
DuAEProperty.prototype.minVelocity = function (axis, preExpression, fastMode) {
  preExpression = def(preExpression, true);
  fastMode = def(fastMode, true);

  var prop = this.getProperty();

  var velocity = null;
  if (!this.numerical()) return velocity;

  if (prop.expression == "") preExpression = true;

  var comp = this.comp;
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
    var vel = this.velocityAtTime(i * comp.frameDuration, preExpression);
    if (this.dimensions() > 1) {
      if (velocity == null) velocity = vel[axis];
      else if (vel[axis] < velocity) velocity = vel[axis];
    } else {
      if (velocity == null) velocity = vel;
      else if (vel < velocity) velocity = vel;
    }
  }

  return velocity;
};

/**
 * Scriptifies the given shape property.<br/>
 * Works only with path (bezier) properties.
 * @param {Boolean}	[offsetToCenter=false]	- If true, offset the path to the center
 * @param {string}	[varName=shape]	- A name for the variable storing the shape
 * @return {string} The scriptified shape
 */
DuAEProperty.prototype.scriptifyPath = function (offsetToCenter, varName) {
  var pathProperty = this.pathProperty();
  if (!pathProperty) return "";
  pathProperty = pathProperty.getProperty();

  offsetToCenter = def(offsetToCenter, false);
  varName = def(varName, "shape");

  if (pathProperty.propertyType !== PropertyType.PROPERTY)
    DuDebug.throwError(
      "Expected a shape property, got a group.",
      "DuAEProperty.prototype.scriptifyPath",
    );

  if (pathProperty.propertyValueType !== PropertyValueType.SHAPE)
    DuDebug.throwError(
      "Expected a shape property, got another type of value.",
      "DuAEProperty.prototype.scriptifyPath",
    );

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
 * Export the (shape) property to the given file.
 * @example
 * var props = DuAEComp.getSelectedProps(PropertyValueType.SHAPE);
 * var prop = props[0].getProperty();
 * var out = prop.exportPathToJsxinc("D:/shape.test");
 * @param {String}	file	- The path or File where the jsxinc shape will be written
 * @param {Boolean}	[offsetToCenter=false]	- If true, offset the path to the center
 * @param {Boolean}	[append=false]	- If true, appends the shape at the end of the file instead of overwriting it.
 * @param {string}	[varName="shape"]	- A name for the variable storing the shape
 * @return {Boolean} Success
 */
DuAEProperty.prototype.exportPathToJsxinc = function (
  file,
  offsetToCenter,
  append,
  varName,
) {
  append = def(append, false);

  if (!(file instanceof File)) file = new File(file);

  var scriptPath = "";
  if (append) scriptPath += "\n";
  scriptPath += this.scriptifyPath(offsetToCenter, varName);

  return DuFile.write(file, scriptPath, append);
};

/**
 * Gets the vertices array in comp coordinates.<br/>
 * Works only with path (bezier) properties.
 * @return {float[][]} The vertices in comp coordinates.
 */
DuAEProperty.prototype.verticesToComp = function () {
  var pathProp = this.pathProperty();
  if (!pathProp)
    DuDebug.throwError(
      "Expected a shape property, got another type of value.",
      "DuAEProperty.prototype.verticesToComp",
    );
  var pathProperty = pathProp.getProperty();

  //get the layer matrix
  var matrix = DuAEShapeLayer.getTransformMatrix(pathProp);

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
 * @return {DuAEProperty|null} the bezier property or null if it is not.
 */
DuAEProperty.prototype.pathProperty = function () {
  var prop = this.getProperty();

  //get the path property in case it was a mask or a shape path selected
  if (prop.matchName == "ADBE Vector Shape - Group") {
    prop = prop.property("ADBE Vector Shape");
    return new DuAEProperty(prop);
  } else if (prop.matchName == "ADBE Mask Atom") {
    prop = prop.property("ADBE Mask Shape");
    return new DuAEProperty(prop);
  } else if (prop.propertyType !== PropertyType.PROPERTY) return null;
  if (prop.propertyValueType !== PropertyValueType.SHAPE) return null;

  return this;
};

/**
 * Gets the average speed of the proprety
 * @param {bool}	 [preExpression=true]	- True to get the velocity from keyframes instead of the result of the exression
 * @param {bool}	 [fastMode=true]	- True to limit the number of samples used to compute the velocity and make the process faster.
 * @return {float} The average speed in unit per second
 */
DuAEProperty.prototype.averageSpeed = function (preExpression, fastMode) {
  preExpression = def(preExpression, true);
  fastMode = def(fastMode, true);

  return DuAEProperty.getAverageSpeed([this], preExpression, fastMode);
};

/**
 * Adjust the value so it can be set on the specific property (adjust the number of dimensions or the type of value)
 * @param {Property|DuAEProperty} property The property
 * @param {any} value The value to set
 * @returns {any} The converted value
 */
DuAEProperty.prototype.fixValue = function (value) {
  prop = this.getProperty();

  var dimensions = this.dimensions();

  // Numeric
  if (dimensions > 0) {
    // Single
    if (dimensions == 1 && value instanceof Array) {
      value = value[0];
      return parseFloat(value);
    }
    // Array
    if (!(value instanceof Array)) value = [value];

    while (value.length < dimensions) {
      value.push(0);
    }
    while (value.length > dimensions) {
      value.pop();
    }

    return value;
  }

  // Non numeric

  var valueType = prop.propertyValueType;

  // Text
  if (valueType == PropertyValueType.TEXT_DOCUMENT) {
    var textDoc = prop.value;
    textDoc.text = value;
    return textDoc;
  }

  // TODO Path

  return value;
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Quickly bakes an expression, adding a keyframe/frame
 * @param {float} [frameStep=1.0] By default, adds one keyframe per frame. Use a lower value to add sub-frame keyframes, a higher value to add less keyframes.
 */
DuAEProperty.prototype.quickBakeExpressions = function (frameStep) {
  // Defaults
  frameStep = def(frameStep, 1.0);
  range = [0, this.comp.duration];
  var step = this.comp.frameDuration * frameStep;
  // Run
  this.do(function (propInfo) {
    $.write(
      "Baking expression:\nLayer: " +
        propInfo.layer.name +
        "\nProperty: " +
        propInfo.name,
    );
    prop = propInfo.getProperty();
    // Checks
    if (!propInfo.riggable()) return;
    if (prop.expression == "") return;
    // We don't support all kind of properties yet
    var valueType = prop.propertyValueType;
    if (valueType == PropertyValueType.NO_VALUE) return;
    if (valueType == PropertyValueType.MARKER) return;
    if (valueType == PropertyValueType.LAYER_INDEX) return;
    if (valueType == PropertyValueType.MASK_INDEX) return;
    if (!propInfo.editable()) return;
    // Get the values and times
    var values = [];
    var times = [];
    for (var time = range[0]; time < range[1]; time += step) {
      times.push(time);
      values.push(prop.valueAtTime(time, false));
    }
    // Disable expression
    prop.expressionEnabled = false;
    // Remove current keyframes
    propInfo.removeAnimation();
    // Set values
    try {
      prop.setValuesAtTimes(times, values);
    } catch (e) {}
    // Clean
    propInfo.cleanKeyframes();
    // Set Continuous
    propInfo.setInterpolation("continuous");
  });
};

/**
 * Alias for {@link DuAEProperty#quickBakeExpressions DuAEProperty.quickBakeExpressions()}
 * @alias DuAEProperty.quickBakeExpressions()
 * @name quickBakeExpression
 * @memberof DuAEProperty.prototype
 * @function
 */
DuAEProperty.prototype.quickBakeExpression =
  DuAEProperty.prototype.quickBakeExpressions;

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Uses a smarter algorithm to bake the expression to keyframes
 * @param {float} [frameStep=1.0] By default, checks one value per keyframe. A lower value increases the precision and allows for sub-frame sampling. A higher value is faster but less precise. Minimum: 0.1
 */
DuAEProperty.prototype.smartBakeExpressions = function (frameStep) {
  // Defaults
  frameStep = def(frameStep, 1.0);
  if (frameStep < 0.1) frameStep = 0.1;
  range = [0, this.comp.duration];
  var step = this.comp.frameDuration;
  // Run
  this.do(function (propInfo) {
    $.write(
      "Baking expression:\nLayer: " +
        propInfo.layer.name +
        "\nProperty: " +
        propInfo.name,
    );
    prop = propInfo.getProperty();
    // Checks
    if (!propInfo.riggable()) return;
    if (prop.expression == "") return;
    // We don't support all kind of properties yet
    var valueType = prop.propertyValueType;
    if (valueType == PropertyValueType.NO_VALUE) return;
    if (valueType == PropertyValueType.MARKER) return;
    if (valueType == PropertyValueType.LAYER_INDEX) return;
    if (valueType == PropertyValueType.MASK_INDEX) return;
    // Some properties can't be smart baked
    if (valueType == PropertyValueType.SHAPE)
      return propInfo.quickBakeExpressions();
    if (valueType == PropertyValueType.TEXT_DOCUMENT)
      return propInfo.quickBakeExpressions();
    if (valueType == PropertyValueType.CUSTOM_VALUE)
      return propInfo.quickBakeExpressions();

    // Check if we can add keyframes on the property
    if (!propInfo.editable()) return;
    // Get the values and times
    // The extremes
    var extremeValues = [];
    var extremeValuesAround = [];
    var extremeTimes = [];
    var maxVelocity = 0;
    // The inflexions
    var inflexionValues = [];
    var inflexionSpeeds = [];
    var inflexionTimes = [];
    // First and last points if they're not extremes
    var startValue = null;
    var endValue = null;
    // Max amplitude of the values (to adjust precision later)
    var amplitude = 0;
    for (var time = range[0]; time <= range[1] + step; time += step) {
      var currentValue = prop.valueAtTime(time, false);
      var nextValue = prop.valueAtTime(time + step, false);
      var prevValue = prop.valueAtTime(time - step, false);
      var currentVelocity = propInfo.velocityAtTime(time, false);
      var nextVelocity = propInfo.velocityAtTime(time + step, false);
      var prevVelocity = propInfo.velocityAtTime(time - step, false);

      if (currentVelocity > maxVelocity) maxVelocity = currentVelocity;

      // Get values and times
      // Extremes
      if (
        DuMath.isExtremePoint(
          prevValue,
          currentValue,
          nextValue,
          Math.round(1 / frameStep),
        )
      ) {
        // Get amplitude
        for (var i = 0, n = extremeValues.length; i < n; i++) {
          var length = DuMath.length(currentValue, extremeValues[i]);
          if (length > amplitude) amplitude = length;
        }
        // Add to extremes
        extremeTimes.push(time);
        extremeValues.push(currentValue);
        extremeValuesAround.push([prevValue, nextValue]);
      }
      // Inflexions
      else if (
        DuMath.isInflexionPoint(prevVelocity, currentVelocity, nextVelocity)
      ) {
        inflexionValues.push(currentValue);
        if (!(currentVelocity instanceof Array)) speed = currentVelocity;
        else if (
          prop.propertyValueType != PropertyValueType.TwoD &&
          prop.propertyValueType != PropertyValueType.ThreeD
        ) {
          speed = propInfo.speedAtTime(time);
        } else speed = currentVelocity;
        inflexionSpeeds.push(speed);
        inflexionTimes.push(time);
      }
      // Start value
      else if (time == range[0]) startValue = currentValue;
      // End value
      else if (time >= range[1]) {
        endValue = currentValue;
        break;
      }
    }

    // Adjust the precision for comparisons
    var comparisonPrecision = (amplitude / 50) * frameStep;
    // Disable expression
    prop.expressionEnabled = false;
    // Collect interpolations/influences and remove animation
    // The result can be better if we reset them after baking the expression.
    propAnim = propInfo.takeAnimation();
    // Set extreme values
    if (extremeValues.length > 0) {
      // For some reason, there are still properties here which can't receive keyframes
      try {
        prop.setValuesAtTimes(extremeTimes, extremeValues);
        // Clean
        propInfo.cleanKeyframes();
        // Set to default Bézier
        propInfo.setInterpolation(KeyframeInterpolationType.BEZIER);

        // Temp workaround because we need to wait for AE!
        var slowDown = 200;
        var timeOffset = 0;

        // Reset original interpolation if there are keyframes at the same time (+- a half step)
        // AND velocity was 0 AND prev and next values are closer after that
        for (var t = 0; t < extremeTimes.length; t++) {
          var time = extremeTimes[t];
          var keyIndex = prop.nearestKeyIndex(time);
          //alert(keyIndex);
          for (var k = 0; k < propAnim.keys.length; k++) {
            var key = propAnim.keys[k];
            if (Math.abs(key._time - time) > (step * frameStep) / 2) continue;

            // Check the current offsets
            $.sleep(slowDown);
            var prevOffset = DuMath.length(
              prop.valueAtTime(time - step, false),
              extremeValuesAround[t][0],
            );
            var nextOffset = DuMath.length(
              prop.valueAtTime(time + step, false),
              extremeValuesAround[t][1],
            );

            // Set interpolation
            prop.setInterpolationTypeAtKey(
              keyIndex,
              key._inInterpolationType,
              key._outInterpolationType,
            );
            // Set influences
            if (key.inEase && key.outEase)
              prop.setTemporalEaseAtKey(keyIndex, key.inEase, key.outEase);

            // Check if it's better!
            $.sleep(slowDown);
            propInfo.comp.time += step;
            timeOffset += step;
            $.sleep(slowDown);
            var newPrevOffset = DuMath.length(
              prop.valueAtTime(time - step, false),
              extremeValuesAround[t][0],
            );
            var newNextOffset = DuMath.length(
              prop.valueAtTime(time + step, false),
              extremeValuesAround[t][1],
            );

            // Nope, restore
            if (newPrevOffset > prevOffset) {
              prop.setInterpolationTypeAtKey(
                keyIndex,
                KeyframeInterpolationType.BEZIER,
                prop.keyOutInterpolationType(keyIndex),
              );
              var ke = new KeyframeEase(0, 33);
              var ease = [ke];
              if (
                prop.propertyValueType == PropertyValueType.TwoD ||
                prop.propertyValueType == PropertyValueType.ThreeD
              )
                ease.push(ke);
              if (prop.propertyValueType == PropertyValueType.ThreeD)
                ease.push(ke);
              prop.setTemporalEaseAtKey(
                keyIndex,
                ease,
                prop.keyOutTemporalEase(keyIndex),
              );
            }
            if (newNextOffset > nextOffset) {
              prop.setInterpolationTypeAtKey(
                keyIndex,
                prop.keyInInterpolationType(keyIndex),
                KeyframeInterpolationType.BEZIER,
              );
              var ke = new KeyframeEase(0, 33);
              var ease = [ke];
              if (
                prop.propertyValueType == PropertyValueType.TwoD ||
                prop.propertyValueType == PropertyValueType.ThreeD
              )
                ease.push(ke);
              if (prop.propertyValueType == PropertyValueType.ThreeD)
                ease.push(ke);
              prop.setTemporalEaseAtKey(
                keyIndex,
                prop.keyInTemporalEase(keyIndex),
                ease,
              );
            }

            break;
          }

          // Play with the tangents to improve if there's no speed
          /*var inEase = prop.keyInTemporalEase(keyIndex);
                    var inSpeed = true;
                    for (var i =0; i < inEase.length; i++) {
                        if (Math.abs(inEase[i].speed) > 0) {
                            inSpeed = false;
                            break;
                        }
                    }*/

          //$.sleep(slowDown);
          /* propInfo.comp.time += step;
                    timeOffset += step;
                    var currentPrevOffset = DuMath.length( prop.valueAtTime(time-step, false), extremeValuesAround[t][0] );
                    //alert('current offset before: ' + currentPrevOffset);
                    var prevTestOffset = Number.POSITIVE_INFINITY;

                    if (currentPrevOffset > comparisonPrecision) {
                        var ease = prop.keyInTemporalEase(keyIndex);
                        for (var i = 0; i < ease.length; i++) {
                            var testKeyframeEase = new KeyframeEase(ease[i].speed, 0.1);
                            var previousInfluence = 0.1;

                            var testEase = ease;
                            
                            while (testEase.influence <= 100) {

                                // Set a new influence
                                testEase[i] = testKeyframeEase;
                                prop.setTemporalEaseAtKey(keyIndex, testEase, prop.keyOutTemporalEase(keyIndex));

                                // Check the new offset
                                //$.sleep(slowDown);
                                propInfo.comp.time += step;
                                timeOffset += step;
                                var testPrevOffset = DuMath.length( prop.valueAtTime(time-step, false), extremeValuesAround[t][0] );
                                //alert('test offset before: ' + testPrevOffset);
                                // Restore previous if we've gone too far
                                if (testPrevOffset > prevTestOffset) {
                                    testKeyframeEase.influence = previousInfluence;
                                    testEase[i] = testKeyframeEase;
                                    prop.setTemporalEaseAtKey(keyIndex, testEase, prop.keyOutTemporalEase(keyIndex));
                                    break;
                                }
                                prevTestOffset = testPrevOffset;
                                previousInfluence = testKeyframeEase.influence;
                                var newInfluence = Math.floor(testKeyframeEase.influence + frameStep*10);
                                if (newInfluence > 100) break;
                                testKeyframeEase.influence = newInfluence;
                            }

                            // Check the new offset
                            var testPrevOffset = DuMath.length( prop.valueAtTime(time-step, false), extremeValuesAround[t][0] );
                            // If it's not better, restore
                            if (testPrevOffset > currentPrevOffset) {
                                prop.setTemporalEaseAtKey(keyIndex, ease, prop.keyOutTemporalEase(keyIndex));
                            }
                        }
                    }*/

          /*var outEase = prop.keyOutTemporalEase(keyIndex);
                    var outSpeed = true;
                    for (var i = 0; i < outEase.length; i++) {
                        if (Math.abs(outEase[i].speed) > 0) {
                            outSpeed = false;
                            break;
                        }
                    }*/

          //$.sleep(slowDown);
          /*propInfo.comp.time += step;
                    timeOffset += step;
                    var currentNextOffset = DuMath.length( prop.valueAtTime(time+step, false), extremeValuesAround[t][1] );
                    //alert('current offset after: ' + currentNextOffset);
                    prevTestOffset = Number.POSITIVE_INFINITY;

                    if (currentNextOffset > comparisonPrecision) {
                        var ease = prop.keyOutTemporalEase(keyIndex);
                        for (var i = 0; i < ease.length; i++) {
                            var testKeyframeEase = new KeyframeEase(ease[i].speed, 0.1);
                            var previousInfluence = 0.1;

                            var testEase = ease;
                            
                            while (testEase.influence <= 100) {

                                // Set a new influence
                                testEase[i] = testKeyframeEase;
                                prop.setTemporalEaseAtKey(keyIndex, prop.keyInTemporalEase(keyIndex), testEase);

                                // Check the new offset
                                //$.sleep(slowDown);
                                propInfo.comp.time += step;
                                timeOffset += step;
                                var testNextOffset = DuMath.length( prop.valueAtTime(time+step, true), extremeValuesAround[t][1] );
                                //alert('test offset after: ' + testNextOffset);
                                // Restore previous if we've gone too far
                                if (testNextOffset > prevTestOffset) {
                                    testKeyframeEase.influence = previousInfluence;
                                    testEase[i] = testKeyframeEase;
                                    prop.setTemporalEaseAtKey(keyIndex, prop.keyInTemporalEase(keyIndex), testEase);
                                    break;
                                }
                                prevTestOffset = testNextOffset;
                                previousInfluence = testKeyframeEase.influence;
                                var newInfluence = Math.floor(testKeyframeEase.influence + frameStep*10);
                                if (newInfluence > 100) break;
                                testKeyframeEase.influence = newInfluence;
                            }

                            // Check the new offset
                            var testNextOffset = DuMath.length( prop.valueAtTime(time+step, false), extremeValuesAround[t][1] );
                            // If it's not better, restore
                            if (testNextOffset > currentNextOffset) {
                                prop.setTemporalEaseAtKey(keyIndex, prop.keyInTemporalEase(keyIndex), ease);
                            }
                        }
                    }*/
        }

        // Reset the comp CTI
        propInfo.comp.time -= timeOffset;
      } catch (e) {
        if (DuESF.debug) alert("Line: " + e.line + "\n" + e.message);
      }
    }
    // Set inflexion values
    if (inflexionValues.length > 0 && false) {
      // Set inflexion values and speeds
      for (var i = 0, n = inflexionValues.length; i < n; i++) {
        var inflexionTime = inflexionTimes[i];
        // Compare value to set the key frame
        var inflexionValue = inflexionValues[i];
        var currentValue = prop.valueAtTime(inflexionTime, true);
        // Already close to the current curve, no need to add a keyframe
        if (DuMath.length(inflexionValue, currentValue) <= comparisonPrecision)
          continue;
        // Set the new keyframe
        try {
          prop.setValueAtTime(inflexionTime, inflexionValue);
          var inflexionKey = prop.nearestKeyIndex(inflexionTime);
          // Spatial, set to continuous
          if (prop.isSpatial)
            propInfo.setKeyInterpolation(inflexionKey, "continuous");
          // other, set speed
          else propInfo.setKeySpeed(inflexionKey, inflexionSpeeds[i]);
        } catch (e) {}
      }
    }
    // Set start and end value
    if (startValue !== null) {
      // For some reason, there are still properties here which can't receive keyframes
      try {
        prop.setValueAtTime(range[0], startValue);
        var startKey = prop.nearestKeyIndex(range[0]);
        propInfo.setKeyInterpolation(startKey, "continuous");
      } catch (e) {}
    }
    if (endValue !== null) {
      // For some reason, there are still properties here which can't receive keyframes
      try {
        prop.setValueAtTime(range[1], endValue);
        var endKey = prop.nearestKeyIndex(range[1]);
        propInfo.setKeyInterpolation(endKey, "continuous");
      } catch (e) {}
    }
    // Clean
    propInfo.cleanKeyframes(Math.round(1 / frameStep));
    propInfo.fixSpatialInterpolation(Math.round(1 / frameStep));
  });
};

/**
 * Alias for {@link DuAEProperty#smartBakeExpressions DuAEProperty.smartBakeExpressions()}
 * @alias DuAEProperty.smartBakeExpressions()
 * @name smartBakeExpression
 * @memberof DuAEProperty.prototype
 * @function
 */
DuAEProperty.prototype.smartBakeExpression =
  DuAEProperty.prototype.smartBakeExpressions;

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Bakes the expressions to keyframes
 * @param {DuAEExpression.BakeAlgorithm} [mode=DuAEExpression.BakeAlgorithm.SMART] By default, checks one value per keyframe. A lower value increases the precision and allows for sub-frame sampling. A higher value is faster but less precise.
 * @param {float} [frameStep=1.0] By default, checks one value per keyframe. A lower value increases the precision and allows for sub-frame sampling. A higher value is faster but less precise.
 */
DuAEProperty.prototype.bakeExpressions = function (mode, frameStep) {
  mode = def(mode, DuAEExpression.BakeAlgorithm.SMART);
  frameStep = def(frameStep, 1.0);
  if (mode == DuAEExpression.BakeAlgorithm.SMART)
    this.smartBakeExpressions(frameStep);
  else this.quickBakeExpressions(frameStep);
};

/**
 * Alias for {@link DuAEProperty#bakeExpressions DuAEProperty.bakeExpressions()}
 * @alias DuAEProperty.bakeExpressions()
 * @name bakeExpression
 * @memberof DuAEProperty.prototype
 * @function
 */
DuAEProperty.prototype.bakeExpression = DuAEProperty.prototype.bakeExpressions;

/**
 * Finds the same property in the given comp (same path & name)
 * @param {CompItem} comp The composition where to find the property
 * @return {DuAEProperty|null} The property or null if it wasn't found
 */
DuAEProperty.prototype.findInComp = function (comp) {
  // Checks
  // We need to find the same layer.
  var layerIndex = this.layer.index;
  if (layerIndex > comp.numLayers) return null;

  // Go down the tree from the layer
  var parentProp = comp.layer(this.layer.index);
  for (var i = 0, n = this.parentIndices.length; i < n; i++) {
    // Make sure the property index exists...
    var propIndex = this.parentIndices[i];
    if (propIndex > parentProp.numProperties) return null;
    // Get the next prop
    parentProp = parentProp.property(propIndex);
  }

  // Check the matchname
  if (parentProp.matchName == this.matchName)
    return new DuAEProperty(parentProp);
  return null;
};

/**
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * Automatically sets all "transition" keyframes to roving, if the property is spatial.
 */
DuAEProperty.prototype.setRoving = function () {
  // Run
  var frameDuration = this.comp.frameDuration;

  this.do(function (propInfo) {
    var prop = propInfo.getProperty();
    // checks
    if (!prop.isSpatial) return;
    if (!prop.canVaryOverTime) return;

    // For each keyframe (except first and last one), check if the velocity just before or after is 0,
    // if not, set to roving
    for (var i = 2; i < prop.numKeys; i++) {
      var t = prop.keyTime(i);
      var cV = prop.keyValue(i);
      var pV = prop.valueAtTime(t - frameDuration, true);
      if (DuMath.equals(pV, cV)) continue;
      var nV = prop.valueAtTime(t + frameDuration, true);
      if (DuMath.equals(nV, cV)) continue;
      prop.setRovingAtKey(i, true);
    }
  });
};

/**
 * Snaps keyframes to the closest frames if they're in between.
 * <p><i><strong>Recursive</strong>: this method can run on a property group.</i></p>
 * @param {int[]} [keys] An optional list of key indices to snap (could be <code>DuAEProperty.selectedKeys()</code> for example). If omitted, will snap all keyframes.
 */
DuAEProperty.prototype.snapKeys = function (keys) {
  this.do(function (prop) {
    var ks = [];
    if (!isdef(keys)) {
      for (var i = 1, n = prop.numKeys(false); i <= n; i++) ks.push(i);
    } else ks = keys;

    var frameDuration = prop.comp.frameDuration;
    var halfFrame = frameDuration / 2.0;
    // Snap each key
    for (var k = 0; k < ks.length; k++) {
      var key = prop.keyAtIndex(ks[k]);
      var mod = key._time % frameDuration;
      if (mod != 0) {
        prop.removeKey(key);
        if (mod < halfFrame) key._time -= mod;
        else key._time += frameDuration - mod;
        prop.setKey(key, 0);
      }
    }
  });
};

// =========== STATIC ====================

/**
 * Gets the After Effects properties in the property
 * @static
 * @param {PropertyBase|DuAEProperty}	property	- The layer
 * @param {PropertyType|PropertyValueType|string|function}	 [filter]	- A filter to get only a certain type, or value type, or property name or matchName.<br />
 * A function which take one PropertyBase as argument can be used to filter the properties: the Property will be returned if the function returns true.
 * @param {boolean}	[strict=false]	- If a string filter is provided, whether to search for the exact name/matchName or if it contains the filter.
 * @param {boolean}	[caseSensitive=true]	- If a string filter is provided, and not strict is false, does the search have to be case sensitive?
 * @return {DuAEProperty[]} The selected properties, an empty Array if nothing found
 */
DuAEProperty.getProps = function (property, filter, strict, caseSensitive) {
  if (strict == undefined) strict = false;
  if (caseSensitive == undefined) caseSensitive = true;
  var prop;
  if (property instanceof DuAEProperty) prop = property.getProperty();
  else prop = property;

  var props = [];

  if (!caseSensitive && typeof filter === "string")
    filter = filter.toLowerCase();

  var name = prop.name;
  var matchName = prop.matchName;
  if (!caseSensitive) {
    name = name.toLowerCase();
    matchName = matchName.toLowerCase();
  }

  if (strict && name === filter) props.push(prop);
  else if (strict && matchName === filter) props.push(prop);
  else if (!strict && typeof filter === "string") {
    if (name.indexOf(filter) >= 0) props.push(prop);
    else if (matchName.indexOf(filter) >= 0) props.push(prop);
  } else if (typeof filter === "function") {
    if (filter(prop)) props.push(prop);
  } else if (prop.propertyType == filter) {
    props.push(prop);
  } else if (prop.propertyType == PropertyType.PROPERTY) {
    if (prop.propertyValueType == filter) props.push(prop);
  }

  if (prop.numProperties > 0) {
    for (var k = 1, numP = prop.numProperties; k <= numP; k++) {
      props = props.concat(
        DuAEProperty.getProps(prop.property(k), filter, strict, caseSensitive),
      );
    }
  }

  return DuAE.getDuAEProperty(props);
};

/**
 * Generates a new unique name for a marker for this marker porperty
 * @static
 * @param {string} newName	- The wanted new name
 * @param {Property} markerProp 	- The marker property
 * @param {boolean} [increment=true] - true to automatically increment the new name if it already ends with a digit
 * @return {string}	The unique name, with a new number at the end if needed.
 */
DuAEProperty.newUniqueMarkerName = function (newName, markerProp, increment) {
  if (increment == undefined) increment = true;
  var markerNames = [];
  for (var i = 1, num = prop.numKeys; i <= num; i++) {
    markerNames.push(prop.keyValue(i).comment);
  }
  return DuString.generateUnique(newName, markerNames, increment);
};

/**
 * Changes the interpolation type on selected keyframes, or sets a new key at current time if there are no keyframes selected.
 * @static
 * @param {Layer[]|LayerCollection} layers - The layers containing the properties
 * @param {PropertyBase[]|DuAEProperty[]} props - The properties
 * @param {KeyframeInterpolationType|string} typeIn - The in interpolation type (see AE API) or the string "roving" or "continuous"
 * @param {KeyframeInterpolationType|string} [typeOut=typeIn] - The out interpolation type (see AE API)
 * @param {int[]|int} [easeInValue=33] - The in interpolation ease value (used if typeIn is KeyframeInterpolationType.BEZIER)
 * @param {int[]|int} [easeOutValue=easeInValue] - The out interpolation ease value (used if typeOut is KeyframeInterpolationType.BEZIER)
 */
DuAEProperty.setInterpolationType = function (
  layers,
  props,
  typeIn,
  typeOut,
  easeInValue,
  easeOutValue,
) {
  typeOut = def(typeOut, typeIn);
  easeInValue = def(easeInValue, 33);
  if (isNaN(easeInValue)) easeInValue = 33;
  easeOutValue = def(easeOutValue, easeInValue);
  if (isNaN(easeOutValue)) easeOutValue = 33;

  if (layers.length == 0) return;

  if (!DuAELayer.haveSelectedKeys(layers)) {
    DuAEProperty.addKey(props, typeIn, typeOut, easeInValue, easeOutValue);
  } else {
    for (var i = 0; i < props.length; i++) {
      var aeprop = new DuAEProperty(props[i]);
      var prop = aeprop.getProperty();

      if (prop.canVaryOverTime) {
        //for keys
        for (var k = 0, num = prop.selectedKeys.length; k < num; k++) {
          aeprop.setKeyInterpolation(
            prop.selectedKeys[k],
            typeIn,
            typeOut,
            easeInValue,
            easeOutValue,
          );
        }
      }
    }
  }
};

/**
 * Gets the maximum speed of the animated properties
 * @static
 * @param {Property[]|DuAEProperty[]} props - The Properties
 * @param {bool}	 [preExpression=true]	- True to get the velocity from keyframes instead of the result of the exression
 * @return {float} The average speed
 */
DuAEProperty.getMaximumSpeed = function (props) {
  var maxSpeed = 0;

  for (var i = 0; i < props.length; i++) {
    var prop = new DuAEProperty(prop);
    var speed = prop.maxVelocity(false);
    if (speed > maxSpeed) maxSpeed = speed;
  }

  return maxSpeed;
};

/**
 * Locks the properties with an expression so thier values cannot be changed
 * @param {PropertyBase|DuAEProperty|PropertyBase[]|DuAEProperty[]} properties - The property or properties
 */
DuAEProperty.lock = function (properties) {
  var it = new DuList(properties);
  it.do(function (property) {
    property = new DuAEProperty(property);
    var p = property.getProperty();

    if (property.riggable()) {
      var dimensions = property.dimensions();
      var exp = "";
      if (dimensions == 0) exp = "value";
      else if (dimensions == 1) exp = p.value.toString();
      else exp = p.value.toSource();
      property.setExpression(exp);
    }
  });
};

/**
 * Gets the average speed of the animated propreties
 * @static
 * @param {Property[]|DuAEProperty[]|DuList.<DuAEProperty>|DuList.<Property>} props - The Properties
 * @param {bool}	 [preExpression=true]	- True to get the velocity from keyframes instead of the result of the exression
 * @param {bool}	 [fastMode=true]	- True to limit the number of samples used to compute the velocity and make the process faster.
 * @return {float} The average speed in unit per second
 */
DuAEProperty.getAverageSpeed = function (props, preExpression, fastMode) {
  preExpression = def(preExpression, true);
  fastMode = def(fastMode, true);

  props = new DuList(props);

  var averageSpeed = 0;
  var count = 0;

  for (var i = 0; i < props.length(); i++) {
    var aeprop = new DuAEProperty(props.at(i));
    var prop = aeprop.getProperty();

    if (prop.propertyType != PropertyType.PROPERTY) continue;
    if (!prop.canVaryOverTime) continue;
    if (prop.numKeys < 1 && !preExpression) continue;

    var comp = aeprop.comp;
    var frames = comp.duration / comp.frameDuration;
    var lastTime = comp.duration;
    var firstTime = 0;
    if (preExpression || (fastMode && prop.numKeys > 1)) {
      lastTime = prop.keyTime(prop.numKeys);
      firstTime = prop.keyTime(1);
    }
    var lastFrame = lastTime / comp.frameDuration;
    var firstFrame = firstTime / comp.frameDuration;
    if (lastFrame > frames) lastFrames = frames;
    if (firstFrame < 1) firstFrame = 1;

    var step = 1;
    if (fastMode) {
      var numFrames = lastFrame - firstFrame;
      if (numFrames > 1000) {
        step = Math.floor(numFrames / 500);
      }
    }

    var sum = 0;
    for (var frame = firstFrame; frame < lastFrame; frame = frame + step) {
      var time = frame * comp.frameDuration;
      sum += aeprop.speedAtTime(time, preExpression);
    }
    var speed = sum / (lastFrame - firstFrame);

    if (speed > 0) {
      averageSpeed += speed;
      count++;
    }
  }

  averageSpeed = averageSpeed / count;
  return averageSpeed;
};

/**
 * Makes a horizontal symetry transformation on the paths, using the same axis of symetry for all shapes (shapes must be on the same layer).
 * @param {Property[]|DuAEProperty[]}	pathProperties	- The After Effects Properties containing the paths to symetrize
 */
DuAEProperty.pathHorizontalSymetry = function (pathProperties) {
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
    var aeprop = new DuAEProperty(pathProperties[i]);
    var prop = aeprop.getProperty();

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
      prop.setValueAtTime(aeprop.comp().time, shape);
    } else {
      prop.setValue(shape);
    }
  }
};

/**
 * Makes a vertical symetry transformation on the paths, using the same axis of symetry for all shapes (shapes must be on the same layer).
 * @param {Property[]}	pathProperties	- The After Effects Properties containing the paths to symetrize
 */
DuAEProperty.pathVerticalSymetry = function (pathProperties) {
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
    var aeprop = new DuAEProperty(pathProperties[i]);
    var prop = pathProperties[i];

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
      prop.setValueAtTime(aeprop.comp().time, shape);
    } else {
      prop.setValue(shape);
    }
  }
};

/**
 * Gets the sourceRect of the properties (their bounds) in layer coordinates
 * @param {Property[]}	pathProperties	- The After Effects Properties containing the paths
 * @param {Boolean}	[includeTangents=false]	Wether to include tangents in the bounds or not
 * @return {float[]} The bounds [top, left, width, height]
 */
DuAEProperty.pathBounds = function (pathProperties, includeTangents) {
  if (!(pathProperties instanceof Array)) pathProperties = [pathProperties];

  includeTangents = def(includeTangents, false);

  var top = 32000;
  var left = 32000;
  var width = 0;
  var height = 0;

  var verts = [];
  var inTs = [];
  var outTs = [];

  for (var i = 0, n = pathProperties.length; i < n; i++) {
    var prop = new DuAEProperty(pathProperties[i]);
    var pathProp = prop.pathProperty().getProperty();
    if (!pathProp) continue;
    var shape = pathProp.value;
    var vert = shape.vertices;
    var inT = shape.inTangents;
    var outT = shape.outTangents;

    verts = verts.concat(vert);
    inTs = inTs.concat(inT);
    outTs = outTs.concat(outT);
  }

  var sBounds = DuMath.bounds(verts);
  if (sBounds[0] < left) left = sBounds[0];
  if (sBounds[1] < top) top = sBounds[1];
  var w = sBounds[2] - left;
  if (w > width) width = w;
  var h = sBounds[3] - top;
  if (h > height) height = h;

  if (includeTangents) {
    // Adjust coordinates because tangents are given relative to their vertex
    for (var j = 0, nj = vert.length; j < nj; j++) {
      inTs[j] = inTs[j] + verts[j];
      outTs[j] = outTs[j] + verts[j];
    }

    var iBounds = DuMath.bounds(inTs);
    if (iBounds[0] < left) left = iBounds[0];
    if (iBounds[1] < top) top = iBounds[1];
    var w = iBounds[2] - left;
    if (w > width) width = w;
    var h = iBounds[3] - top;
    if (h > height) height = h;

    var oBounds = DuMath.bounds(outTs);
    if (oBounds[0] < left) left = oBounds[0];
    if (oBounds[1] < top) top = oBounds[1];
    var w = oBounds[2] - left;
    if (w > width) width = w;
    var h = oBounds[3] - top;
    if (h > height) height = h;
  }

  return [top, left, width, height];
};

/**
 * Checks if the property contains a Bézier "path" property (it's a mask path or a shape layer path).<br />
 * The function can be used as a filter for {@link DuAELayer.getSelectedProps}.
 * @param {PropertyGroup} prop The property to check
 * @returns {Boolean} true if it's a path property.
 */
DuAEProperty.isPathProperty = function (prop) {
  if (prop.matchName == "ADBE Vector Shape - Group") return true;
  if (prop.matchName == "ADBE Mask Atom") return true;
  return false;
};

/**
 * Safely renames a property (without breaking expressions)
 * @param {PropertyBase} prop The property
 * @param {string} name The new name.
 * @returns {string} The new name.
 */
DuAEProperty.rename = function (prop, name) {
  var oldName = prop.name;
  prop.name = name;
  var newName = prop.name;
  app.project.autoFixExpressions(oldName, newName);
};

/**
 * Compares two shape values
 * @param {Shape} shape1
 * @param {Shape} shape2
 * @return {bool} true if they're the same
 */
DuAEProperty.shapeValueEquals = function (shape1, shape2, precision) {
  precision = def(precision, 1);

  if (shape1.closed != shape2.closed) return false;

  if (!DuMath.equals(shape1.vertices, shape2.vertices, precision, true))
    return false;
  if (!DuMath.equals(shape1.inTangents, shape2.inTangents, precision))
    return false;
  if (!DuMath.equals(shape1.outTangents, shape2.outTangents, precision))
    return false;
  return true;
};

/**
 * Compares two text values
 * @param {TextDocument} text1
 * @param {TextDocument} text2
 * @return {bool} true if they're the same
 */
DuAEProperty.textValueEquals = function (text1, text2) {
  return text1.text == text2.text;
};
