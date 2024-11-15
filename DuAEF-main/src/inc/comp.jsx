﻿/**
 * After Effects composition methods
 * @namespace
 * @category DuAEF
 */
var DuAEComp = {};

/**
 * Associative array to get Comp Renderer names from their matchNames
 * @enum {string}
 */
DuAEComp.RendererNames = {};
DuAEComp.RendererNames["ADBE Advanced 3d"] = "Classic 3D";
DuAEComp.RendererNames["ADBE Standard 3d"] = "???";
DuAEComp.RendererNames["ADBE Picasso"] = "Ray-traced 3D";
DuAEComp.RendererNames["ADBE Ernst"] = "Cinema 4D";

/**
 * Converts the number of frames to the time in seconds
 * @param {int} frames The frames
 * @param {CompItem} [comp=DuAEProject.getActiveComp] The comp
 * @returns {float} The time, in seconds
 */
DuAEComp.framesToTime = function (frames, comp) {
  comp = def(comp, DuAEProject.getActiveComp());
  if (!comp) return 0;

  return frames * comp.frameDuration;
};

/**
 * Converts the time in seconds to the number of frames
 * @param {float} [time=comp.time] The time in seconds
 * @param {CompItem} [comp=DuAEProject.getActiveComp] The comp
 * @returns {int} The number of frames, rounded
 */
DuAEComp.timeToFrames = function (time, comp) {
  comp = def(comp, DuAEProject.getActiveComp());
  if (!comp) return 0;
  time = def(time, comp.time);

  return Math.round(time / comp.frameDuration);
};

/**
 * Replaces text in Expressions
 * @param {string} oldString - The string to replace
 * @param {string} newString - The new string
 * @param {boolean} [caseSensitive=true] - Whether the search has to be case sensitive
 * @param {boolean} [selectedLayers=false] Set to true to cache only selected layers.
 * @param {CompItem} [comp=DuAEProject.getActiveComp()] The comp with expressions to cache.
 */
DuAEComp.replaceInExpressions = function (
  oldString,
  newString,
  caseSensitive,
  selectedLayers,
) {
  var comp = DuAEProject.getActiveComp();
  if (!comp) return;

  caseSensitive = def(caseSensitive, true);
  selectedLayers = def(selectedLayers, false);

  var selectionMode = DuAE.SelectionMode.SELECTED_LAYERS;
  if (!selectedLayers) selectionMode = DuAE.SelectionMode.ACTIVE_COMPOSITION;

  var re = new RegExp(DuRegExp.escape(oldString), caseSensitive ? "g" : "gi");

  DuAEExpression.doInExpresssions(function (e) {
    e.changed = re.test(e.expression);
    if (e.changed) e.expression = e.expression.replace(re, newString);
    return e;
  }, selectionMode);
};

/**
 * Replace all <code>thisComp</code> occurences by <code>comp("name")</code>.
 * @param {DuAE.SelectionMode} [selectionMode=DuAE.ACTIVE_COMPOSITION] The comp(s)/layers/properties to use.
 */
DuAEComp.removeThisCompInExpressions = function (selectionMode) {
  selectionMode = def(selectionMode, DuAE.ACTIVE_COMPOSITION);

  var re = new RegExp(
    "(^\\s*|" +
      DuRegExp.javascriptSymbols +
      ")thisComp(?!" +
      DuRegExp.javascriptVarChars +
      ")",
    "gm",
  );

  DuAEExpression.doInExpresssions(function (e) {
    e.changed = re.test(e.expression);
    if (e.changed)
      e.expression = e.expression.replace(re, '$1comp("' + e.comp.name + '")');
  }, selectionMode);
};

/**
 * Replace all <code>comp("name")</code> occurences by <code>thisComp</code>.
 * @param {DuAE.SelectionMode} [selectionMode=DuAE.ACTIVE_COMPOSITION] The comp(s)/layers/properties to use.
 */
DuAEComp.removeCompInExpressions = function (selectionMode) {
  selectionMode = def(selectionMode, DuAE.ACTIVE_COMPOSITION);

  DuAEExpression.doInExpresssions(function (e) {
    var name = e.comp.name;
    var re = new RegExp(
      "(^\\s*|" +
        DuRegExp.javascriptSymbols +
        ")comp\\s*\\(\\s*[\"']" +
        DuRegExp.escape(name) +
        "[\"']\\s*\\)",
      "gm",
    );
    e.changed = re.test(e.expression);
    if (e.changed) e.expression = e.expression.replace(re, "$1thisComp");
  }, selectionMode);
};

/**
 * Replace all <code>thisLayer</code> occurences by <code>layer("name")</code>.
 * @param {DuAE.SelectionMode} [selectionMode=DuAE.ACTIVE_COMPOSITION] The comp(s)/layers/properties to use.
 */
