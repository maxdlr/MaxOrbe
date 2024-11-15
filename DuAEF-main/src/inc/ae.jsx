﻿/**
 * Constructs a new KeySpatialProperty
 * @class DuAEKeySpatialProperties
 * @classdesc Spatial properties of a {@linkcode DuAEKeyframe}.
 * @param {DuAEKeySpatialProperties} [other] Another DuAEKeySpatialProperties to create a copy.
 * @property {float[]|null}	  [inTangent=null]     - The incoming spatial tangent
 * @property {float[]|null}    [outTangent=null]            -  The outgoing spatial tangent
 * @property {boolean}      [_continuous=true]         - true if the specified keyframe has spatial continuity
 * @property {boolean}	[_autoBezier=false]			- true if the specified keyframe has temporal auto-Bezier interpolation
 * @property {boolean}	[_roving=false]	- true if the specified keyframe is roving
 * @category DuAEF
 */
function DuAEKeySpatialProperties(other) {
  this.inTangent = null;
  this.outTangent = null;
  this._continuous = true;
  this._autoBezier = false;
  this._roving = false;
  if (isdef(other) && other instanceof DuAEKeySpatialProperties) {
    this.inTangent = other.inTangent;
    this.outTangent = other.outTangent;
    this._continuous = other._continuous;
    this._autoBezier = other._autoBezier;
    this._roving = other._roving;
  }
}

/**
 * Clones the DuAEKeySpatialProperties and returns the new one.
 * @return {DuAEKeySpatialProperties} The new DuAEKeySpatialProperties.
 */
DuAEKeySpatialProperties.prototype._clone = function () {
  return new DuAEKeySpatialProperties(this);
};

/**
 * Reverses all the influences (swaps in and out)
 */
DuAEKeySpatialProperties.prototype.reverse = function () {
  var inTangent = this.inTangent;
  this.inTangent = this.outTangent;
  this.outTangent = inTangent;
};

/**
	 Constructs a new DuAEKeyframe
	* @class DuAEKeyframe
	* @classdesc Properties of an After Effects Keyframe, as returned by {@linkcode DuAEProperty.keys} or {@linkcode DuAEProperty.keyAtIndex} or {@linkcode DuAEProperty.keyAtTime}.
	* @param {DuAEKeyframe} [other] Another keyframe to create a copy.
	* @property {float}	  _time     - The keyframe time
	* @property {null|folat[]|float|MarkerValue|int|Shape|TextDocument}    value  -  The keyframe value
	* @property {KeyframeInterpolationType}   _inInterpolationType  - The incoming temporal interpolation type
	* @property {KeyframeInterpolationType}	_outInterpolationType		- The outgoing temporal interpolation type
	* @property {boolean}	_spatial	- true if this keyframe has a spatial value
	* @property {DuAEKeySpatialProperties}	spatialProperties	- the spatial properties {@linkcode DuAEKeySpatialProperties} of this keyframe
	* @property {KeyframeEase[]}	inEase	- The incoming temporal ease. The number of objects in the Array depends on the value type
	* @property {KeyframeEase[]}	outEase	- The outgoing temporal ease. The number of objects in the Array depends on the value type
	* @property {boolean}	_continuous	- true if the keyframe has temporal continuity
	* @property {boolean}	_autoBezier	- true if the keyframe has temporal auto-Bezier interpolation
	* @property {int}		_index	- The index of the keyFrame. Warning: not updated when another key frame is added on the property some time before this key._time!
	* @category DuAEF
*/
function DuAEKeyframe(other) {
  this._time = 0;
  this.value = null;
  this._inInterpolationType = KeyframeInterpolationType.LINEAR;
  this._outInterpolationType = KeyframeInterpolationType.LINEAR;
  this._spatial = false;
  this.spatialProperties = new DuAEKeySpatialProperties();
  this.inEase = null;
  this.outEase = null;
  this._continuous = false;
  this._autoBezier = false;
  this._index = 0;
  this.label = 0;
  if (isdef(other) && other instanceof DuAEKeyframe) {
    this._time = other._time;
    this.value = other.value;
    this._inInterpolationType = other._inInterpolationType;
    this._outInterpolationType = other._outInterpolationType;
    this._spatial = other._spatial;
    this.spatialProperties = other.spatialProperties._clone();
    this.inEase = other.inEase;
    this.outEase = other.outEase;
    this._continuous = other._continuous;
    this._autoBezier = other._autoBezier;
    this._index = other._index;
    this.label = other.label;
  }
}

/**
 * Clones the keyframe and returns the new one. <br />
 * The keyframe is not added to any property, only the JS object is cloned. Use {@link DuAEProperty.setKey} to add it to a specific property.
 * @return {DuAEKeyframe} The new keyframe.
 */
DuAEKeyframe.prototype._clone = function () {
  return new DuAEKeyframe(this);
};

/**
 * Reverses all the influences (swaps in and out)
 */
DuAEKeyframe.prototype.reverse = function () {
  var inType = this._inInterpolationType;
  this._inInterpolationType = this._outInterpolationType;
  this._outInterpolationType = inType;

  var inEase = this.inEase;
  this.inEase = this.outEase;
  this.outEase = inEase;

  for (var i = 0; i < this.inEase.length; i++) {
    this.inEase[i].speed = -this.inEase[i].speed;
    this.outEase[i].speed = -this.outEase[i].speed;
  }

  this.spatialProperties.reverse();
};

/**
 * Checks if all speed eases are 0
 * @return {Boolean}
 */
DuAEKeyframe.prototype.stops = function () {
  if (key.inEase)
    for (var i = 0; i < this.inEase.length; i++) {
      if (Math.abs(this.inEase[i].speed) > 0) return false;
    }

  if (key.outEase)
    for (var i = 0; i < this.outEase.length; i++) {
      if (Math.abs(this.outEase[i].speed) > 0) return false;
    }

  return true;
};

/**
 * Constructs a new animation
 * @class DuAEPropertyAnimation
 * @classdesc Describes the animation of an After Effects property
 * @property {string}	  [_name=""]     - The property name
 * @property {string}    [_matchName=""]  - The property matchName
 * @property {DuAEKeyframe[]}   [keys=[]]  - The keyframes of the animation
 * @property {null|float[]|float|MarkerValue|int|Shape|TextDocument}	[startValue=null]		- The value at the beginning of the animation
 * @property {string}	[expression=""]		- The expression on the property, if any.
 * @property {string}   [type="anim"]  - Read Only.
 * @property {float}   startTime  - Read Only. The starting time of the animation.
 * @property {float}   endTime  - Read Only. The ending time of the animation.
 * @category DuAEF
 */
