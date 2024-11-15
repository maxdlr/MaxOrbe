DuScriptUI.String.ACTIVE_COMPOSITION = "Active composition";
DuScriptUI.String.ADJUSTMENT_LAYER = "Adjustment layer";
DuScriptUI.String.ALL_COMPOSITIONS = "All Compositions";
DuScriptUI.String.BEST_QUALITY = "Use best quality";
DuScriptUI.String.CLIP = "Clip";
DuScriptUI.String.COMPOSITION_SHORT = "Comp";
DuScriptUI.String.COMPOSITION = "Composition";
DuScriptUI.String.CONTINUOUS_RASTERIZATION =
  "Collapse transformation / Continuous rasterization";
DuScriptUI.String.CREATE_NULL_TIP = "Create a null object.";
DuScriptUI.String.CREATE_ADJUSTMENT_TIP = "Create an adjustment layer.";
DuScriptUI.String.CREATE_NULL_TIP = "Create a null object.";
DuScriptUI.String.CREATE_SHAPE_TIP = "Create a shape layer.";
DuScriptUI.String.CREATE_SOLID = "Create a solid layer.";
DuScriptUI.String.CURRENT_TIME = "Current time";
DuScriptUI.String.DRAFT_MODE = "Use draft mode";
DuScriptUI.String.EDIT_MODE = "Edit mode";
DuScriptUI.String.GROUP_NAME = "Group name";
DuScriptUI.String.GUIDE_LAYERS = "Guide layers";
DuScriptUI.String.IN_TIME = "In";
DuScriptUI.String.INVALID_PSEUDO_EFFECT =
  "Invalid pseudo effect file or match name.";
DuScriptUI.String.LAYERS = "Layers";
DuScriptUI.String.LOCK_LAYERS = "Lock layers";
DuScriptUI.String.LOCK_PROPERTIES = "Lock properties";
DuScriptUI.String.MAIN_NAME = "Main name";
DuScriptUI.String.MISSING_PSEUDO_EFFECT =
  "The pseudo effect file does not exist.";
DuScriptUI.String.NEW_VERSION_TITLE = "New version available";
DuScriptUI.String.NULL_LAYER = "Null";
DuScriptUI.String.OPEN_PREFS = "Open preferences";
DuScriptUI.String.OUT_TIME = "Out";
DuScriptUI.String.PROJECT = "Project";
DuScriptUI.String.PROPERTY = "Property";
DuScriptUI.String.RANGE = "Range";
DuScriptUI.String.RENDER = "Render";
DuScriptUI.String.SECONDARY_NAME = "Secondary name";
DuScriptUI.String.SELECTED_COMPOSITIONS = "Selected compositions";
DuScriptUI.String.SELECTED_LAYERS = "Selected layers";
DuScriptUI.String.SELECTED_PROPERTIES = "Selected properties";
DuScriptUI.String.SET_FRAME_BLENDING = "Set frame blending mode";
DuScriptUI.String.SHAPE_LAYER = "Shape";
DuScriptUI.String.SHOW_HIDE_LAYERS_TIP = "Show/Hide layers";
DuScriptUI.String.SHY_LAYERS = "Shy layers";
DuScriptUI.String.SOLID_LAYER = "Solid";
DuScriptUI.String.SOLO_LAYERS = "Toggle solo mode";
DuScriptUI.String.STAR = "Star";
DuScriptUI.String.TIME = "Time";
DuScriptUI.String.TOGGLE_3D_LAYER = "Toggle 3D layer mode";
DuScriptUI.String.TOGGLE_ADJUSTMENT_LAYER = "Toggle adjustment layer mode";
DuScriptUI.String.TOGGLE_AUDIO = "Toggle audio";
DuScriptUI.String.TOGGLE_EFFECTS = "Toggle effects";
DuScriptUI.String.TOGGLE_MOTION_BLUR = "Toggle motion blur";
DuScriptUI.String.LOCATOR = "Locator";

/**
 * Runs the installation wizard for the script (asks for files and network access, asks the language...).
 * @param {function} callback - The function to execute when ready.<br />
 * This function should be the one which loads the script.
 * @param {Panel|Window} [ui]	- A container to display the UI. A modal Dialog is created if omitted
 * @param {string} [scriptName=DuESF.scriptName] - The name of the script, used in the UI.
 * @param {boolean} [reInit=false] - Set to true to display to prompt to reinit/reinstall the script below the button to ask for file access.
 * @param {function} [reInitMethod] - A function to run in order to reinit/reinstall the script as soon as we get file access, before running the callback
 */