DuAEComp.removeThisLayerInExpressions = function (selectionMode) {
  selectionMode = def(selectionMode, DuAE.ACTIVE_COMPOSITION);

  var re = new RegExp(
    "(^\\s*|" +
      DuRegExp.javascriptSymbols +
      ")thisLayer(?!" +
      DuRegExp.javascriptVarChars +
      ")",
    "gm",
  );

  DuAEExpression.doInExpresssions(function (e) {
    e.changed = re.test(e.expression);
    if (e.changed)
      e.expression = e.expression.replace(
        re,
        '$1thisComp.layer("' + e.layer.name + '")',
      );
  }, selectionMode);
};

/**
 * Replace all <code>comp("name")</code> occurences by <code>thisComp</code>.
 * @param {DuAE.SelectionMode} [selectionMode=DuAE.ACTIVE_COMPOSITION] The comp(s)/layers/properties to use.
 */
DuAEComp.removeLayerInExpressions = function (selectionMode) {
  selectionMode = def(selectionMode, DuAE.ACTIVE_COMPOSITION);

  DuAEExpression.doInExpresssions(function (e) {
    var name = e.layer.name;
    var re = new RegExp(
      "(^\\s*|" +
        DuRegExp.javascriptSymbolsNoDot +
        ")(thisComp.)?layer\\s*\\(\\s*[\"']" +
        DuRegExp.escape(name) +
        "[\"']\\s*\\)",
      "gm",
    );
    e.changed = re.test(e.expression);
    if (e.changed) e.expression = e.expression.replace(re, "$1thisLayer");
  }, selectionMode);
};

/**
 * Makes sure the composition has a unique name, renaming it if needed.
 * @param {CompItem} comp - The composition
 * @return {string} The new name.
 */
DuAEComp.setUniqueCompName = function (comp) {
  if (!(comp instanceof CompItem))
    throw "Cannot set a unique composition name, this is not a composition.";
  //temporarily rename the comp to check for its name
  var newName = comp.name;
  comp.name = "***DuAEF-temp-name-xxx***";
  comp.name = DuAEProject.newUniqueCompName(newName, false);
  app.project.autoFixExpressions(newName, comp.name);
  return comp.name;
};

/**
 * Makes sure all layers in the comp have unique names, renaming them if needed.
 * @param {Array|LayerCollection} [layers=comp.layers] - The layers
 * @param {CompItem} [comp=DuAEProject.getActiveComp] - The composition
 */
DuAEComp.setUniqueLayerNames = function (layers, comp) {
  comp = def(comp, DuAEProject.getActiveComp());
  if (!comp) return;
  layers = def(layers, comp.layers);
  var it = new DuList(layers);
  it.do(function (layer) {
    var locked = layer.locked;
    layer.locked = false;
    //temporarily set another name to correctly generate a new unique name
    var oldName = layer.name;
    layer.name = "***Duik-temp-name-xxx***";
    layer.name = DuAEComp.newUniqueLayerName(oldName, comp);
    app.project.autoFixExpressions(oldName, layer.name);
    layer.locked = locked;
  });
};

/**
 * Gets the After Effects selected properties in the current comp
 * @param {PropertyType|PropertyValueType|string|function}	 [filter]	- A filter to get only a certain type, or value type, or property name or matchName.<br />
 * A function which take one PropertyBase as argument can be used to filter the properties: the Property will be returned if the function returns true.
 * @param {boolean}	[strict=false]	- If a string filter is provided, whether to search for the exact name/matchName or if it contains the filter.
 * @param {boolean}	[caseSensitive=true]	- If a string filter is provided, and not strict is false, does the search have to be case sensitive?
 * @return {DuAEProperty[]} The selected properties, an empty Array if nothing active or selected
 */
DuAEComp.getSelectedProps = function (filter, strict, caseSensitive) {
  var props = [];
  var comp = DuAEProject.getActiveComp();
  if (!comp) return props;

  //if no filter, get all using AE native API
  if (!isdef(filter)) {
    var layers = comp.selectedLayers;
    var itLayers = new DuList(layers);
    itLayers.do(function (layer) {
      props = props.concat(layer.selectedProperties);
    });
  } else {
    var layers = comp.selectedLayers;
    if (layers.length === 0) return props;

    for (var i = 0, numL = layers.length; i < numL; i++) {
      props = props.concat(
        DuAELayer.getSelectedProps(layers[i], filter, strict, caseSensitive),
      );
    }
  }

  return DuAE.getDuAEProperty(props);
};

/**
 * Gets the first selected property (which is not a group)
 * @param {CompItem} [comp] The comnposition. The active composition by default.
 * @return {DuAEProperty|null} The selected property.
 */
DuAEComp.getSelectedProperty = function (comp) {
  comp = def(comp, DuAEProject.getActiveComp());
  if (!comp) return null;

  var props = comp.selectedProperties;
  if (props.length == 0) return null;
  var prop = null;
  for (var i = 0, n = props.length; i < n; i++) {
    var p = props[i];
    if (p instanceof Property) {
      prop = p;
      break;
    }
  }
  return new DuAEProperty(prop);
};