function DuAEPropertyAnimation() {
  this._name = "";
  this._matchName = "";
  this.keys = [];
  this.startValue = null;
  this.type = "anim";
  this.expression = "";
  this.dimensions = 0;
  this.startTime = null;
  this.endTime = null;
}

/**
 * Constructs a new group animation
 * @class DuAEPropertyGroupAnimation
 * @classdesc Contains all DuAEPropertyAnimation from an After Effects PropertyGroup
 * @property {string}	  [_name=""]     - The property name
 * @property {string}    [_matchName=""]  - The property matchName
 * @property {DuAEPropertyAnimation[]|DuAEPropertyGroupAnimation[]}   [anims=[]]  - The animations in the group
 * @property {string}   [type="group"]  - Read Only.
 * @property {float}   startTime  - Read Only. The starting time of the animation.
 * @property {float}   endTime  - Read Only. The ending time of the animation.
 * @category DuAEF
 */
function DuAEPropertyGroupAnimation() {
  this._name = "";
  this._matchName = "";
  this.anims = [];
  this.type = "group";
  this.startTime = null;
  this.endTime = null;
}

/**
 * Constructs a new layer animation
 * @class DuAELayerAnimation
 * @classdesc Contains all DuAEPropertyGroupAnimation from an After Effects Layer
 * @property {string}	  [_name=""]     - The property name
 * @property {int}    [_index=""]  - The index of the layer
 * @property {DuAEPropertyGroupAnimation[]} [anims=[]] - All the animations of the layer
 * @property {float} [firstKeyFrameTime=0] - The time of the first keyframe
 * @property {string}   [type="layer"]  - Read Only.
 * @property {float}   startTime  - Read Only. The starting time of the animation.
 * @property {float}   endTime  - Read Only. The ending time of the animation.
 * @category DuAEF
 */
function DuAELayerAnimation() {
  this._name = "";
  this._index = 0;
  this.anims = [];
  this.type = "layer";
  this.startTime = null;
  this.endTime = null;
}

/**
 * Constructs a new DuAEPropertyExpression
 * @class DuAEPropertyExpression
 * @classdesc This class describes an expression and the property containing it.<br />
 * It is used by the cache engine of DuAEF to work on expressions without applying them and improve performance.<br />
 * This class is very similar to {@link DuAEProperty} except it is lighter and faster, to improve the performance of the expression cache.
 * @param {PropertyBase|DuAEPropertyExpression|DuAEProperty} property - The property. If a DuAEPropertyExpression is provided, the constructor returns it (it does not make a copy).<br />
 * This makes it easy to avoid type checking, as you can always pass any property or DuAEPropertyExpression to the constructor to be sure to handle a DuAEPropertyExpression, without any impact on performance.
 * @category DuAEF
 */
function DuAEPropertyExpression(property) {
  var propInfo;
  if (property instanceof DuAEPropertyExpression) {
    property.expression = property.getProperty().expression;
    return property;
  } else if (property instanceof DuAEProperty) {
    propInfo = property;
    property = propInfo.getProperty();
  } else {
    propInfo = new DuAEProperty(property);
  }

  /**
   * The original property containing the expression
   * @memberof DuAEPropertyExpression.prototype
   * @name property
   * @type {PropertyBase}
   */
  this.property = property;
  /**
   * The original layer containing the expression
   * @memberof DuAEPropertyExpression.prototype
   * @name layer
   * @type {LayerItem}
   */
  this.layer = propInfo.layer;
  /**
   * The original composition containing the expression
   * @memberof DuAEPropertyExpression.prototype
   * @name comp
   * @type {CompItem}
   */
  this.comp = propInfo.comp;
  /**
   * true if there's no expression in this property
   * @memberof DuAEPropertyExpression.prototype
   * @name empty
   * @type {Boolean}
   */
  this.empty = false;

  if (!propInfo.riggable()) {
    this.empty = true;
    return;
  }
  if (property.expression == "") {
    this.empty = true;
    return;
  }

  /**
   * The Array containing the indices in all parent property groups containing this property.<br />
   * This is used to retrieve the property in case the object becomes invalid.
   * @memberof DuAEPropertyExpression.prototype
   * @name parentIndices
   * @type {int[]}
   */
  this.parentIndices = [property.propertyIndex];
  /**
   * true if the property belongs to an effect.
   * @memberof DuAEPropertyExpression.prototype
   * @name isEffect
   * @type {Boolean}
   */
  this.isEffect = property.isEffect;
  if (!this.isEffect) {
    var parentProp = property;
    while (parentProp.parentProperty) {
      // Traverse up the property tree
      parentProp = parentProp.parentProperty;
      this.isEffect = parentProp.isEffect;
      this.parentIndices.unshift(parentProp.propertyIndex);
      if (this.isEffect) break;
    }
  }

  /**
   * The expression in the property
   * @memberof DuAEPropertyExpression.prototype
   * @name expression
   * @type {string}
   */
  this.expression = property.expression;

  /**
   * true if the expression has been changed in the cache and needs to be re-applied to the property.
   * @memberof DuAEPropertyExpression.prototype
   * @name changed
   * @type {Boolean}
   */
  this.changed = false;

  /**
   * true if the expression has an error
   * @memberof DuAEPropertyExpression.prototype
   * @name inError
   * @type {Boolean}
   */
  this.inError = property.expressionError != "";
}

/**
 * Returns the original property, fixing it if the object has become invalid.
 * @return {PropertyBase} The property.
 */
DuAEPropertyExpression.prototype.getProperty = function () {
  if (this.isEffect) {
    var parentProp = this.layer("ADBE Effect Parade");
    for (var i = 0; i < this.parentIndices.length; i++) {
      parentProp = parentProp(this.parentIndices[i]);
    }
    this.property = parentProp;
  }
  return this.property;
};

/**
 * Applies the expression back to the actual properties in After Effects, if and only if it's been modified.
 * @param {boolean} [onlyIfNoError=false] If true, applies the expression only if it doesn't generate an error
 */
DuAEPropertyExpression.prototype.apply = function (onlyIfNoError) {
  if (this.layer.locked) return;
  if (!this.changed) return;

  onlyIfNoError = def(onlyIfNoError, false);

  var prop = this.getProperty();
  var prevExpression = prop.expression;
  prop.expression = this.expression;
  if (prop.expressionError != "" && onlyIfNoError)
    prop.expression = prevExpression;
};

/**
 * After Effects general tools
 * @namespace
 * @category DuAEF
 */
var DuAE = {};

