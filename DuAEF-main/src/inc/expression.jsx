/**
 * After Effects expression tools
 * @namespace
 * @category DuAEF
 */
var DuAEExpression = {};

//caches
//this must be set to true during work on the cache to prevent it from updating
DuAEExpression.suspendCacheUpdates = false;

// the expression cache is an array of DuAEPropertyExpression
if (typeof $.global["DUAEF_DATA"].expressionCache === "undefined")
  $.global["DUAEF_DATA"].expressionCache = [];
if (typeof $.global["DUAEF_DATA"].lastExpressionCacheUpdateTime === "undefined")
  $.global["DUAEF_DATA"].lastExpressionCacheUpdateTime = 0;

/**
 * The different modes available to bake expressions
 * @enum {int}
 * @readonly
 */
DuAEExpression.BakeAlgorithm = {
  SMART: 0,
  PRECISE: 1,
};

/**
 * The list of expression IDs, added at the beginning of generated expressions.
 * @enum {string}
 */
DuAEExpression.Id = {
  LINK: "/*== DuAEF: property link ==*/",
};

/**
 * Updates the cache of the expressions used by Duik to speed up batch process of expressions in the whole project.<br />
 * It's automatically run when needed if it's not been updated in a long time (1 mn) or if it's empty
 * @param {bool} [selectionMode=DuAE.SelectionMode.ALL_COMPOSITIONS] What to update
 */
DuAEExpression.updateCache = function (selectionMode) {
  if (DuAEExpression.suspendCacheUpdates) return;

  selectionMode = def(selectionMode, DuAE.SelectionMode.ALL_COMPOSITIONS);

  //clear cache
  $.global["DUAEF_DATA"].expressionCache = [];

  var comps = [];
  if (
    selectionMode == DuAE.SelectionMode.ACTIVE_COMPOSITION ||
    selectionMode == DuAE.SelectionMode.SELECTED_LAYERS ||
    selectionMode == DuAE.SelectionMode.SELECTED_PROPERTIES
  )
    comps = [DuAEProject.getActiveComp()];
  else if (selectionMode == DuAE.SelectionMode.SELECTED_COMPOSITIONS)
    comps = app.project.selection;
  else if (selectionMode == DuAE.SelectionMode.ALL_COMPOSITIONS)
    comps = DuAEProject.getComps();

  for (var i = 0, num = comps.length; i < num; i++) {
    var comp = comps[i];
    if (!(comp instanceof CompItem)) continue;

    var layers = comp.layers;
    if (selectionMode == DuAE.SelectionMode.SELECTED_LAYERS)
      layers = comp.selectedLayers;
    else if (selectionMode == DuAE.SelectionMode.SELECTED_PROPERTIES)
      layers = DuAEComp.getSelectedProps();

    new DuList(layers).do(function (layer) {
      layer = new DuAEProperty(layer);
      layer.addToExpressionCache();
    });
  }

  $.global["DUAEF_DATA"].lastExpressionCacheUpdateTime = new Date().getTime();
};

/**
 * Runs a function on all expressions
 * @param {function} func The function to run, which takes one param, a {@link DuAEPropertyExpression} object.
 * @param {DuAE.SelectionMode} [selectionMode=DuAE.SelectionMode.ALL_COMPOSITIONS] What to update
 * @param {boolean} [updateCache=true] When false, the cache won't be updated before running the function. Set this to false if you already have updated the cache to improve performance.
 * @param {boolean} [apply=true] When false, the cache won't be applied back to Ae. Set this to false if you need to run other methods on expressions before applying the result to improve performance.
 * @param {boolean} [onlyIfNoError=false] Applies the cache only if it doesn't generate an error.
 */
DuAEExpression.doInExpresssions = function (
  func,
  selectionMode,
  updateCache,
  apply,
  onlyIfNoError,
) {
  selectionMode = def(selectionMode, DuAE.SelectionMode.ALL_COMPOSITIONS);
  updateCache = def(updateCache, true);
  apply = def(apply, true);

  if (updateCache) DuAEExpression.updateCache(selectionMode);

  for (
    var i = 0, num = $.global["DUAEF_DATA"].expressionCache.length;
    i < num;
    i++
  ) {
    func($.global["DUAEF_DATA"].expressionCache[i]);
  }

  if (apply) DuAEExpression.applyCache();
};