/**
 * Gets the selected layers in the current comp
 * @return {Layer[]} The selected layers
 */
DuAEComp.getSelectedLayers = function () {
  var comp = DuAEProject.getActiveComp();
  if (!comp) return [];
  return comp.selectedLayers;
};

/**
 * Gets the first selected layer in the After Effects current composition
 * @return {Layer|null} The layer or null if there's no current comp / no selected layer
 */
DuAEComp.getActiveLayer = function () {
  var layers = DuAEComp.getSelectedLayers();
  return layers[0];
};

/**
 * Runs a function on all the layers
 * @param {function} method - The function to run on the layers, which takes a layer as its only argument.
 * @param {CompItem} [comp] - The comp containing the layers. Will use the current comp if not provided.
 * @param {Bool} [reverse=false] - Set this to true to iterate from the end.
 */
DuAEComp.doLayers = function (method, comp, reverse) {
  comp = def(comp, DuAEProject.getActiveComp());
  if (!comp) return;

  //get layers
  var it = new DuList(comp.layers);
  it.do(method, reverse);
};

/**
 * Gets the After Effects animated (with keyframes) properties in the current comp
 * @param {PropertyType|PropertyValueType|string|function}	 [filter]	- A filter to get only a certain type, or value type, or property name or matchName.<br />
 * A function which take one PropertyBase as argument can be used to filter the properties: the Property will be returned if the function returns true.
 * @param {boolean}	[strict=false]	- If a string filter is provided, whether to search for the exact name/matchName or if it contains the filter.
 * @param {boolean}	[caseSensitive=true]	- If a string filter is provided, and not strict is false, does the search have to be case sensitive?
 * @param {boolean}	[selectedLayersOnly=false]	- True to get the properties on the selected layers only
 * @param {CompItem}	[comp=DuAEProject.getActiveComp]	- The composition
 * @return {DuAEProperty[]} The selected properties, an empty Array if nothing active or selected
 */
DuAEComp.getAnimatedProps = function (
  filter,
  strict,
  caseSensitive,
  selectedLayersOnly,
  comp,
) {
  var props = [];
  if (!isdef(comp)) comp = DuAEProject.getActiveComp();
  if (!comp) return props;

  selectedLayersOnly = def(selectedLayersOnly, false);

  var layers;
  if (selectedLayersOnly) layers = comp.selectedLayers;
  else layers = comp.layers;

  var it = new DuList(layers);
  it.do(function (layer) {
    layer = new DuAEProperty(layer);
    props = props.concat(layer.getAnimatedProps(filter, strict, caseSensitive));
  });

  return props;
};

/**
 * Deselects all properties in the current composition
 */
DuAEComp.unselectProperties = function () {
  var comp = DuAEProject.getActiveComp();
  if (!comp) return props;
  var props = comp.selectedProperties;
  for (var i = 0; i < props.length; i++) {
    props[i].selected = false;
  }
};

/**
 * Deselects all layers in a composition
 * @param {CompItem} [comp=app.project.activeItem] - The composition
 * @return {Layer[]} The previously selected layers.<br />
 * A custom attribute, Layer.props is added on each layer object which is an array of all previously selected properties as DuAEProperty objects
 */
DuAEComp.unselectLayers = function (comp) {
  if (!isdef(comp)) comp = DuAEProject.getActiveComp();
  if (!comp) return [];

  var layers = [];

  if (!comp) return layers;
  if (!(comp instanceof CompItem)) return layers;

  layers = [];

  while (comp.selectedLayers.length > 0) {
    var layer = comp.selectedLayers[0];
    layer.props = DuAE.getDuAEProperty(layer.selectedProperties);
    layer.selected = false;
    layers.push(layer);
  }

  return layers;
};

/**
 * Selects the layers
 * @param {Layer[]|DuList.<Layer>} layers - The layers
 */
DuAEComp.selectLayers = function (layers) {
  new DuList(layers).do(function (layer) {
    if (layer == undefined) return;
    if (layer == null) return;
    layer.selected = true;
  });
};

/**
 * Generates a new unique name for a layer
 * @param {string} newName	- The wanted new name
 * @param {CompItem} [comp] 	- The comp
 * @param {boolean} [increment=true] - true to automatically increment the new name if it already ends with a digit
 * @return {string}	The unique name, with a new number at the end if needed.
 */