/**
 * The axis or channels
 * @enum {int}
 * @readonly
 */
DuAE.Axis = {
  X: 1,
  Y: 2,
  Z: 3,
  RED: 4,
  GREEN: 5,
  BLUE: 6,
  ALPHA: 7,
  HUE: 8,
  SATURATION: 9,
  VALUE: 10,
};

/**
 * Types of values
 * @enum {int}
 * @readonly
 */
DuAE.Type = {
  VALUE: 1,
  SPEED: 2,
  VELOCITY: 3,
};

/**
 * Abbreviated units used in the UI.<br />
 * These strings are localized based on internal After Effects dictionnaries.
 * @enum {string}
 * @readonly
 */
DuAE.Unit = {
  PIXELS: localize("$$$/AE/TLW/GraphEditor/PixelsDest=px"),
  DEGREES: localize("$$$/AE/TLW/GraphEditor/DegreesDest=\u00B0"),
  PERCENT: localize("$$$/AE/TLW/GraphEditor/PercentDest=%"),
};

/**
 * Units used in the UI<br />
 * These strings are localized based on internal After Effects dictionnaries.
 * @enum {string}
 * @readonly
 */
DuAE.UnitText = {
  PERCENT: localize("$$$/AE/TLW/GraphEditor/PixelsSource=percent"),
  DEGREES: localize("$$$/AE/TLW/GraphEditor/DegreesSource=degrees"),
  PIXELS: localize("$$$/AE/TLW/GraphEditor/PercentSource=pixels"),
};

/**
 * Associative array that converts property match names to their compact English expression statements.
 * @example
 * DuAE.CompactExpression["ADBE Transform Group"]
 * //returns "'transform'"
 * @type {Object}
 */