DuScriptUI.setupScript = function (
  callback,
  ui,
  scriptName,
  reInit,
  reInitMethod,
) {
  function version() {
    DuScriptUI.checkUpdate(callback, ui);
  }

  function language() {
    DuScriptUI.askLanguage(version, ui);
  }
};

/**
 * @class
 * @name DuAELayerSelector
 * @classdesc For use with {@link DuScriptUI}.<br />
 * A drop down selector.<br />
 * This is not a real class, and cannot be instanciated.<br />
 * Use {@link DuScriptUI.layerSelector} to create a Selector.<br />
 * The Selector inherits the Group object from ScriptUI and has all of its properties and methods.
 * @property {int} [index=0]  - The current layer index, 0 if None
 * @property {CompItem|null} [comp=null] - The composition linked to the selector.<br />
 * If set to null, the seletor will use the current active composition.
 * @property {boolean} [selectedOnly=false] - True to list only selected layers in the composition
 * @property {Selector~onChange} onChange  - The function to execute when the index changes.<br />
 * You can set your own function here, which must take no argument.<br />
 * The method is called after the index has changed.
 * @category DuScriptUI
 */

/**
 * The function to execute when the index changes.<br />
 * The method is called after the index has changed.
 * @callback DuAELayerSelector~onChange
 * @memberof DuAELayerSelector
 */

/**
 * Changes the selection and the current layer index of the selector
 * @method
 * @memberof DuAELayerSelector
 * @name setCurrentIndex
 * @param {int} index - The new layer index
 */

/**
 * Force the refresh of the layer list
 * @method
 * @memberof DuAELayerSelector
 * @name refresh
 */

/**
 * Creates a drop down selector for layers
 * @param {Window|Panel|Group} container - The ScriptUI Object which will contain and display the selector.
 * @param {string} [helpTip=""] - The help tip.
 * @return {DuAELayerSelector} - The selector
 */