DuAEComp.newUniqueLayerName = function (newName, comp, increment) {
  // Ignore the last block
  // Deactivated - Why did I do that in the first place??
  // Answer: because I wanted the number not to be at the end... Which was a very bad idea
  /*var nName = newName.split(' | ');
    var lastBlock = '';
    if (nName.length == 4) {
        lastBlock = nName.pop();
        newName = nName.join(' | ');
    }//*/

  // Let's try to remove any trailing number first, that's better
  newName = DuString.trimNumbers(newName);

  increment = def(increment, true);
  comp = def(comp, DuAEProject.getActiveComp());
  var layerNames = [];
  // Check if we really need to change the name
  var isAlreadyUnique = true;
  for (var i = 1; i <= comp.layers.length; i++) {
    var n = comp.layer(i).name;
    if (n == newName) isAlreadyUnique = false;
    // Ignore the last block
    /*var tName = n.split(' | ');
        if (tName.length == 4) {
            tName.pop();
            n = tName.join(' | ');
        }//*/
    layerNames.push(n);
  }
  // Let's stop here if there's no need to change it
  if (isAlreadyUnique) return newName;

  newName = DuString.generateUnique(newName, layerNames, increment);
  // Ignore the last block
  //if (lastBlock != '') newName += ' | ' + lastBlock;
  return newName;
};

/**
 * Generates a new unique name for a marker for this comp
 * @param {string} newName	- The wanted new name
 * @param {CompItem} comp 	- The comp
 * @param {boolean} [increment=true] - true to automatically increment the new name if it already ends with a digit
 * @return {string}	The unique name, with a new number at the end if needed.
 */
DuAEComp.newUniqueMarkerName = function (newName, comp, increment) {
  if (increment == undefined) increment = true;
  var markerNames = [];
  for (var i = 1, num = comp.markerProperty.numKeys; i <= num; i++) {
    markerNames.push(comp.markerProperty.keyValue(i).comment);
  }
  return DuString.generateUnique(newName, markerNames, increment);
};

/**
 * Creates a new Adjustment layer
 * @param {CompItem} comp 	- The comp
 * @return {AVLayer}	The layer.
 */
DuAEComp.addAdjustmentLayer = function (comp) {
  if (comp == undefined) return null;
  var layer = comp.layers.addSolid(
    [1, 1, 1],
    DuAEComp.newUniqueLayerName("Adjustment Layer", comp),
    comp.width,
    comp.height,
    comp.pixelAspect,
    comp.duration,
  );
  layer.adjustmentLayer = true;
  return layer;
};

/**
 * Links all orphan layers in the comp to a layer
 * @param {Layer} layer - The parent layer
 * @param {bool} [includeLockedLayers=false] - True to parent layers even if they are locked
 */
DuAEComp.parentAllOrphans = function (layer, includeLockedLayers) {
  includeLockedLayers = def(includeLockedLayers, false);
  var comp = layer.containingComp;
  for (var i = 1, num = comp.numLayers; i <= num; i++) {
    if (i == layer.index) continue;
    var l = comp.layer(i);
    if (DuAELayer.getRelation(l, layer) < 0) continue;
    var locked = l.locked;
    if (locked && includeLockedLayers) l.locked = false;
    if (!locked && l.parent == null) l.parent = layer;
    if (locked && includeLockedLayers) l.locked = locked;
  }
};

/**
 * Gets all precomps and parent comps of the composition
 * @param {CompItem} [comp=DuAEProject.getActiveComp()] - The composition
 * @param {bool} [recursive=false] - True to search to more than one level of precomposition
 * @return {CompItem[]} The related compositons
 */
DuAEComp.getRelatives = function (comp, recursive) {
  recursive = def(recursive, false);
  comp = def(comp, DuAEProject.getActiveComp());
  if (!comp) return [];
  //get precomps
  var precomps = DuAEComp.getPrecomps(comp, recursive);
  //get parent
  var parentComps = [];
  if (recursive) {
    parentComps = DuAEComp.getParentComps(comp);
  } else {
    parentComps = comp.usedIn;
  }

  return precomps.concat(parentComps);
};

/**
 * Gets all the precomposition found in the comp.
 * @param {CompItem} [comp] - The composition. The active composition if ommitted.
 * @param {bool} [recursive=false] - True to get nested compositions
 * @return {DuList.<CompItem>} The precompositions
 */
DuAEComp.getPrecomps = function (comp, recursive) {
  comp = def(comp, DuAEProject.getActiveComp());
  if (!comp) return new DuList();
  recursive = def(recursive, true);
  var precomps = new DuList();
  var it = new DuList(comp.layers);
  it.do(function (layer) {
    var precomp = layer.source;
    if (precomp instanceof CompItem) {
      precomps.push(precomp);
      if (recursive) precomps = precomps.concat(DuAEComp.getPrecomps(precomp));
    }
  });
  //remove duplicates
  precomps.removeDuplicates();
  return precomps;
};

/**
 * Recursively gets all compositions where this item is used
 * @param {AVItem} item - The item
 * @return {CompItem[]} The compositions
 */
DuAEComp.getParentComps = function (item) {
  var parentComps = item.usedIn;
  new DuList(parentComps).do(function (parentComp) {
    parentComps = parentComps.concat(DuAEComp.getParentComps(parentComp));
  });
  parentComps = new DuList(parentComps);
  parentComps.removeDuplicates();
  return parentComps;
};