DuAE.CompactExpression = {
  "ADBE Transform Group": "'transform'",
  // Handle camera/light vs. AV layers
  "ADBE Anchor Point":
    "((prop.propertyGroup(prop.propertyDepth).property('intensity')!=null) || (prop.propertyGroup(prop.propertyDepth).property('zoom')!=null)) ? '.pointOfInterest' : '.anchorPoint'",
  "ADBE Position": "'.position'",
  "ADBE Scale": "'.scale'",
  "ADBE Orientation": "'.orientation'",
  "ADBE Rotate X": "'.xRotation'",
  "ADBE Rotate Y": "'.yRotation'",
  // Handle 3D vs. 2D layers
  "ADBE Rotate Z":
    "(prop.propertyGroup(prop.propertyDepth).threeDLayer || (prop.propertyGroup(prop.propertyDepth).property('intensity')!=null) || (prop.propertyGroup(prop.propertyDepth).property('zoom')!=null)) ? '.zRotation' : '.rotation'",
  "ADBE Opacity": "'.opacity'",
  "ADBE Material Options Group": "'materialOption'",
  "ADBE Casts Shadows": "'.castsShadows'",
  "ADBE Light Transmission": "'.lightTransmission'",
  "ADBE Accepts Shadows": "'.acceptsShadows'",
  "ADBE Accepts Lights": "'.acceptsLights'",
  "ADBE Ambient Coefficient": "'.ambient'",
  "ADBE Diffuse Coefficient": "'.diffuse'",
  "ADBE Specular Coefficient": "'.specular'",
  "ADBE Shininess Coefficient": "'.shininess'",
  "ADBE Metal Coefficient": "'.metal'",
  "ADBE Light Options Group": "'lightOption'",
  "ADBE Light Intensity": "'.intensity'",
  "ADBE Light Color": "'.color'",
  "ADBE Light Cone Angle": "'.coneAngle'",
  "ADBE Light Cone Feather 2": "'.coneFeather'",
  "ADBE Light Shadow Darkness": "'.shadowDarkness'",
  "ADBE Light Shadow Diffusion": "'.shadowDiffusion'",
  "ADBE Camera Options Group": "'cameraOption'",
  "ADBE Camera Zoom": "'.zoom'",
  "ADBE Camera Depth of Field": "'.depthOfField'",
  "ADBE Camera Focus Distance": "'.focusDistance'",
  "ADBE Camera Aperture": "'.aperture'",
  "ADBE Camera Blur Level": "'.blurLevel'",
  "ADBE Text Properties": "'text'",
  "ADBE Text Document": "'.sourceText'",
  "ADBE Text Path Options": "'.pathOption'",
  "ADBE Text Path": "'.path'",
  "ADBE Text Reverse Path": "'.reversePath'",
  "ADBE Text Perpendicular To Path": "'.perpendicularToPath'",
  "ADBE Text Force Align Path": "'.forceAlignment'",
  "ADBE Text First Margin": "'.firstMargin'",
  "ADBE Text Last Margin": "'.lastMargin'",
  "ADBE Text More Options": "'.moreOption'",
  "ADBE Text Anchor Point Option": "'.anchorPointGrouping'",
  "ADBE Text Anchor Point Align": "'.groupingAlignment'",
  "ADBE Text Render Order": "'.fillANdStroke'",
  "ADBE Text Character Blend Mode": "'.interCharacterBlending'",
  "ADBE Text Animators": "'.animator'",
  "ADBE Text Selectors": "'.selector'",
  "ADBE Text Percent Start": "'.start'",
  "ADBE Text Percent End": "'.end'",
  "ADBE Text Percent Offset": "'.offset'",
  "ADBE Text Index Start": "'.start'",
  "ADBE Text Index End": "'.end'",
  "ADBE Text Index Offset": "'.offset'",
  "ADBE Text Range Advanced": "'.advanced'",
  "ADBE Text Range Units": "'.units'",
  "ADBE Text Range Type2": "'.basedOn'",
  "ADBE Text Selector Mode": "'.mode'",
  "ADBE Text Selector Max Amount": "'.amount'",
  "ADBE Text Range Shape": "'.shape'",
  "ADBE Text Selector Smoothness": "'.smoothness'",
  "ADBE Text Levels Max Ease": "'.easeHigh'",
  "ADBE Text Levels Min Ease": "'.easeLow'",
  "ADBE Text Randomize Order": "'.randomizeOrder'",
  "ADBE Text Random Seed": "'.randomSeed'",
  "ADBE Text Selector Mode": "'.mode'",
  "ADBE Text Wiggly Max Amount": "'.maxAmount'",
  "ADBE Text Wiggly Min Amount": "'.minAmount'",
  "ADBE Text Range Type2": "'.basedOn'",
  "ADBE Text Temporal Freq": "'.wigglesSecond'",
  "ADBE Text Character Correlation": "'.correlation'",
  "ADBE Text Temporal Phase": "'.temporalPhase'",
  "ADBE Text Spatial Phase": "'.spatialPhase'",
  "ADBE Text Wiggly Lock Dim": "'.lockDimensions'",
  "ADBE Text Wiggly Random Seed": "'.randomSeed'",
  "ADBE Text Range Type2": "'.basedOn'",
  "ADBE Text Expressible Amount": "'.amount'",
  "ADBE Text Animator Properties": "'.property'",
  "ADBE Text Anchor Point 3D": "'.anchorPoint'",
  "ADBE Text Position 3D": "'.position'",
  "ADBE Text Scale 3D": "'.scale'",
  "ADBE Text Skew": "'.skew'",
  "ADBE Text Skew Axis": "'.skewAxis'",
  "ADBE Text Rotation X": "'.xRotation'",
  "ADBE Text Rotation Y": "'.yRotation'",
  "ADBE Text Rotation": "'.zRotation'",
  "ADBE Text Opacity": "'.opacity'",
  "ADBE Text Fill Opacity": "'.fillOpacity'",
  "ADBE Text Fill Color": "'.fillColor'",
  "ADBE Text Fill Hue": "'.fillHue'",
  "ADBE Text Fill Saturation": "'.fillSaturation'",
  "ADBE Text Fill Brightness": "'.fillBrightness'",
  "ADBE Text Stroke Opacity": "'.strokeOpacity'",
  "ADBE Text Stroke Color": "'.strokeColor'",
  "ADBE Text Stroke Hue": "'.strokeHue'",
  "ADBE Text Stroke Saturation": "'.strokeSaturation'",
  "ADBE Text Stroke Brightness": "'.strokeBrightness'",
  "ADBE Text Stroke Width": "'.strokeWidth'",
  "ADBE Text Line Anchor": "'.lineAnchor'",
  "ADBE Text Line Spacing": "'.lineSpacing'",
  "ADBE Text Track Type": "'.trackingType'",
  "ADBE Text Tracking Amount": "'.trackingAmount'",
  "ADBE Text Character Change Type": "'.characterAlignment'",
  "ADBE Text Character Range": "'.characterRange'",
  "ADBE Text Character Replace": "'.characterValue'",
  "ADBE Text Character Offset": "'.characterOffset'",
  "ADBE Text Blur": "'.blur'",
  "ADBE Mask Parade": "'mask'",
  "ADBE Mask Shape": "'.maskPath'",
  "ADBE Mask Feather": "'.maskFeather'",
  "ADBE Mask Opacity": "'.maskOpacity'",
  "ADBE Mask Offset": "'.maskExpansion'",
  "ADBE Effect Parade": "'effect'",
  "ADBE Paint Group": "'.stroke'",
  "ADBE Paint Shape": "'.path'",
  "ADBE Paint Properties": "'.strokeOption'",
  "ADBE Paint Begin": "'.start'",
  "ADBE Paint End": "'.end'",
  "ADBE Paint Color": "'.color'",
  "ADBE Paint Diameter": "'.diameter'",
  "ADBE Paint Angle": "'.angle'",
  "ADBE Paint Hardness": "'.hardness'",
  "ADBE Paint Roundness": "'.roundness'",
  "ADBE Paint Tip Spacing": "'.spacing'",
  "ADBE Paint Target Channels": "'.channels'",
  "ADBE Paint Opacity": "'.opacity'",
  "ADBE Paint Flow": "'.flow'",
  "ADBE Paint Clone Layer": "'.cloneSource'",
  "ADBE Paint Clone Position": "'.clonePosition'",
  "ADBE Paint Clone Time": "'.cloneTime'",
  "ADBE Paint Clone Time Shift": "'.cloneTimeShift'",
  "ADBE Paint Transform": "'.transform'",
  "ADBE Paint Anchor Point": "'.anchorPoint'",
  "ADBE Paint Position": "'.position'",
  "ADBE Paint Scale": "'.scale'",
  "ADBE Paint Rotation": "'.rotation'",
  "ADBE MTrackers": "'motionTracker'",
  "ADBE MTracker Pt Feature Center": "'.featureCenter'",
  "ADBE MTracker Pt Feature Size": "'.featureSize'",
  "ADBE MTracker Pt Search Ofst": "'.searchOffset'",
  "ADBE MTracker Pt Search Size": "'.searchSize'",
  "ADBE MTracker Pt Confidence": "'.confidence'",
  "ADBE MTracker Pt Attach Pt": "'.attachPoint'",
  "ADBE MTracker Pt Attach Pt Ofst": "'.attachPointOffset'",
  "ADBE Audio Group": "'audio'",
  "ADBE Audio Levels": "'.audioLevels'",
  "ADBE Time Remapping": "'timeRemap'",
  "ADBE Layer Styles": "'layerStyle'",
  "ADBE Blend Options Group": "'.blendingOption'",
  "ADBE Global Angle2": "'.globalLightAngle'",
  "ADBE Global Altitude2": "'.globalLightAltitude'",
  "ADBE Adv Blend Group": "'.advancedBlending'",
  "ADBE Layer Fill Opacity2": "'.fillOpacity'",
  "ADBE R Channel Blend": "'.red'",
  "ADBE G Channel Blend": "'.green'",
  "ADBE B Channel Blend": "'.blue'",
  "ADBE Blend Interior": "'.blendInteriorStylesAsGroup'",
  "ADBE Blend Ranges": "'.useBlendRangesFromSource'",
  "dropShadow/enabled": "'.dropShadow'",
  "dropShadow/mode2": "'.blendMode'",
  "dropShadow/color": "'.color'",
  "dropShadow/opacity": "'.opacity'",
  "dropShadow/useGlobalAngle": "'.useGlobalLight'",
  "dropShadow/localLightingAngle": "'.angle'",
  "dropShadow/distance": "'.distance'",
  "dropShadow/chokeMatte": "'.spread'",
  "dropShadow/blur": "'.size'",
  "dropShadow/noise": "'.noise'",
  "dropShadow/layerConceals": "'.layerKnocksOutDropShadow'",
  "innerShadow/enabled": "'.innerShadow'",
  "innerShadow/mode2": "'.blendMode'",
  "innerShadow/color": "'.color'",
  "innerShadow/opacity": "'.opacity'",
  "innerShadow/useGlobalAngle": "'.useGlobalLight'",
  "innerShadow/localLightingAngle": "'.angle'",
  "innerShadow/distance": "'.distance'",
  "innerShadow/chokeMatte": "'.choke'",
  "innerShadow/blur": "'.size'",
  "innerShadow/noise": "'.noise'",
  "outerGlow/enabled": "'.outerGlow'",
  "outerGlow/mode2": "'.blendMode'",
  "outerGlow/opacity": "'.opacity'",
  "outerGlow/noise": "'.noise'",
  "outerGlow/AEColorChoice": "'.colorType'",
  "outerGlow/color": "'.color'",
  "outerGlow/gradientSmoothness": "'.gradientSmoothness'",
  "outerGlow/glowTechnique": "'.technique'",
  "outerGlow/chokeMatte": "'.spread'",
  "outerGlow/blur": "'.size'",
  "outerGlow/inputRange": "'.range'",
  "outerGlow/shadingNoise": "'.jitter'",
  "innerGlow/enabled": "'.innerGlow'",
  "innerGlow/mode2": "'.blendMode'",
  "innerGlow/opacity": "'.opacity'",
  "innerGlow/noise": "'.noise'",
  "innerGlow/AEColorChoice": "'.colorType'",
  "innerGlow/color": "'.color'",
  "innerGlow/gradientSmoothness": "'.gradientSmoothness'",
  "innerGlow/glowTechnique": "'.technique'",
  "innerGlow/innerGlowSource": "'.source'",
  "innerGlow/chokeMatte": "'.choke'",
  "innerGlow/blur": "'.size'",
  "innerGlow/inputRange": "'.range'",
  "innerGlow/shadingNoise": "'.jitter'",
  "bevelEmboss/enabled": "'.bevelAndEmboss'",
  "bevelEmboss/bevelStyle": "'.style'",
  "bevelEmboss/bevelTechnique": "'.technique'",
  "bevelEmboss/strengthRatio": "'.depth'",
  "bevelEmboss/bevelDirection": "'.direction'",
  "bevelEmboss/blur": "'.size'",
  "bevelEmboss/softness": "'.soften'",
  "bevelEmboss/useGlobalAngle": "'.useGlobalLight'",
  "bevelEmboss/localLightingAngle": "'.angle'",
  "bevelEmboss/localLightingAltitude": "'.altitude'",
  "bevelEmboss/highlightMode": "'.highlightMode'",
  "bevelEmboss/highlightColor": "'.highlightColor'",
  "bevelEmboss/highlightOpacity": "'.highlightOpacity'",
  "bevelEmboss/shadowMode": "'.shadowMode'",
  "bevelEmboss/shadowColor": "'.shadowColor'",
  "bevelEmboss/shadowOpacity": "'.shadowOpacity'",
  "chromeFX/enabled": "'.satin'",
  "chromeFX/mode2": "'.blendMode'",
  "chromeFX/color": "'.color'",
  "chromeFX/opacity": "'.opacity'",
  "chromeFX/localLightingAngle": "'.angle'",
  "chromeFX/distance": "'.distance'",
  "chromeFX/blur": "'.size'",
  "chromeFX/invert": "'.invert'",
  "solidFill/enabled": "'.colorOverlay'",
  "solidFill/mode2": "'.blendMode'",
  "solidFill/color": "'.color'",
  "solidFill/opacity": "'.opacity'",
  "gradientFill/enabled": "'.gradientOverlay'",
  "gradientFill/mode2": "'.blendMode'",
  "gradientFill/opacity": "'.opacity'",
  "gradientFill/gradientSmoothness": "'.gradientSmoothness'",
  "gradientFill/angle": "'.angle'",
  "gradientFill/type": "'.style'",
  "gradientFill/reverse": "'.reverse'",
  "gradientFill/align": "'.alignWithLayer'",
  "gradientFill/scale": "'.scale'",
  "gradientFill/offset": "'.offset'",
  "patternFill/enabled": "'.patternOverlay'",
  "patternFill/mode2": "'.blendMode'",
  "patternFill/opacity": "'.opacity'",
  "patternFill/align": "'.linkWithLayer'",
  "patternFill/scale": "'.scale'",
  "patternFill/phase": "'.offset'",
  "frameFX/enabled": "'.stroke'",
  "frameFX/mode2": "'.blendMode'",
  "frameFX/color": "'.color'",
  "frameFX/size": "'.size'",
  "frameFX/opacity": "'.opacity'",
  "frameFX/style": "'.position'",
  "ADBE Layer Overrides": "'masterProperty'",
};