DuScriptUI.layerSelector = function (container, helpTip) {
  helpTip = def(helpTip, "");

  //create main group
  var selector = container.add("group");
  selector.orientation = "row";
  selector.spacing = 0;
  selector.alignment = ["fill", "top"];
  selector.alignChildren = ["center", "center"];

  selector.mainGroup = selector.add("group");
  selector.mainGroup.orientation = "row";
  selector.mainGroup.margins = 1;
  selector.mainGroup.alignment = ["fill", "fill"];
  selector.mainGroup.alignChildren = ["center", "center"];
  selector.helpTip = helpTip;
  DuScriptUI.setBackgroundColor(selector.mainGroup, DuColor.Color.TRANSPARENT);

  //init
  selector.index = 0;
  selector.comp = null;
  selector.selectedOnly = false;
  selector.pauseRefresh = false;

  selector.fillerL = selector.mainGroup.add("statictext", undefined, " ");
  selector.fillerL.alignment = ["left", "fill"];
  selector.fillerL.size = [5, -1];

  //the menu button
  selector.menuButton = selector.mainGroup.add(
    "image",
    undefined,
    w12_layers.binAsString,
  );
  selector.menuButton.alignment = ["left", "center"];
  selector.menuButton.helpTip = helpTip;

  //the text
  selector.label = selector.mainGroup.add("statictext", undefined, "");
  selector.label.helpTip = "";
  selector.label.alignment = ["fill", "center"];
  selector.label.helpTip = helpTip;
  DuScriptUI.setTextColor(selector.label, DuColor.Color.APP_TEXT_COLOR);

  //create popup
  selector.popup = new Window("palette", "", undefined, {
    borderless: true,
  });
  selector.popup.margins = 2;
  selector.popup.spacing = 0;
  selector.popup.closeButton = DuScriptUI.button(
    selector.popup,
    i18n._("Cancel"),
  );
  selector.popup.closeButton.onClick = selector.popup.onDeactivate =
    function () {
      selector.popup.hide();
    };
  selector.popup.buttons = selector.popup.add("group");
  selector.popup.buttons.orientation = "column";
  selector.popup.buttons.margins = 0;
  selector.popup.buttons.spacing = 0;
  selector.popup.hide();

  selector.popup.list = selector.popup.add("listbox", undefined);

  selector.clicked = function (e) {
    selector.refresh();

    if (e.ctrlKey && DuSystem.win) {
      selector.setCurrentIndex(0);
      return;
    }
    if (e.metaKey && DuSystem.mac) {
      selector.setCurrentIndex(0);
      return;
    }

    selector.popup.list.minimumSize.width =
      selector.popup.list.maximumSize.width = selector.size.width;
    selector.popup.list.minimumSize.height =
      selector.popup.list.maximumSize.height = selector.size.height * 10;

    selector.popup.layout.layout();
    selector.popup.layout.resize();

    var x = e.screenX - e.clientX;
    var y = e.screenY - e.clientY;
    selector.popup.location = [x, y];

    selector.popup.show();
  };

  //the pick button
  selector.pickGroup = selector.add("group");
  selector.pickGroup.margins = 0;
  selector.pickGroup.alignment = ["right", "fill"];
  selector.pickButton = selector.pickGroup.add(
    "image",
    undefined,
    w12_eye_dropper.binAsString,
  );
  selector.pickButton.alignment = ["center", "center"];

  selector.popup.list.add("item", i18n._p("Select", "None"));
  selector.popup.list.selection = 0;

  selector.refresh = function () {
    var comp = selector.comp;
    if (!comp) comp = DuAEProject.getActiveComp();
    if (!comp) return;

    selector.pauseRefresh = true;

    var layers;
    if (selector.selectedOnly) {
      layers = DuAELayer.sortByIndex(comp.selectedLayers);
    } else layers = comp.layers;

    var prevIndex = selector.index;
    selector.popup.list.removeAll();
    selector.popup.list.add("item", i18n._p("Select", "None"));
    var it = new DuList(layers);
    it.do(function (layer) {
      if (layer)
        selector.popup.list.add("item", layer.index + " | " + layer.name);
    });
    selector.setCurrentIndex(prevIndex, true);

    selector.pauseRefresh = false;
  };

  selector.setCurrentIndex = function (index, quiet) {
    quiet = def(quiet, false);

    if (index < 0) return;

    selector.pauseRefresh = true;

    var found = false;

    if (index > 0) {
      for (var i = 0, num = selector.popup.list.items.length; i < num; i++) {
        var t = selector.popup.list.items[i].text;
        var info = t.split(" | ");
        var idx = parseInt(info[0]);
        if (index == idx) {
          selector.label.text = t;
          selector.popup.list.selection = i;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      selector.popup.list.selection = 0;
      selector.label.text = i18n._p("Select", "None");
    }

    selector.index = index;
    selector.pauseRefresh = false;

    if (!quiet) selector.onChange();
  };

  selector.popup.list.onChange = function () {
    if (selector.pauseRefresh) return;
    var t = selector.popup.list.selection.text;
    var index = parseInt(t.split(" | ")[0]);
    selector.setCurrentIndex(index);
    selector.popup.hide();
  };

  //mouse over
  selector.highlight = function (e) {
    e.stopPropagation();
    DuScriptUI.dimControls();
    DuScriptUI.setBackgroundColor(
      selector.mainGroup,
      DuColor.Color.APP_HIGHLIGHT_COLOR.darker(),
    );
    DuScriptUI.highlightedControls.push(selector);
  };

  selector.pickHighlight = function (e) {
    e.stopPropagation();
    DuScriptUI.dimControls();
    DuScriptUI.setBackgroundColor(
      selector.pickGroup,
      DuColor.Color.APP_HIGHLIGHT_COLOR.darker(),
    );
    DuScriptUI.highlightedControls.push(selector);
  };

  selector.dim = function (e) {
    DuScriptUI.setBackgroundColor(
      selector.mainGroup,
      DuColor.Color.TRANSPARENT,
    );
    DuScriptUI.setBackgroundColor(
      selector.pickGroup,
      DuColor.Color.TRANSPARENT,
    );
  };

  selector.pick = function () {
    var layers = DuAEComp.getSelectedLayers();
    if (layers.length > 0) selector.setCurrentIndex(layers[0].index);
  };

  selector.getLayer = function () {
    if (selector.index < 1) return null;
    var comp = selector.comp;
    if (!comp) comp = DuAEProject.getActiveComp();
    if (!comp) return null;
    try {
      return comp.layer(selector.index);
    } catch (e) {
      DuDebug.throwError(
        "Layer selection error.",
        "DuAELayerSelector.getLayer",
        e,
      );
    }
  };

  selector.mainGroup.addEventListener("mouseover", selector.highlight);
  selector.pickButton.addEventListener("mouseover", selector.pickHighlight);
  selector.pickGroup.addEventListener("mouseover", selector.pickHighlight);

  selector.pickButton.addEventListener("click", selector.pick);
  selector.mainGroup.addEventListener("click", selector.clicked, true);

  selector.onChange = function () {};

  selector.refresh();

  selector.setCurrentIndex(0);

  return selector;
};

/**
 * @class
 * @name DuAECompSelector
 * @classdesc For use with {@link DuScriptUI}.<br />
 * A drop down selector.<br />
 * This is not a real class, and cannot be instanciated.<br />
 * Use {@link DuScriptUI.compSelector} to create a Selector.<br />
 * The Selector inherits the Group object from ScriptUI and has all of its properties and methods.
 * @property {int} [id=0]  - The current compitem id, 0 if None
 * @property {CompItem[]} [comps] - The compositions listed in the selector.
 * @property {Selector~onChange} onChange  - The function to execute when the index changes.<br />
 * You can set your own function here, which must take no argument.<br />
 * The method is called after the index has changed.
 * @property {Selector~filterComps} filterComps - A function which gets the comps to set in the selector.<br />
 * The default function will get all the comps in the project,<br />
 * You can set your own function here, which must take no argument.<br />
 * The function must return an array of CompItem.
 * @category DuScriptUI
 */

/**
 * The function to execute when the index changes.<br />
 * The method is called after the index has changed.
 * @callback DuAECompSelector~onChange
 * @memberof DuAECompSelector
 */

/**
 * A function which gets the comps to set in the selector.<br />
 * The default function will get all the comps in the project,<br />
 * assign another function to this callback if you need to filter these comps.<br />
 * The function must return an array of CompItem.
 * @callback DuAECompSelector~filterComps
 * @memberof DuAECompSelector
 * @return {CompItem[]} The compositions to set in the selector.
 */

/**
 * Changes the selection and the current comp id of the selector
 * @method
 * @memberof DuAECompSelector
 * @name setCurrentId
 * @param {int} index - The new comp id
 */

/**
 * Refreshes the comp list
 * @method
 * @memberof DuAECompSelector
 * @name refresh
 * @param {CompItem[]} [comps] - The list of compositions. By default, will use {@link DuAECompSelector.filterComps()} to get the comps.
 */

/**
 * Gets the selected comp
 * @method
 * @memberof DuAECompSelector
 * @name getComp
 * @return {CompItem|null} the selected comp
 */

/**
 * Creates a drop down selector for compositions
 * @param {Window|Panel|Group} container - The ScriptUI Object which will contain and display the selector.
 * @param {string} [helpTip=""] - The help tip.
 * @return {DuAECompSelector} - The selector
 */
DuScriptUI.compSelector = function (container, helpTip) {
  helpTip = def(helpTip, "");

  //create main group
  var selector = container.add("group");
  selector.orientation = "row";
  selector.spacing = 0;
  selector.alignment = ["fill", "top"];
  selector.alignChildren = ["center", "center"];

  selector.mainGroup = selector.add("group");
  selector.mainGroup.orientation = "row";
  selector.mainGroup.margins = 1;
  selector.mainGroup.alignment = ["fill", "fill"];
  selector.mainGroup.alignChildren = ["center", "center"];
  selector.helpTip = helpTip;
  DuScriptUI.setBackgroundColor(selector.mainGroup, DuColor.Color.TRANSPARENT);

  //init
  selector.id = 0;
  selector.comp = null;
  selector.selectedOnly = false;
  selector.pauseRefresh = false;

  selector.fillerL = selector.mainGroup.add("statictext", undefined, " ");
  selector.fillerL.alignment = ["left", "fill"];
  selector.fillerL.size = [5, -1];

  //the menu button
  selector.menuButton = selector.mainGroup.add(
    "image",
    undefined,
    w12_comp.binAsString,
  );
  selector.menuButton.alignment = ["left", "center"];
  selector.menuButton.helpTip = helpTip;

  //the text
  selector.label = selector.mainGroup.add("statictext", undefined, "");
  selector.label.helpTip = "";
  selector.label.alignment = ["fill", "center"];
  selector.label.helpTip = helpTip;
  DuScriptUI.setTextColor(selector.label, DuColor.Color.APP_TEXT_COLOR);

  //create popup
  selector.popup = new Window("palette", "", undefined, {
    borderless: true,
  });
  selector.popup.margins = 2;
  selector.popup.spacing = 0;
  selector.popup.closeButton = DuScriptUI.button(
    selector.popup,
    i18n._("Cancel"),
  );
  selector.popup.closeButton.onClick = selector.popup.onDeactivate =
    function () {
      selector.popup.hide();
    };
  selector.popup.buttons = selector.popup.add("group");
  selector.popup.buttons.orientation = "column";
  selector.popup.buttons.margins = 0;
  selector.popup.buttons.spacing = 0;
  selector.popup.hide();

  selector.popup.list = selector.popup.add("listbox", undefined);

  selector.clicked = function (e) {
    selector.refresh();

    if (e.ctrlKey && DuSystem.win) {
      selector.setCurrentId(0);
      return;
    }

    if (e.metaKey && DuSystem.mac) {
      selector.setCurrentId(0);
      return;
    }

    selector.popup.list.minimumSize.width =
      selector.popup.list.maximumSize.width = selector.size.width;
    selector.popup.list.minimumSize.height =
      selector.popup.list.maximumSize.height = selector.size.height * 10;

    selector.popup.layout.layout();
    selector.popup.layout.resize();

    var x = e.screenX - e.clientX;
    var y = e.screenY - e.clientY;
    selector.popup.location = [x, y];

    selector.popup.show();
  };

  //the pick button
  selector.pickGroup = selector.add("group");
  selector.pickGroup.margins = 0;
  selector.pickGroup.alignment = ["right", "fill"];
  selector.pickButton = selector.pickGroup.add(
    "image",
    undefined,
    w12_eye_dropper.binAsString,
  );
  selector.pickButton.alignment = ["center", "center"];

  var itemNone = selector.popup.list.add("item", i18n._p("Select", "None"));
  itemNone.id = 0;
  selector.popup.list.selection = 0;

  selector.refresh = function () {
    var comps = selector.filterComps();
    selector.pauseRefresh = true;

    var prevId = selector.id;
    selector.popup.list.removeAll();
    var itemNone = selector.popup.list.add("item", i18n._p("Select", "None"));
    itemNone.id = 0;
    var it = new DuList(comps);
    it.do(function (comp) {
      var item = selector.popup.list.add("item", comp.name);
      item.id = comp.id;
    });
    selector.setCurrentId(prevId, true);

    selector.pauseRefresh = false;
  };

  selector.getComp = function () {
    if (selector.id == 0) return null;
    return DuAEProject.getItemById(selector.id);
  };

  selector.setCurrentId = function (id, quiet) {
    quiet = def(quiet, false);

    if (id < 0) id = 0;

    selector.pauseRefresh = true;

    var found = false;

    if (id > 0) {
      for (var i = 0, num = selector.popup.list.items.length; i < num; i++) {
        var item = selector.popup.list.items[i];
        if (id == item.id) {
          selector.popup.list.selection = i;
          selector.label.text = selector.popup.list.selection.text;
          found = true;
          break;
        }
      }
    }

    if (!found) {
      selector.popup.list.selection = 0;
      selector.label.text = i18n._p("Select", "None");
    }

    selector.id = id;

    selector.pauseRefresh = false;

    if (!quiet) selector.onChange();
  };

  selector.popup.list.onChange = function () {
    if (selector.pauseRefresh) return;
    selector.setCurrentId(selector.popup.list.selection.id);
    selector.popup.hide();
  };

  //mouse over
  selector.highlight = function (e) {
    e.stopPropagation();
    DuScriptUI.dimControls();
    DuScriptUI.setBackgroundColor(
      selector.mainGroup,
      DuColor.Color.APP_HIGHLIGHT_COLOR.darker(),
    );
    DuScriptUI.highlightedControls.push(selector);
  };

  selector.pickHighlight = function (e) {
    e.stopPropagation();
    DuScriptUI.dimControls();
    DuScriptUI.setBackgroundColor(
      selector.pickGroup,
      DuColor.Color.APP_HIGHLIGHT_COLOR.darker(),
    );
    DuScriptUI.highlightedControls.push(selector);
  };

  selector.dim = function (e) {
    DuScriptUI.setBackgroundColor(
      selector.mainGroup,
      DuColor.Color.TRANSPARENT,
    );
    DuScriptUI.setBackgroundColor(
      selector.pickGroup,
      DuColor.Color.TRANSPARENT,
    );
  };

  selector.pick = function () {
    var comp = DuAEProject.getActiveComp();
    if (comp) selector.setCurrentId(comp.id);
  };

  selector.mainGroup.addEventListener("mouseover", selector.highlight);
  selector.pickButton.addEventListener("mouseover", selector.pickHighlight);
  selector.pickGroup.addEventListener("mouseover", selector.pickHighlight);

  selector.mainGroup.addEventListener("click", selector.clicked, true);
  selector.pickButton.addEventListener("click", selector.pick);

  selector.onChange = function () {};

  selector.filterComps = function () {
    var comps = DuAEProject.getComps();
    return comps;
  };

  selector.refresh();

  selector.setCurrentId(0);

  return selector;
};

/**
 * @class
 * @name DuAELayerPicker
 * @classdesc For use with {@link DuScriptUI}.<br />
 * A picker for layers with labels.<br />
 * This is not a real class, and cannot be instanciated.<br />
 * Use {@link DuScriptUI.layerPicker} to create a picker.<br />
 * The picker inherits the Group object from ScriptUI and has all of its properties and methods.
 * @property {DuAELayerSelector[]} selectors  - The layer selectors
 * @property {string[]} inputs - The labels texts
 * @category DuScriptUI
 */

/**
 * Empties the DuAELayerPicker
 * @method
 * @memberof DuAELayerPicker
 * @name removeAll
 */

/**
 * Adds a new line on the DuAELayerPicker
 * @method
 * @memberof DuAELayerPicker
 * @name addSelector
 * @param {string} name The display name of the selector.
 * @return {DuAELayerSelector} The added DuAELayerSelector
 */

/**
 * Creates a two-column group to allow the user to pick layers
 * @param {Window|Panel|Group} container - The ScriptUI Object which will contain and display the selector.
 * @return {DuAELayerPicker} The picker.
 */
DuScriptUI.layerPicker = function (container) {
  var name = i18n._("Select layers");

  var layerPicker = container.add("group");
  layerPicker.orientation = "row";
  layerPicker.margins = 0;
  layerPicker.spacing = 2;
  layerPicker.alignment = ["fill", "top"];

  layerPicker.labelsGroup = layerPicker.add("group");
  layerPicker.labelsGroup.orientation = "column";
  layerPicker.labelsGroup.margins = 0;
  layerPicker.labelsGroup.spacing = 2;
  layerPicker.labelsGroup.alignment = ["left", "fill"];
  layerPicker.labelsGroup.alignChildren = ["left", "fill"];

  layerPicker.selectorsGroup = layerPicker.add("group");
  layerPicker.selectorsGroup.orientation = "column";
  layerPicker.selectorsGroup.margins = 0;
  layerPicker.selectorsGroup.spacing = 2;
  layerPicker.selectorsGroup.alignment = ["fill", "fill"];

  layerPicker.selectors = [];
  layerPicker.inputs = [];

  layerPicker.removeAll = function () {
    layerPicker.selectors = [];
    layerPicker.inputs = [];
    for (var i = layerPicker.labelsGroup.children.length - 1; i >= 0; i--) {
      layerPicker.labelsGroup.remove(layerPicker.labelsGroup.children[i]);
      layerPicker.selectorsGroup.remove(layerPicker.selectorsGroup.children[i]);
    }
  };

  layerPicker.addSelector = function (inputLabel) {
    var l = layerPicker.labelsGroup.add("statictext", undefined, inputLabel);

    var sel = DuScriptUI.layerSelector(layerPicker.selectorsGroup);
    layerPicker.selectors.push(sel);
    sel.alignment = ["fill", "fill"];

    //l.minimumSize.height = l.maximumSize.height = 18;

    return sel;
  };

  return layerPicker;
};

/**
 * @class
 * @name DuAELayerPickerDialog
 * @classdesc For use with {@link DuScriptUI}.<br />
 * A picker for layers with labels.<br />
 * This is not a real class, and cannot be instanciated.<br />
 * Use {@link DuScriptUI.layerPickerDialog} to create a picker.<br />
 * The picker inherits the Group object from ScriptUI and has all of its properties and methods.
 * @property {DuAELayerPicker} layerPicker The layer picker inside the dialog.
 * @property {bool} accepted This property is true if the user has clicked the OK button, false otherwise.
 * @category DuScriptUI
 */

/**
 * Empties the DuAELayerPicker<br />
 * This is a convenience function equivalent to {@link DuAELayerPickerDialog.layerPicker.removeAll}.
 * @method
 * @memberof DuAELayerPickerDialog
 * @name removeAll
 */

/**
 * Adds a new line on the DuAELayerPicker
 * This is a convenience function equivalent to {@link DuAELayerPickerDialog.layerPicker.addSelector}.
 * @method
 * @memberof DuAELayerPickerDialog
 * @name addSelector
 * @return {DuAELayerSelector} The added DuAELayerSelector
 */

/**
 * Gets the layers picked by the user.
 * @method
 * @memberof DuAELayerPickerDialog
 * @name getLayers
 * @return {Layer[]} The layers picked (null if the user has set none in the selector), in the display order.
 */

/**
 * The function called when the dialog is accepted.
 * @callback DuAELayerPickerDialog~onAccept
 * @memberof DuAELayerPickerDialog
 */

/**
 * Creates a dialog with a DuAELayerPicker<br />
 * Use {@link DuScriptUI.showUI} to show it after creation.
 * @param {string} title - The title of the dialog.
 * @return {DuAELayerPickerDialog} The dialog window.
 */
DuScriptUI.layerPickerDialog = function (title) {
  var dialog = new Window("palette", title, undefined, {
    resizeable: true,
  });
  dialog.minimumSize.width = 300;

  dialog.margins = 0;
  dialog.orientation = "column";

  dialog.layerPicker = DuScriptUI.layerPicker(dialog);

  dialog.onAccept = function () {};
  dialog.removeAll = dialog.layerPicker.removeAll;
  dialog.addSelector = dialog.layerPicker.addSelector;
  dialog.getLayers = function () {
    var layers = [];
    for (var i = 0, num = dialog.layerPicker.selectors.length; i < num; i++) {
      var sel = dialog.layerPicker.selectors[i];
      layers.push(sel.getLayer());
    }
    return layers;
  };

  dialog.accepted = false;

  //add buttons
  var validGroup = dialog.add("group");
  validGroup.alignment = ["fill", "bottom"];
  var validGroupCancelButton = DuScriptUI.button(
    validGroup,
    "Cancel",
    DuScriptUI.Icon.BACK,
    "Cancel",
  );
  var validGroupValidButton = DuScriptUI.button(
    validGroup,
    "OK",
    DuScriptUI.Icon.CHECK,
    "OK",
  );

  validGroupValidButton.onClick = function () {
    dialog.accepted = true;
    dialog.hide();
    dialog.onAccept();
  };
  validGroupCancelButton.onClick = function () {
    dialog.hide();
  };

  return dialog;
};

DuScriptUI.refreshPanel = function (panel, scriptFile) {
  var ok = DuScriptUI.refreshWindow(panel, scriptFile);
  if (ok) return true;
  if (panel instanceof Panel && scriptFile.exists) {
    var scriptName = DuPath.getName(scriptFile);
    // Close
    DuAE.openScriptUIPanel(scriptName);
    // Open
    DuAE.openScriptUIPanel(scriptName);
    return true;
  }
  return false;
};

/**
 * Creates a selector to choose a selection mode
 * @param {DuAE.SelectionMode} [minimalMode=DuAE.SelectionMode.SELECTED_PROPERTIES] The lowest mode to use
 * @return {DuSelector} The selector
 */
DuScriptUI.selectionModeSelector = function (container, minimalMode) {
  minimalMode = def(minimalMode, DuAE.SelectionMode.SELECTED_PROPERTIES);
  var selector = DuScriptUI.selector(container);
  if (minimalMode <= DuAE.SelectionMode.SELECTED_PROPERTIES)
    selector.addButton(i18n._("Selected properties"), w16_selected_props);
  if (minimalMode <= DuAE.SelectionMode.SELECTED_LAYERS)
    selector.addButton(i18n._("Selected layers"), w16_selected_layers);
  if (minimalMode <= DuAE.SelectionMode.ACTIVE_COMPOSITION)
    selector.addButton(i18n._("Active composition"), w16_layers);
  if (minimalMode <= DuAE.SelectionMode.SELECTED_COMPOSITIONS)
    selector.addButton(
      i18n._("Selected compositions"),
      w16_selected_compositions,
    );
  if (minimalMode <= DuAE.SelectionMode.ALL_COMPOSITIONS)
    selector.addButton(i18n._("All compositions"), w16_compositions);

  return selector;
};