/**
 * Gets all the layers with audio in the composition
 * @param {CompItem}	 comp	The composition where the audio will be searched
 * @param {bool}	[audioActiveOnly=false]	 If true, does not get muted layers.
 * @return {AVLayer[]} An array of AVLayer containing the audio layers
 */
DuAEComp.getAudioLayers = function (comp, audioActiveOnly) {
  audioActiveOnly = def(audioActiveOnly, false);
  var layers = comp.layers;
  var audioLayers = [];
  var it = new DuList(layers);
  it.do(function (layer) {
    if (layer.hasAudio) {
      if ((audioActiveOnly && layer.audioEnabled) || !audioActiveOnly) {
        audioLayers.push(layer);
      }
    }
  });

  return audioLayers;
};

/**
 * Gets the total number of master properties used on precompositions in the comp.
 * @param {CompItem} [comp=DuAEProject.getActiveComp] The composition to check
 * @return {int} The number of master properties
 */
DuAEComp.numMasterProperties = function (comp) {
  if (DuAE.version.version < 15.1) return 0;
  comp = def(comp, DuAEProject.getActiveComp());
  if (!comp) return 0;
  var numMP = 0;
  for (var i = 1, n = comp.numLayers; i <= n; i++) {
    var l = comp.layer(i);
    if (!l.source) continue;
    if (l.source instanceof CompItem) {
      numMP += l("ADBE Layer Overrides").numProperties;
    }
  }
  return numMP;
};

/**
 * Checks if all layers have a different name.
 * @param {CompItem} [comp=DuAEProject.getActiveComp] The comp to check
 * @return {Object} The list of names used several times. Check the length attribute to know how many duplicates were found, loop through the keys to get the names. Eech key is an array containing the list of layers with that name.
 * @example
 * var dupes = DuAEComp.checkLayerNames();
 * if (dupes.length != 0) {
 * for (name in dupes)
 * {
 *     if (dupes.hasOwnProperty(name)) alert(dupes[name]); //dupes[name] is an array of Layer
 * }
 * }
 */
DuAEComp.checkLayerNames = function (comp) {
  comp = def(comp, DuAEProject.getActiveComp());
  var duplicatedNames = {};
  duplicatedNames.length = 0;
  if (!comp) return duplicatedNames;
  var layerNames = {};
  var layers = app.project.items;
  for (var i = 1, n = comp.numLayers; i <= n; i++) {
    var layer = comp.layer(i);
    var name = layer.name;

    if (duplicatedNames.hasOwnProperty(name)) {
      duplicatedNames[name].push(layer);
      continue;
    }

    if (layerNames.hasOwnProperty(name)) {
      duplicatedNames[name] = [layerNames[name], layer];
      duplicatedNames.length++;
      continue;
    }
    layerNames[name] = layer;
  }
  return duplicatedNames;
};

/**
 * Creates a new "Null Shape" in the comp.
 * @param {CompItem} [comp=DuAEProject.getActiveComp] The comp where to create the layer
 * @param {float} [size=100] The size of the null
 * @param {Layer} [layer] A layer for the location of the null
 * @returns {ShapeLayer} The null layer
 */
DuAEComp.addNull = function (comp, size, layer) {
  comp = def(comp, DuAEProject.getActiveComp());
  if (!comp) return;
  size = def(size, 100);
  layer = def(layer, null);

  var nullLayer = comp.layers.addShape();
  nullLayer.guideLayer = true;
  nullLayer.name = DuAEComp.newUniqueLayerName(
    i18n._p("After Effects Layer", "Null"),
  );
  nullLayer.label = 1;

  DuAELayer.applyPreset(nullLayer, preset_null.toFile());

  if (layer != null) {
    layerParent = layer.parent;
    layer.parent = null;
    nullLayer.transform.position.setValue(layer.transform.position.value);
    layer.parent = layerParent;
    nullLayer.moveBefore(layer);
    nullLayer.name = "Null " + layer.name;
  }

  DuAELayer.setType(DuAELayer.Type.NULL, nullLayer);

  return nullLayer;
};

/**
 * Creates a new "Adjustment Shape Layer" in the comp.
 * @param {CompItem} [comp=DuAEProject.getActiveComp] The comp where to create the layer
 * @returns {ShapeLayer} The adjustment layer
 */
DuAEComp.addAdjustmentLayer = function (comp) {
  comp = def(comp, DuAEProject.getActiveComp());
  if (!comp) return;

  var layer = comp.layers.addShape();
  layer.name = DuAEComp.newUniqueLayerName(DuAELayer.Type.ADJUSTMENT);
  layer.adjustmentLayer = true;
  layer.label = 5;

  var solidGroup = layer("ADBE Root Vectors Group").addProperty(
    "ADBE Vector Group",
  );
  solidGroup.name = "Solid";
  var solidContent = solidGroup.property("ADBE Vectors Group");
  var solid = solidContent.addProperty("ADBE Vector Shape - Rect");
  solid("ADBE Vector Rect Size").setValue([comp.width, comp.height]);
  var fill = solidContent.addProperty("ADBE Vector Graphic - Fill");
  fill("ADBE Vector Fill Color").setValue([1, 1, 1, 1]);

  DuAELayer.setType(DuAELayer.Type.ADJUSTMENT, layer);

  return layer;
};