/**
 * Menu Command Ids<br />
 * These are the ids which can be found using <code>app.findMenuCommandID("insertMenuNameHere");</code><br />
 * Use <code>app.executeCommand(id)</code> to run them.
 * @enum {int}
 * @readonly
 * @example
 * app.executeCommand(DuAE.MenuCommandID.COPY); //copies the selection
 * app.executeCommand(DuAE.MenuCommandID.PASTE); //pastes the selection
 */
DuAE.MenuCommandID = {
  //EDIT menu
  CUT: 18,
  COPY: 19,
  COPY_WITH_PROPERTY_LINKS: 10310,
  PASTE: 20,
  DUPLICATE: 2080,
  UNDO: 16,
  GENERAL_PREFERENCES: 2359,
  SCRIPTING_PREFERENCES: 3131,
  LAYER_CONTROLS: 2435,
  REVEAL_EXPRESSION_ERRORS: 2731,
  CONVERT_AUDIO_TO_KEYFRAMES: 4218,
};

/**
 * How to place new layers
 * @enum {int}
 * @readonly
 */
DuAE.LayerPlacement = {
  BOTTOM: 0,
  UNDER_LAYER: 1,
  ABOVE_LAYER: 2,
  TOP: 3,
};

/**
 * Types of layers used by Ae
 * @enum {string}
 * @readonly
 */
DuAE.LayerType = {
  NULL: "null",
  SOLID: "solid",
  SHAPE: "shape",
  TEXT: "text",
  ADJUSTMENT: "adjustment",
  LIGHT: "light",
  CAMERA: "camera",
};

/**
 * Attributes of layers in Ae
 * @enum {string}
 * @readonly
 */
DuAE.LayerAttribute = {
  SELECTED: "selected",
  VISIBLE: "visible",
  AUDIO: "audio",
  SOLO: "solo",
  LOCKED: "locked",
  SHY: "shy",
  EFFECTS_ENABLED: "effects",
  MOTION_BLUR: "motionblur",
  THREE_D: "3d",
  GUIDE: "guide",
};

/**
 * Loop types
 * @enum {string}
 * @readonly
 */
DuAE.LoopType = {
  HOLD: "hold",
  NONE: "none",
  CYCLE: "cycle",
  PINGPONG: "pingpong",
  OFFSET: "offset",
  CONTINUE: "continue",
};

/**
 * How to align in time
 * @enum {string}
 * @readonly
 */