/**
 * Applies all the expressions stored in the cache to the actual properties in After Effects, if and only if they've been modified.
 * @param {DuAEPropertyExpression[]} [cache] The cache to apply, if different from the automatic DuAEF Cache
 * @param {boolean} [onlyIfNoError=false] Applies only if it doesn't generate an error.
 */
DuAEExpression.applyCache = function (cache, onlyIfNoError) {
  cache = def(cache, $.global["DUAEF_DATA"].expressionCache);
  onlyIfNoError = def(onlyIfNoError, false);

  for (
    var i = 0, num = $.global["DUAEF_DATA"].expressionCache.length;
    i < num;
    i++
  ) {
    $.global["DUAEF_DATA"].expressionCache[i].apply(onlyIfNoError);
  }
};

/**
 * Converts the expression as a string which can be copy/pasted and included in a script.
 * @param {Property|DuAEProperty|string} prop - The property containing the expression or the expression itself.
 * @param {string} [varName] - A name for the variable
 * @return {string} The stringified expression.
 */
DuAEExpression.scriptifyExpression = function (prop, varName) {
  varName = def(varName, "");
  varName = DuString.toCamelCase(varName);

  function line(str) {
    return "'" + str.replace("\r", "").replace(/'/g, "\\'") + "'";
  }

  var exp = "";
  if (jstype(prop) === "string") exp = prop;
  else {
    if (prop instanceof DuAEProperty) prop = prop.getProperty();
    exp = prop.expression;
  }

  var expArray = exp.split("\n");
  var expString = "";
  if (varName != "") expString += "var " + varName + " = ";

  expString += "[" + line(expArray[0]);

  for (var i = 1; i < expArray.length; i++) {
    expString += ",\n\t" + line(expArray[i]);
  }
  expString += "\n\t].join('\\n');";

  return expString;
};

/**
 * The expression library<br />
 * Use {@link DuAEExpression.Library.get} and {@link DuAEExpression.Library.getRequirements}<br />
 * to easily include the methods and classes listed here to your expressions.<br />
 * These methods take the name (listed here) of the function/class as arguments.
 * @namespace
 * @memberof DuAEExpression
 * @category DuAEF
 */
DuAEExpression.Library = {};

/**
 * Gets functions and their dependencies from the library.
 * @param {string[]} functions The name of the functions to get
 * @return {string} The expression
 */
DuAEExpression.Library.get = function (functions) {
  var exp = functions;
  new DuList(functions).do(function (functionName) {
    var r = DuAEExpression.Library.getRequirements(functionName);
    exp = exp.concat(r);
  });

  exp = new DuList(exp);
  exp.removeDuplicates();

  var expString =
    "/*\n" +
    "=== The following code uses DuAEF, the Duduf After Effects Framework ===\n\n" +
    "   Copyright (c) 2008 - 2022 Nicolas Dufresne, RxLaboratory, and contributors\n\n" +
    "   This code is free software: you can redistribute it and/or modify\n" +
    "   it under the terms of the GNU General Public License as published by\n" +
    "   the Free Software Foundation, either version 3 of the License, or\n" +
    "   (at your option) any later version.\n" +
    "*/\n\n";

  exp.do(function (expName) {
    expString += DuAEExpression.Library[expName].expression + "\n";
  });

  return expString;
};

/**
 * A recursive method to get all the requirements (dependencies) of a function from a library
 * @param {string} functionName The name of the function
 * @return {string[]} The names of the required functions, including the querried one
 */
DuAEExpression.Library.getRequirements = function (functionName) {
  var r = DuAEExpression.Library[functionName].requirements;
  if (r.length > 0) {
    for (var i = 0, iN = r.length; i < iN; i++) {
      r = r.concat(DuAEExpression.Library.getRequirements(r[i]));
    }
  }

  return r;
};