/**
 * Creates a new "Solid Shape Layer" in the comp.
 * @param {DuColor} [color=DuColor.Color.RAINBOX_RED] The color of the solid
 * @param {CompItem} [comp=DuAEProject.getActiveComp] The comp where to create the layer
 * @returns {ShapeLayer} The adjustment layer
 */
DuAEComp.addSolid = function (color, comp) {
  comp = def(comp, DuAEProject.getActiveComp());
  if (!comp) return;

  color = def(color, DuColor.Color.RAINBOX_RED);
  if (!(color instanceof DuColor)) color = new DuColor(color);

  var layer = comp.layers.addShape();
  layer.name = DuAEComp.newUniqueLayerName(DuAELayer.Type.SOLID);
  layer.label = 1;

  var solidGroup = layer("ADBE Root Vectors Group").addProperty(
    "ADBE Vector Group",
  );
  solidGroup.name = "Solid";
  var solidContent = solidGroup.property("ADBE Vectors Group");
  var solid = solidContent.addProperty("ADBE Vector Shape - Rect");
  solid("ADBE Vector Rect Size").setValue([comp.width, comp.height]);
  var fill = solidContent.addProperty("ADBE Vector Graphic - Fill");
  fill("ADBE Vector Fill Color").setValue(color.floatRGBA());

  DuAELayer.setType(DuAELayer.Type.SOLID, layer);

  return layer;
};

/**
 * Creates a new Shape Layer in the comp.
 * @param {DuAEShapeLayer.Primitive} [shape=DuAEShapeLayer.Primitive.NONE] The shape
 * @param {DuColor} [color=DuColor.Color.RAINBOX_RED] The color of the shape
 * @param {CompItem} [comp=DuAEProject.getActiveComp] The comp where to create the layer
 * @returns {ShapeLayer} The adjustment layer
 */
DuAEComp.addShape = function (shape, color, comp) {
  comp = def(comp, DuAEProject.getActiveComp());
  if (!comp) return;

  shape = def(shape, DuAEShapeLayer.Primitive.NONE);
  color = def(color, DuColor.Color.RAINBOX_RED);

  var layer = comp.layers.addShape();
  layer.name = DuAEComp.newUniqueLayerName(
    i18n._p("After Effects Layer", "Shape"),
  );

  if (shape == DuAEShapeLayer.Primitive.NONE) return layer;

  var solidGroup = layer("ADBE Root Vectors Group").addProperty(
    "ADBE Vector Group",
  );
  var solidContent = solidGroup.property("ADBE Vectors Group");

  var size = comp.height / 3;

  if (shape == DuAEShapeLayer.Primitive.SQUARE) {
    solidGroup.name = i18n._("Rectangle");
    layer.name = DuAEComp.newUniqueLayerName(i18n._("Rectangle"));
    var solid = solidContent.addProperty("ADBE Vector Shape - Rect");
    solid("ADBE Vector Rect Size").setValue([size, size]);
  } else if (shape == DuAEShapeLayer.Primitive.ROUNDED_SQUARE) {
    solidGroup.name = i18n._("Rounded rectangle");
    layer.name = DuAEComp.newUniqueLayerName(i18n._("Rounded rectangle"));
    var solid = solidContent.addProperty("ADBE Vector Shape - Rect");
    solid("ADBE Vector Rect Size").setValue([size, size]);
    solid("ADBE Vector Rect Roundness").setValue(size / 10);
  } else if (shape == DuAEShapeLayer.Primitive.CIRCLE) {
    solidGroup.name = i18n._("Circle");
    layer.name = DuAEComp.newUniqueLayerName(i18n._("Circle"));
    var solid = solidContent.addProperty("ADBE Vector Shape - Ellipse");
    solid("ADBE Vector Ellipse Size").setValue([size, size]);
  } else if (shape == DuAEShapeLayer.Primitive.POLYGON) {
    solidGroup.name = i18n._("Polygon");
    layer.name = DuAEComp.newUniqueLayerName(i18n._("Polygon"));
    var solid = solidContent.addProperty("ADBE Vector Shape - Star");
    solid("ADBE Vector Star Type").setValue(2);
    solid("ADBE Vector Star Outer Radius").setValue(size);
  } else if (shape == DuAEShapeLayer.Primitive.STAR) {
    solidGroup.name = i18n._("Star");
    layer.name = DuAEComp.newUniqueLayerName(i18n._("Star"));
    var solid = solidContent.addProperty("ADBE Vector Shape - Star");
    solid("ADBE Vector Star Inner Radius").setValue(size * 0.385);
    solid("ADBE Vector Star Outer Radius").setValue(size);
  }

  var fill = solidContent.addProperty("ADBE Vector Graphic - Fill");
  fill("ADBE Vector Fill Color").setValue(
    DuColor.Color.APP_HIGHLIGHT_COLOR.floatRGBA(),
  );

  return layer;
};