DuAE.TimeAlignment = {
  CENTER: "center",
  IN_POINT: "in",
  OUT_POINT: "out",
};

/**
 * The type of AE preferences
 * @enum {int}
 * @readonly
 */
DuAE.PrefType = {
  BOOL: 0,
  STRING: 1,
  FLOAT: 2,
  LONG: 3,
};

/**
 * List of file extensions whih may be imported as several items with the same source
 * @type {DuList}
 */
DuAE.DuAELayeredFileType = new DuList(["psd", "psb", "ai", "fla"]);

/**
 * Enum for selections
 * @readonly
 * @static
 * @enum {int}
 */
DuAE.SelectionMode = {
  SELECTED_PROPERTIES: 0,
  SELECTED_LAYERS: 1,
  ACTIVE_COMPOSITION: 2,
  SELECTED_COMPOSITIONS: 3,
  ALL_COMPOSITIONS: 4,
};

/**
 * Default color labels
 * @readonly
 * @type {int[][]}
 * @todo get real labels (from pref file?)
 */
DuAE.ColorLabels = [];
DuAE.ColorLabels[0] = [0, 0, 0]; // 0. None
DuAE.ColorLabels[1] = [121 / 255, 058 / 255, 058 / 255]; // 1. Red
DuAE.ColorLabels[2] = [144 / 255, 138 / 255, 068 / 255]; // 2. Yellow
DuAE.ColorLabels[3] = [115 / 255, 132 / 255, 130 / 255]; // 3. Aqua
DuAE.ColorLabels[4] = [145 / 255, 124 / 255, 131 / 255]; // 4. Pink
DuAE.ColorLabels[5] = [115 / 255, 115 / 255, 131 / 255]; // 5. Lavender
DuAE.ColorLabels[6] = [146 / 255, 127 / 255, 109 / 255]; // 6. Peach
DuAE.ColorLabels[7] = [120 / 255, 130 / 255, 120 / 255]; // 7. Sea Foam
DuAE.ColorLabels[8] = [082 / 255, 093 / 255, 142 / 255]; // 8. Blue
DuAE.ColorLabels[9] = [067 / 255, 112 / 255, 068 / 255]; // 9. Green
DuAE.ColorLabels[10] = [101 / 255, 052 / 255, 107 / 255]; // 10. Purple
DuAE.ColorLabels[11] = [146 / 255, 103 / 255, 037 / 255]; // 11. Orange
DuAE.ColorLabels[12] = [094 / 255, 065 / 255, 051 / 255]; // 12. Brown
DuAE.ColorLabels[13] = [152 / 255, 085 / 255, 137 / 255]; // 13. Fuchsia
DuAE.ColorLabels[14] = [061 / 255, 111 / 255, 113 / 255]; // 14. Cyan
DuAE.ColorLabels[15] = [114 / 255, 105 / 255, 090 / 255]; // 15. Sandstone
DuAE.ColorLabels[16] = [045 / 255, 062 / 255, 045 / 255]; // 16. DarkGreen

/**
 * Gets the compact expression synonym of a matchName
 * @param {string} matchName The matchName of a property
 * @param {string} [name] A replacement name (or index) in case the compact expression does not exist. If omitted, the matchName will be used.
 * @param {Proeprty} [prop] The original property; may be needed to differenciate between 3D layers / cam / lights, etc
 */
DuAE.getCompactExpression = function (matchName, name, prop) {
  name = def(name, "");
  var translatedName = DuAE.CompactExpression[matchName];

  if (isdef(translatedName)) return eval(translatedName);
  else if (name != "") return "(" + name + ")";
  else return "(" + matchName + ")";
};

/**
 * Checks if After Effects has the given preference
 * @param {string} section The section of the preferences
 * @param {string} key The key
 * @param {PREFType} [file=PREFType.PREF_Type_MACHINE_SPECIFIC] The preference file, from the <code>PREFType</code> enum value of the After Effects API
 * @returns {Boolean} true if the pref exists
 */
DuAE.hasPref = function (section, key, file) {
  app.preferences.saveToDisk();
  app.preferences.reload();
  file = def(file, PREFType.PREF_Type_MACHINE_SPECIFIC);
  return app.preferences.havePref(section, key, file);
};

/**
 * Gets a pref
 * @param {string} section The section of the preferences
 * @param {string} key The key
 * @param {PREFType} [file=PREFType.PREF_Type_MACHINE_SPECIFIC] The preference file, from the <code>PREFType</code> enum value of the After Effects API
 * @param {DuAE.PrefType} [type=DuAE.PrefType.STRING] The type of the preference to return
 * @returns {any|null} The pref or null if it does not exists
 */
DuAE.getPref = function (section, key, file, type) {
  try {
    // Won't work without file access
    app.preferences.saveToDisk();
    app.preferences.reload();
  } catch (e) {}

  file = def(file, PREFType.PREF_Type_MACHINE_SPECIFIC);

  if (!DuAE.hasPref(section, key, file)) return null;
  type = def(type, DuAE.PrefType.STRING);
  if (type == DuAE.PrefType.STRING)
    return app.preferences.getPrefAsString(section, key, file);
  if (type == DuAE.PrefType.LONG)
    return app.preferences.getPrefAsLong(section, key, file);
  if (type == DuAE.PrefType.FLOAT)
    return app.preferences.getPrefAsFloat(section, key, file);
  if (type == DuAE.PrefType.BOOL)
    return app.preferences.getPrefAsBool(section, key, file);
};

/**
 * Gets the DuAEProperty for the properties
 * @param {PropertyBase[]} props - The Properties
 * @return {DuAEProperty[]} The info
 */
DuAE.getDuAEProperty = function (props) {
  //convert to propinfo
  var propInfos = [];
  for (var i = 0; i < props.length; i++) {
    var propInfo;
    if (props[i] instanceof DuAEProperty) propInfo = props[i];
    else propInfo = new DuAEProperty(props[i]);
    propInfos.push(propInfo);
  }
  return propInfos;
};

/**
 * Checks if the file is a layered type (psd, ai, psb, fla...)
 * @param {String|File}	 [file]	- The file or the path
 * @return {boolean} true if it's a layered file
 */
DuAE.isLayeredFile = function (file) {
  var ext = DuPath.getExtension(file);
  return DuAE.DuAELayeredFileType.contains(ext.toLowerCase());
};

/**
 * Informations about the version of after effects.
 * @type {DuVersion}
 * @readonly
 */
DuAE.version = new DuVersion(app.version);

/**
 * Checks if the javascript debugger is enabled
 * @return {Boolean} true if the debugger is enabled.
 */
DuAE.isDebuggerEnabled = function () {
  return (
    DuAE.getPref(
      "Main Pref Section v2",
      "Pref_JAVASCRIPT_DEBUGGER",
      PREFType.PREF_Type_MACHINE_INDEPENDENT,
      DuAE.PrefType.LONG,
    ) == 1
  );
};

/**
 * Gets the public name of a version of After Effects (like CC2015.3 for version 13.8)
 * @param {float}	[versionAsFloat]	- The version as a float. If not provided, will default to the current version of the running instance of After Effects.
 * @return {string}	The version name.
 */
DuAE.getAEVersionName = function (versionAsFloat) {
  if (versionAsFloat == undefined) versionAsFloat = DuAE.version.version;
  if (versionAsFloat < 8) return "" + versionAsFloat;
  if (versionAsFloat >= 8 && versionAsFloat < 9) return "CS3";
  if (versionAsFloat >= 9 && versionAsFloat < 10) return "CS4";
  if (versionAsFloat >= 10 && versionAsFloat < 10.5) return "CS5";
  if (versionAsFloat >= 10.5 && versionAsFloat < 11) return "CS5.5";
  if (versionAsFloat >= 11 && versionAsFloat < 12) return "CS6";
  if (versionAsFloat >= 12 && versionAsFloat < 13) return "CC";
  if (versionAsFloat >= 13 && versionAsFloat < 13.1) return "CC2014";
  if (versionAsFloat >= 13.1 && versionAsFloat < 13.2) return "CC2014.1";
  if (versionAsFloat >= 13.2 && versionAsFloat < 13.5) return "CC2014.2";
  if (versionAsFloat >= 13.5 && versionAsFloat < 13.6) return "CC2015";
  if (versionAsFloat >= 13.6 && versionAsFloat < 13.7) return "CC2015.1";
  if (versionAsFloat >= 13.7 && versionAsFloat < 13.8) return "CC2015.2";
  if (versionAsFloat >= 13.8 && versionAsFloat < 14) return "CC2015.3";
  if (versionAsFloat >= 14 && versionAsFloat < 15) return "CC2017";
  if (versionAsFloat >= 15 && versionAsFloat < 16) return "CC2018";
  if (versionAsFloat >= 16 && versionAsFloat < 17) return "CC2019";
  if (versionAsFloat >= 17 && versionAsFloat < 18) return "2020";
  if (versionAsFloat >= 18 && versionAsFloat < 22) return "2021";
  if (versionAsFloat >= 22) return "20" + Math.floor(versionAsFloat);
  return "Unknown";
};

/**
 * Gets the version of After Effects from its public name (like 13.8 for CC2015.3)
 * @param {float}	[versionAsFloat]	- The version name.
 * @return {DuVersion}	The version.
 */
DuAE.getAEVersion = function (versionName) {
  if (versionName == "CS3") return new DuVersion("8.0");
  if (versionName == "CS4") return new DuVersion("9.0");
  if (versionName == "CS5") return new DuVersion("10.0");
  if (versionName == "CS5.5") return new DuVersion("10.5");
  if (versionName == "CS6") return new DuVersion("11.0");
  if (versionName == "CC") return new DuVersion("12.0");
  if (versionName == "CC2014") return new DuVersion("13.0");
  if (versionName == "CC2014.1") return new DuVersion("13.1");
  if (versionName == "CC2014.2") return new DuVersion("13.2");
  if (versionName == "CC2015") return new DuVersion("13.5");
  if (versionName == "CC2015.1") return new DuVersion("13.6");
  if (versionName == "CC2015.2") return new DuVersion("13.7");
  if (versionName == "CC2015.3") return new DuVersion("13.8");
  if (versionName == "CC2017") return new DuVersion("14.0");
  if (versionName == "CC2018") return new DuVersion("15.0");
  if (versionName == "CC2019") return new DuVersion("16.0");
  if (versionName == "2020") return new DuVersion("17.0");
  if (versionName == "2021") return new DuVersion("18.0");
  if (versionName == "2022") return new DuVersion("22.0");
  return new DuVersion(versionName);
};

/**
 * Checks if the current version is higher than a given one
 * @param {string} versionName The minimum version
 * @return {boolean} True if the current version is higher (strict, will be false if they're equal)
 */
DuAE.isVersionHigherThan = function (versionName) {
  return DuAE.version.higherThan(DuAE.getAEVersion(versionName));
};

/**
 * Checks if the current version is at least a given one
 * @param {string} versionName The minimum version
 * @return {boolean} True if the current version is higher or the same
 */
DuAE.isVersionAtLeast = function (versionName) {
  return DuAE.version.atLeast(DuAE.getAEVersion(versionName));
};

/**
 * Gets the aerender binary
 * @return {File|null} The aerender binary, or null if not found
 */
DuAE.getAeRender = function () {
  var packageFolder = Folder.appPackage;
  var aeRenderPath = packageFolder.absoluteURI + "/aerender";
  if (DuSystem.win) aeRenderPath += ".exe";
  var aeRenderFile = new File(aeRenderPath);
  if (aeRenderFile.exists) return aeRenderFile;
  else return null;
};

//low-level undocumented flag.
//true if an undo group has been opened and has not been closed yet.
DuAE.openedUndoGroup = false;

//low-level undocumented flag.
//the name of the currently opened undo group
DuAE.undoGroupName = "";

/**
 * Begins an undoGroup.<br />
 * Automatically prepend the group name with the script name.<br />
 * Using this method is safer than the native one, as DuAEF will try to avoid opening several undo groups at once.<br />
 * The group name is translatable.
 * @param {string} groupName - The name of the Undo Group.
 * @param {boolean} [autoClose=true] - By default, DuAEF will close any previously opened undogroup (which has a different name) to prevent any error.<br />
 * Set this to <code>false</code> in order to ignore this new group beginning and keep the previously opened one.
 */
DuAE.beginUndoGroup = function (groupName, autoClose) {
  groupName = def(groupName, "");
  autoClose = def(autoClose, true);

  if (DuAE.openedUndoGroup) {
    if (autoClose && DuAE.undoGroupName != groupName) DuAE.endUndoGroup();
    else return;
  }
  app.beginUndoGroup(DuESF.scriptName + " | " + groupName);

  DuAE.undoGroupName = groupName;

  DuAE.openedUndoGroup = true;
};

/**
 * Ends an undoGroup.<br />
 * Using this method is safer than the native one, as DuAEF will try to avoid opening several undo groups at once.
 * @param {string} [groupName] - The name of the Undo Group to end. Use this if you used  {@link DuAE.beginUndoGroup} with the 'autoClose' argument set to false before.
 */