/**
 * Saves a thumbnail of the comp to a PNG file
 * @param {File} file The file to save the thumbnail
 * @param {int[]} [maxRes=[500,500]] The maximum resolution of the thumbnail, which will be smaller than that, but not exactly this size.
 * @param {float} [time] The time at which to grab the picture. If omitted, will use the current time.
 * @param {CompItem} [comp=DuAEProject.getActiveComp()] The composition
 * @returns {Boolean} True on success, false otherwise.
 */
DuAEComp.thumbnail = function (file, maxRes, time, comp) {
  comp = def(comp, DuAEProject.getActiveComp());
  if (!comp) return false;

  maxRes = def(maxRes, [500, 500]);
  time = def(time, comp.time);

  // Downsample
  var currentResolution = comp.resolutionFactor;

  var newFactor = Math.ceil(comp.width / maxRes[0]);
  var test = Math.ceil(comp.height / maxRes[1]);
  if (test > newFactor) newFactor = test;

  comp.resolutionFactor = [newFactor, newFactor];

  comp.saveFrameToPng(time, file);

  // Restore
  comp.resolutionFactor = currentResolution;

  return true;
};

/**
 * Gets the camera in the comp, in the given layers if possible.
 * @param {Layer[]|DuList.<Layer>} [layers] Some layers to find the camera first. Selected layers if omitted.
 * @return {CameraLayer|null} The camera if it was found.
 */
DuAEComp.camera = function (layers) {
  layers = def(layers, DuAEComp.getSelectedLayers());
  layers = new DuList(layers);

  // Search in selected layers
  var layer;
  while ((layer = layers.next())) {
    if (layer instanceof CameraLayer) return layer;
  }

  // Get composition
  var comp;
  if (layers.isEmpty()) comp = DuAEProject.getActiveComp();
  else comp = layers.at(0).containingComp;
  if (!comp) return null;

  // Search in all comp layers
  for (var i = 1, n = comp.numLayers; i <= n; i++) {
    var l = comp.layer(i);
    if (l instanceof CameraLayer) return l;
  }

  return null;
};

/**
 * Crops a composition
 * @param {float[]} bounds The bounds [top, left, width, height]
 * @param {CompItem} [comp] The composition. The active composition by default.
 */
DuAEComp.crop = function (bounds, comp) {
  comp = def(comp, DuAEProject.getActiveComp());

  // Add Null to move everybody
  var n = DuAEComp.addNull(comp);
  n.transform.position.setValue([0, 0]);
  DuAEComp.parentAllOrphans(n, true);
  // Offset
  n.transform.position.setValue([-bounds[1], -bounds[0]]);
  // Remove
  n.remove();

  // Resize
  comp.width = parseInt(bounds[2]);
  comp.height = parseInt(bounds[3]);
};

/**
 * Bakes the expressions to keyframes.
 * @param {DuAEExpression.BakeAlgorithm} [mode=DuAEExpression.BakeAlgorithm.SMART] The algorithm to use for baking the expressions.
 * @param {float} [frameStep=1.0] By default, checks one value per keyframe. A lower value increases the precision and allows for sub-frame sampling. A higher value is faster but less precise.
 * @param {CompItem} [comp] The composition. The active composition by default.
 */
DuAEComp.bakeExpressions = function (mode, frameStep, comp) {
  DuAEComp.doLayers(function (layer) {
    var l = new DuAEProperty(layer);
    l.bakeExpressions(mode, frameStep);
  }, comp);
};

/**
 * Bakes the expressions to keyframes and removes all non-renderable layers.
 * @param {DuAEExpression.BakeAlgorithm} [mode=DuAEExpression.BakeAlgorithm.SMART] The algorithm to use for baking the expressions.
 * @param {float} [frameStep=1.0] By default, checks one value per keyframe. A lower value increases the precision and allows for sub-frame sampling. A higher value is faster but less precise.
 * @param {CompItem} [comp] The composition. The active composition by default.
 */
DuAEComp.bake = function (mode, frameStep, comp) {
  // Bake all layers
  DuAEComp.doLayers(
    function (layer) {
      // Don't bake non-renderable layers
      if (!DuAELayer.isRenderable(layer)) return;
      DuAELayer.bake(mode, frameStep, layer);
    },
    comp,
    true,
  );

  // Remove non-renderable layers
  DuAEComp.doLayers(
    function (layer) {
      if (!DuAELayer.isRenderable(layer)) {
        layer.locked = false;
        layer.remove();
      }
    },
    comp,
    true,
  );
};

/**
 * Updates the composition settings
 * @param {Object} settings The settings to update.
 * @param {bool} [updatePrecomps=true] Set to false to update only the selected/current comp
 * @param {CompItem[]} [comps] The compositions to update. If omitted, will update either the selected items in the project or the current composition
 */
DuAEComp.updateSettings = function (settings, updatePrecomps, comps) {
  updatePrecomps = def(updatePrecomps, true);

  if (!isdef(comps)) {
    // Active comp
    if (
      app.project.activeItem !== null &&
      app.project.activeItem instanceof CompItem
    ) {
      comps = [app.project.activeItem];
    } // Or selection
    else {
      comps = proj.selection;
    }
  }
  if (comps.length == 0) return;

  // Keep the ones which are updated
  var okIds = new DuList();
  // Aaaand GO!
  for (var i = 0, n = comps.length; i < n; i++) {
    var comp = comps[i];
    // Not a comp
    if (!(comp instanceof CompItem)) continue;
    // Already updated
    if (okIds.contains(comp.id)) continue;

    okIds.push(comp.id);

    if (updatePrecomps) {
      // Get precomps to update them
      var precomps = DuAEComp.getPrecomps(comp, true);
      var precompsToUpdate = [];
      precomps.do(function (precomp) {
        if (okIds.contains(precomp.id)) return;
        precompsToUpdate.push(precomp);
        okIds.push(precomp.id);
      });
      DuAEComp.updateSettings(settings, false, precompsToUpdate);
    }

    // Resize
    var w = typeof settings.width !== "undefined";
    var h = typeof settings.height !== "undefined";
    if (w || h) {
      settings.anchor = def(settings.anchor, DuMath.Location.CENTER);
      // Add null
      var z = DuAEComp.addNull(comp);
      // Parent
      DuAELayer.parent(comp.layers, z, true);
      var offset = [0, 0];
      if (w) {
        offset[0] = settings.width - comp.width;
        if (DuMath.isLocationHCenter(settings.anchor)) offset[0] /= 2;
        if (DuMath.isLocationLeft(settings.anchor)) offset[0] = 0;
        comp.width = settings.width;
      }
      if (h) {
        offset[1] = settings.height - comp.height;
        if (DuMath.isLocationVCenter(settings.anchor)) offset[1] /= 2;
        if (DuMath.isLocationTop(settings.anchor)) offset[1] = 0;
        comp.height = settings.height;
      }
      DuAELayer.translate(z, offset);
      z.remove();
    }

    if (typeof settings.pixelAspect !== "undefined")
      comp.pixelAspect = settings.pixelAspect;
    if (typeof settings.frameRate !== "undefined")
      comp.frameRate = settings.frameRate;
    if (typeof settings.duration !== "undefined") {
      var newDuration = currentFormatToTime(
        settings.duration,
        comp.frameRate,
        true,
      );
      // We're also going to (try to) set a new duration for all layers ending with the comp
      if (comp.duration < newDuration) {
        for (var l = 1, ln = comp.numLayers; l <= ln; l++) {
          var layer = comp.layer(l);
          var locked = layer.locked;
          layer.locked = false;
          if (layer.outPoint >= comp.duration) layer.outPoint = newDuration;
          layer.locked = locked;
        }
      }
      comp.duration = newDuration;
    }
    if (typeof settings.resolutionFactor !== "undefined")
      comp.resolutionFactor = settings.resolutionFactor;
    if (typeof settings.preserveNestedResolution !== "undefined")
      comp.preserveNestedResolution = settings.preserveNestedResolution;
    if (typeof settings.bgColor !== "undefined")
      comp.bgColor = settings.bgColor;
    //if (typeof settings.draft3D !== 'undefined') comp.draft3D = settings.draft3D;
    if (typeof settings.hideShyLayers !== "undefined")
      comp.hideShyLayers = settings.hideShyLayers;
    if (typeof settings.useProxy !== "undefined" && comp.proxySource)
      comp.useProxy = settings.useProxy;
    if (typeof settings.renderer !== "undefined")
      comp.renderer = settings.renderer;
    if (typeof settings.preserveNestedFrameRate !== "undefined")
      comp.preserveNestedFrameRate = settings.preserveNestedFrameRate;
    if (typeof settings.frameBlending !== "undefined")
      comp.frameBlending = settings.frameBlending;
    if (typeof settings.motionBlur !== "undefined")
      comp.motionBlur = settings.motionBlur;
    if (typeof settings.shutterAngle !== "undefined")
      comp.shutterAngle = settings.shutterAngle;
    if (typeof settings.shutterPhase !== "undefined")
      comp.shutterPhase = settings.shutterPhase;
    if (typeof settings.motionBlurSamplesPerFrame !== "undefined")
      comp.motionBlurSamplesPerFrame = settings.motionBlurSamplesPerFrame;
    if (typeof settings.motionBlurAdaptiveSampleLimit !== "undefined")
      comp.motionBlurAdaptiveSampleLimit =
        settings.motionBlurAdaptiveSampleLimit;
  }
};