DuAE.endUndoGroup = function (groupName) {
  groupName = def(groupName, "");
  if (groupName != "" && DuAE.undoGroupName != groupName) return;
  app.endUndoGroup();
  DuAE.openedUndoGroup = false;
};

/**
 * Runs app.executeCommand in a safer way, taking care of undogroups.
 * @param {int|string} commandID - The ID of the command as given by app.findMenuCommandID(), or if it is a string, the name of the command.
 */
DuAE.executeCommand = function (commandID, ignoreUndoGroups) {
  ignoreUndoGroups = def(ignoreUndoGroups, false);
  if (commandID === "") return;
  if (jstype(commandID) == "string")
    commandID = app.findMenuCommandId(commandID);
  //the command will mess undo groups up if there already is one opened.
  openedUndoGroup = DuAE.openedUndoGroup;
  if (!ignoreUndoGroups) DuAE.endUndoGroup();
  app.executeCommand(commandID);
  if (openedUndoGroup && !ignoreUndoGroups)
    DuAE.beginUndoGroup(DuAE.undoGroupName);
};

/**
 * Opens a ScriptUI Panel if it is installed, or displays an alert otherwise.
 * @param {string} panelScriptName - The Script name of the panel "script.jsx"
 */
DuAE.openScriptUIPanel = function (panelScriptName) {
  if (panelScriptName == "") return;
  var scriptFolders = DuAE.scriptFolders("ScriptUI Panels");

  for (var i = 0; i < scriptFolders.length; i++) {
    var scriptUIFile = new File(
      scriptFolders[i].absoluteURI + "/" + panelScriptName,
    );
    if (scriptUIFile.exists) {
      DuAE.executeCommand(panelScriptName);
      return;
    }
  }

  alert(i18n._("The '%1' panel is not installed.", panelScriptName)); /// TRANSLATORS: %1 will be the name of the panel
};

/**
 * Cuts the selection (runs the cut menu command)
 */
DuAE.cut = function () {
  DuAE.executeCommand(DuAE.MenuCommandID.CUT);
};

/**
 * Copies the selection (runs the copy menu command)
 */
DuAE.copy = function () {
  DuAE.executeCommand(DuAE.MenuCommandID.COPY);
};

/**
 * Duplcates the selection (runs the duplicate menu command)
 */
DuAE.duplicate = function () {
  DuAE.executeCommand(DuAE.MenuCommandID.DUPLICATE);
};

/**
 * Copies the selection with property links (runs the copy menu command)<br />
 * Only on versions of After Effects greater than 11.0 (CS6)<br />
 * On CS6 and below, a standard copy will be done.
 */
DuAE.copyWithPropertyLinks = function () {
  if (DuAE.version >= 12.0)
    DuAE.executeCommand(DuAE.MenuCommandID.COPY_WITH_PROPERTY_LINKS);
  else DuAE.copy();
};

/**
 * Pastes the selection (runs the paste menu command)
 */
DuAE.paste = function () {
  DuAE.executeCommand(DuAE.MenuCommandID.PASTE);
};

/**
 * Undoes (runs the undo command)
 */
DuAE.undo = function () {
  DuAE.executeCommand(DuAE.MenuCommandID.UNDO);
};

/**
 * Checks if the Folder is an Auto-Save folder
 * @param {Folder|string} folder The folder or path to check
 * @return {boolean} true if the folder is an auto-save folder
 */
DuAE.isAutoSaveFolder = function (folder) {
  if (jstype(folder) == "string") folder = new Folder(folder);
  if (!(folder instanceof Folder)) {
    DuDebug.throwTypeError(
      folder,
      "folder",
      "Folder/string",
      "DuAE.isAutoSaveFolder( folder )",
    );
    return false;
  }

  var folderName = folder.fsName.toLowerCase();
  if (DuSystem.win) folderName = folderName.split("\\").pop();
  else folderName = folderName.split("/").pop();

  var aaeString = "adobe after effects";
  var autosaveString = localize(
    "$$$/AE/MenuID/0307/AutoSave=Auto-Save",
  ).toLowerCase();

  return (
    folderName.indexOf(aaeString) >= 0 &&
    folderName.indexOf(autosaveString) >= 0
  );
};

/**
 * Shows/hides the layer controls
 */
DuAE.toggleLayerControls = function () {
  app.executeCommand(DuAE.MenuCommandID.LAYER_CONTROLS);
};

/**
 * Gets the list of folders where scripts may be installed
 * @param {string} [suboflder] The name of a subfolder, like "ScriptUI Panels" or "Startup" or "Shutdown"...
 * @return {Folder[]} the list of Folder objects.
 */
DuAE.scriptFolders = function (subfolder) {
  subfolder = def(subfolder, "");

  var folders = [];

  // Get in Support files
  var supportFilesPath;
  if (DuSystem.mac) supportFilesPath = Folder.appPackage.parent.absoluteURI;
  else supportFilesPath = Folder.appPackage.absoluteURI;
  var supportFiles = new Folder(supportFilesPath + "/Scripts/" + subfolder);

  if (supportFiles.exists) folders.push(supportFiles);

  // Get in appdata
  // Try in the main version first
  var appDataPath;
  if (DuSystem.mac)
    appDataPath = Folder.userData.parent.absoluteURI + "/Preferences";
  else appDataPath = Folder.userData.absoluteURI;
  var appDataFiles = new Folder(
    appDataPath +
      "/Adobe/After Effects/" +
      DuAE.version.major +
      "." +
      DuAE.version.minor +
      "/Scripts/" +
      subfolder,
  );

  // Try the Beta
  if (!appDataFiles.exists)
    appDataFiles = new Folder(
      Folder.userData.absoluteURI +
        "/Adobe/After Effects (Beta)/" +
        DuAE.version.major +
        "." +
        DuAE.version.minor +
        "/Scripts/" +
        subfolder,
    );

  if (appDataFiles.exists) folders.push(appDataFiles);

  return folders;
};

// ========== DEPRECATED ==========

/**
 * Converts an AE Collection to an Array<br />
 * This method is deprecated, you should use a {@link DuList} otherwise
 * @deprecated
 * @param {Array|Collection} collection - The collection to convert
 * @return {Array} The array
 */
DuAE.convertCollectionToArray = function (collection) {
  var arr = [];
  if (DuList.isAECollection(collection)) {
    for (var i = 1; i <= collection.length; i++) {
      arr.push(collection[i]);
    }
  } else {
    arr = collection;
  }
  return arr;
};
