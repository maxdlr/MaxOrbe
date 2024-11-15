/**
 * After Effects project methods
 * @namespace
 * @category DuAEF
 */
var DuAEProject = {};

//undocumented flags
DuAEProject.progressMode = false;
DuAEProject.activeComp = null;
DuAEProject.progressComp = null;
DuAEProject.progressRestoreLayerControls = false;

/**
 * Sets the project in "waiting mode" to speed up things.
 * @param {Boolean} [inProgress=true] - True to set progress mode, false to stop it.
 * @param {Boolean} [showProgressBar=true] - Will show a nice progress bar if true
 * @param {Boolean} [askToHideLayerControls=false] - Will prompt the user to hide layer controls to improve performance.
 * @param {int[]} [eventCoordinates] - Provide the screen coordinates to center the progress bar and dialogs on the corresponding screen.
 * @return {Boolean} false if the user cancelled the process, true otherwise
 */
DuAEProject.setProgressMode = function (
  inProgress,
  showProgressBar,
  askToHideLayerControls,
  eventCoordinates,
) {
  inProgress = def(inProgress, true);
  showProgressBar = def(showProgressBar, true);
  askToHideLayerControls =
    def(askToHideLayerControls, false) &&
    !DuESF.scriptSettings.get("layerControlsDialogDisabled", false);
  eventCoordinates = def(eventCoordinates, null);

  // No change
  if (!inProgress && !DuAEProject.progressMode) return;

  // Set progress mode
  if (inProgress) {
    //if not already in progress, create temp comp etc
    if (!DuAEProject.progressMode) {
      // Hide layer controls
      // not anymore: the doc has to explain it's better to hide them
      // but to do it automatically we need a way to get the info to not
      // enable them if they're already hidden
      //DuAE.toggleLayerControls();

      // store the current comp
      DuAEProject.activeComp = DuAEProject.getActiveComp();

      if (askToHideLayerControls) {
        // Ask to hide layer controls
        var dialog = DuScriptUI.popUp("Hide layer controls", undefined, true);
        dialog.result = 0;
        dialog.content.add(
          "statictext",
          undefined,
          i18n._("You're starting a process which can take some time.") +
            "\n" +
            i18n._(
              "Hiding layer controls will improve performance a lot. Do you want to toggle layer controls now?",
            ) +
            "\n\n" +
            i18n._(
              "If layer controls are already hidden, you can ignore this.",
            ),
          { multiline: true },
        );
        var layerControlsAlertButton = DuScriptUI.checkBox(
          dialog.content,
          i18n._("Permanently disable this alert."),
          w16_dialog,
          i18n._(
            "You can disable this alert dialog from showing before long operations.\nLayer Controls state won't be changed.",
          ),
          i18n._("This alert will be disabled."),
          w16_no_dialog,
        );
        layerControlsAlertButton.onClick = function () {
          hideButton.enabled = !layerControlsAlertButton.checked;
        };
        var validButtons = DuScriptUI.group(dialog, "row");
        var cancelButton = DuScriptUI.button(validButtons, {
          text: i18n._("Cancel"),
          image: DuScriptUI.Icon.CLOSE,
        });
        cancelButton.onClick = function () {
          dialog.result = 0;
          dialog.close();
        };
        var ignoreButton = DuScriptUI.button(validButtons, {
          text: i18n._("Ignore"),
          image: DuScriptUI.Icon.NEXT,
        });
        ignoreButton.onClick = function () {
          dialog.result = 2;
          dialog.close();
        };
        var hideButton = DuScriptUI.button(validButtons, {
          text: i18n._("Hide layer controls"),
          image: DuScriptUI.Icon.CHECK,
        });
        hideButton.onClick = function () {
          dialog.result = 1;
          dialog.close();
        };

        // Center and show
        DuScriptUI.layout(dialog);
        if (eventCoordinates) {
          location = DuScriptUI.centerInScreen(
            eventCoordinates,
            dialog.frameSize,
          );
          dialog.location = location;
        }
        dialog.show();

        if (dialog.result == 0) return false;

        if (dialog.result == 1 && !layerControlsAlertButton.checked) {
          DuAE.toggleLayerControls();
          DuAEProject.progressRestoreLayerControls = true;
        } else {
          DuAEProject.progressRestoreLayerControls = false;
          if (layerControlsAlertButton.checked) {
            DuESF.scriptSettings.set("layerControlsDialogDisabled", true);
            DuESF.scriptSettings.save();
          }
        }

        delete dialog;
      }

      // Create a temp comp

      // Not reliable... Ae alwways gets back to the other comp

      /*DuAEProject.progressComp = app.project.items.addComp(i18n._("Magic is happening..."), 100, 100, 1, 1, 24);
            var viewer = DuAEProject.progressComp.openInViewer();
            if (viewer) {
                viewer.setActive();
                viewer.maximized = true;
                DuAE.toggleLayerControls();

                // Add an icon!
                var shape = DuAEProject.progressComp.layers.addShape();
                DuAELayer.applyPreset(shape, preset_magic.toFile());
                shape.selected = false;
            }*/
    }

    if (showProgressBar) {
      DuScriptUI.progressBar.reset();
      DuScriptUI.progressBar.show("", eventCoordinates);
    }

    DuAEProject.progressMode = true;
  } else {
    // Show layer controls
    //DuAE.toggleLayerControls();

    DuAEProject.progressMode = false;

    /*if (DuAEProject.progressComp) {
            DuAEProject.progressComp.remove();
            DuAEProject.progressComp = null;
        }*/

    if (DuAEProject.activeComp) {
      var viewer = DuAEProject.activeComp.openInViewer();
      viewer.setActive();
    }

    if (DuAEProject.progressRestoreLayerControls) DuAE.toggleLayerControls();
    DuAEProject.progressRestoreLayerControls = false;

    if (showProgressBar) DuScriptUI.progressBar.close();
  }

  return true;
};

/**
 * Gets all compositions in the project (or only the root of the project, ignoring subfolders)
 * @param {boolean} [rootOnly=false] Set to true to get only comps from the root of the project
 * @return {CompItem[]} The compositions
 */
DuAEProject.getComps = function (rootOnly) {
  rootOnly = def(rootOnly, false);
  var comps = [];
  var it = new DuList(app.project.items);
  it.do(function (comp) {
    if (comp instanceof CompItem) {
      if (rootOnly && comp.parentFolder != app.project.rootFolder) return;
      comps.push(comp);
    }
  });
  return comps;
};

/**
 * Gets all selected compositions in the project
 * @return {CompItem[]} The compositions
 */
DuAEProject.getSelectedComps = function () {
  var selectedItems = app.project.selection;
  var comps = [];
  for (var i = 0, n = selectedItems.length; i < n; i++) {
    var item = selectedItems[i];
    if (item instanceof CompItem) comps.push(item);
  }
  return comps;
};

/**
 * Gets either the active comp or the first selected one
 * @return {CompItem|null} The composition
 */
DuAEProject.getSelectedComp = function () {
  var comp = DuAEProject.getActiveComp();
  if (!comp) {
    var items = app.project.selection;
    for (var i = 0; i < items.length; i++) {
      var c = items[i];
      if (c instanceof CompItem) {
        comp = c;
        break;
      }
    }
  }
  return comp;
};

/**
 * Runs a function on all comps of the project
 * @param {function} func The function, which must take a CompItem as its single argument.
 * @param {Boolean} [selectedOnly=false] Runs only on selected compositions
 */
DuAEProject.doComps = function (func) {
  // Get items
  var it = new DuList(app.project.items);
  it.do(function (item) {
    if (item instanceof CompItem) func(item);
  });
};

/**
 * Gets the After Effects current composition
 * @return {CompItem|null} The current composition or null if there's no current comp
 */
DuAEProject.getActiveComp = function () {
  if (DuAEProject.progressMode) return DuAEProject.activeComp;
  //activate the viewer first to try to get the opened composition
  if (app.activeViewer != null) {
    if (app.activeViewer.type == ViewerType.VIEWER_COMPOSITION)
      app.activeViewer.setActive();
  }
  var comp = app.project.activeItem;
  if (!comp) return null;
  if (!(comp instanceof CompItem)) return null;
  return comp;
};

/**
 * Retrieves an item by its Item ID
 * @return {Item|null} The item
 */
DuAEProject.getItemById = function (id) {
  if (DuAE.isVersionAtLeast("CC2014")) return app.project.itemByID(id);

  var it = new DuList(app.project.items);
  while ((item = it.next())) {
    if (item.id == id) return item;
  }
  return null;
};

/**
 * Retrieves the first item with the given name
 * @param {string} name The name to search
 * @param {FolderItem} [folder] A subfolder to search in
 * @return {Item|null} The item
 */
DuAEProject.getItemByName = function (name, folder) {
  var it;
  if (typeof folder !== "undefined") it = new DuList(folder.items);
  else it = new DuList(app.project.items);
  while ((item = it.next())) {
    if (item.name == name) return item;
  }
  return null;
};

/**
 * Generates a new unique name for a composition
 * @param {string} newName - The wanted new name
 * @param {CompItem} comp  - The comp
 * @param {boolean} [increment=true] - true to automatically increment the new name if it already ends with a digit
 * @return {string}	The unique name, with a new number at the end if needed.
 */
DuAEProject.newUniqueCompName = function (newName, increment) {
  increment = def(increment, true);
  var compNames = [];
  var it = new DuList(app.project.items);
  it.do(function (comp) {
    if (comp instanceof CompItem) compNames.push(comp.name);
  });
  return DuString.generateUnique(newName, compNames, increment);
};

/**
 * Checks if all comps have a different name.
 * @return {Object} The list of names used several times. Check the length attribute to know how many duplicates were found, loop through the keys to get the names. Eech key is an array containing the list of comps with that name.
 * @example
 * var dupes = DuAEProject.checkCompNames();
 * if (dupes.length != 0) {
 * for (name in dupes)
 * {
 *     if (dupes.hasOwnProperty(name)) alert(dupes[name]); //dupes[name] is an array of Layer
 * }
 * } */
DuAEProject.checkCompNames = function () {
  var duplicatedNames = {};
  duplicatedNames.length = 0;
  var compNames = {};
  var items = app.project.items;
  for (var i = 1, n = items.length; i <= n; i++) {
    var comp = items[i];
    if (comp instanceof CompItem) {
      var name = comp.name;
      if (duplicatedNames.hasOwnProperty(name)) {
        duplicatedNames[name].push(comp);
        continue;
      }
      if (compNames.hasOwnProperty(name)) {
        duplicatedNames[name] = [compNames[name], comp];
        duplicatedNames.length++;
        continue;
      }
      compNames[name] = comp;
    }
  }
  return duplicatedNames;
};

/**
 * Gets the size of the current project file
 * @return {int} the size in Bytes. -1 if it has not been saved yet.
 */
DuAEProject.getSize = function () {
  var file = app.project.file;
  if (!(file instanceof File)) return -1;
  if (!file.exists) return -1;
  else return file.length;
};

/**
 * The Expressions Engine setting in the Project Settings dialog box, as a string.
 * @return {string} One of: "extendscript", "javascript-1.0"
 */
DuAEProject.expressionEngine = function () {
  var engine = app.project.expressionEngine;
  if (!engine) engine = "extendscript";
  return engine;
};

/**
 * Makes sure all compositions in the project have unique names, renaming them if needed.
 * @param {Array|ItemCollection} [comps] A list of comps, all of them by default
 */
DuAEProject.setUniqueCompNames = function (comps) {
  comps = def(comps, DuAEProject.getComps());
  var it = new DuList(comps);
  it.do(function (comp) {
    //temporarily set another name to correctly generate a new unique name
    var oldName = comp.name;
    comp.name = "***Duik-temp-name-xxx***";
    comp.name = DuAEProject.newUniqueCompName(oldName);
    app.project.autoFixExpressions(oldName, comp.name);
  });
};

/**
 * Reduces the project using the selected compositions, the same way the native command does it, but being able to keep comps used only by expressions. If there's no comp selected, will use all comps at the root of the project.
 * @param {boolean} [keepExpressionOnly=true] Set to false to ignore comps used only by expressions (same as the native command)
 */
DuAEProject.reduceSelected = function (keepExpressionOnly) {
  var comps = [];
  for (var i = 0, num = app.project.selection.length; i < num; i++) {
    var item = app.project.selection[i];
    if (item instanceof CompItem) comps.push(item);
  }
  DuAEProject.reduce(comps, keepExpressionOnly);
};

/**
 * Reduces the project, the same way the native command does it, but being able to keep comps used only by expressions.
 * @param {CompItem|CompItem[]} [comps] The name or the id of the comp(s) to keep. If omitted, it will use all comps at the root of the project (the ones not in a subfolder).
 * @param {boolean} [keepExpressionOnly=true] Set to false to ignore comps used only by expressions (same as the native command)
 */
DuAEProject.reduce = function (comps, keepExpressionOnly) {
  keepExpressionOnly = def(keepExpressionOnly, true);
  comps = def(comps, DuAEProject.getComps(true));
  if (comps instanceof CompItem) comps = [comps];
  if (comps.length == 0) return;
  comps = new Dulist(comps);

  //consolidate footage
  app.project.consolidateFootage();

  //update cache before running
  DuAEProject.updateExpressionCache();

  for (i = app.project.numItems; i > 0; i--) {
    var item = app.project.item(i);
    //if it's one of the comp, ignore
    if (comps.indexOf(item, DuAEItem.compareItems) >= 0) continue;
    //if AVItem
    if (item instanceof CompItem || item instanceof FootageItem) {
      var usedIn = DuAEItem.usedIn(item, true, keepExpressionOnly);

      if (usedIn.length == 0) {
        item.remove();
        continue;
      }

      var remove = true;

      for (j = 0, num = usedIn.length; j < num; j++) {
        //if there's one of the comp to keep, do not remove
        if (comps.indexOf(usedIn[j], DuAEItem.compareItems) >= 0) {
          remove = false;
          break;
        }
      }

      if (remove) item.remove();
    }
    //remove folder if  empty
    else if (item.numItems == 0) item.remove();
  }
};

/**
 * Collects all dependencies in a folder
 * @param {Folder} [destination] The folder where to save the files. The project files will be collected in a subfolder called "project name.aep.archive" or "project name.aep.zip". If not provided, will use the current folder.
 * @param {boolean} [overwrite=false] Whether to overwrite existing footage in the destination.
 * @param {boolean} [zip=false] Set to true to automatically zip the archive.
 * @param {boolean} [createProjectFolder=true] Whether to create a folder for this project or use the destination as is.
 */
DuAEProject.collectFiles = function (
  destination,
  overwrite,
  zip,
  createProjectFolder,
) {
  var projectFile = app.project.file;

  var result = {};
  result.missingFootages = [];

  destination = def(destination, projectFile.parent);
  overwrite = def(overwrite, false);
  zip = def(zip, false);
  createProjectFolder = def(createProjectFolder, true);

  //create folder for the project
  var projectName = DuPath.getBasename(projectFile.name);
  var projectFolderPath = destination.absoluteURI;
  if (createProjectFolder) {
    projectFolderPath += "/" + projectName + ".archive";
  }
  var projectFolder = new Folder(projectFolderPath);
  var footageFolder = new Folder(projectFolder.absoluteURI + "/(Footage)/");
  projectFolder.create();
  footageFolder.create();

  //create report file
  var missingFootageString = "=== MISSING FOOTAGE ===\n\n";

  var currentFootageFolder = footageFolder;
  currentFootageFolder.id = -1;

  //for each item, copy and re-link
  for (var i = 1, num = app.project.numItems; i <= num; i++) {
    var item = app.project.item(i);

    //check if we're still in the right folder
    if (item.parentFolder.id != currentFootageFolder.id) {
      if (item.parentFolder == app.project.rootFolder) {
        currentFootageFolder = footageFolder;
      } else {
        currentFootageFolder = currentFootageFolder.parent;
      }
      currentFootageFolder.id = item.parentFolder.id;
    }

    if (item instanceof CompItem) continue;
    if (item instanceof FolderItem) {
      currentFootageFolder = new Folder(
        currentFootageFolder.absoluteURI + "/" + item.name,
      );
      currentFootageFolder.create();
      currentFootageFolder.id = item.id;
      continue;
    }

    //if no source file
    if (item.file == null) continue;
    //if missing source
    if (item.footageMissing) {
      missingFootageString += item.name + " @ " + item.file.fsName + "\n";
      result.missingFootages.push(item.file.fsName);
      continue;
    }

    //if this is not an image sequence
    if (!DuAEItem.isImageSequence(item)) {
      var newPath = currentFootageFolder.absoluteURI + "/" + item.file.name;
      var newFile = new File(newPath);
      //copy
      if ((newFile.exists && overwrite) || !newFile.exists)
        item.file.copy(newPath);
      //re-link
      item.replace(new File(newPath));
    } else {
      //get files and create a folder
      var sequenceFolder = item.file.parent;
      var frameSequence = sequenceFolder.getFiles();
      var sequenceFolderTarget = new Folder(
        currentFootageFolder.absoluteURI + "/" + sequenceFolder.name + "/",
      );
      sequenceFolderTarget.create();
      var newPath = sequenceFolderTarget.absoluteURI + "/" + item.file.name;
      var newFile = new File(newPath);

      //copy frames
      if ((newFile.exists && overwrite) || !newFile.exists) {
        for (var j = 0, numFrames = frameSequence.length; j < numFrames; j++) {
          var frame = frameSequence[j];
          if (frame instanceof Folder) continue;
          frame.copy(sequenceFolderTarget.absoluteURI + "/" + frame.name);
        }
      }

      //re-link
      item.replaceWithSequence(newFile, true);
    }
  }

  //sauvegarder le projet
  var newProjectFileName = DuPath.newUniqueName(
    app.project.file.name,
    projectFolder,
  );
  app.project.save(
    new File(projectFolder.absoluteURI + "/" + newProjectFileName),
  );

  //write report
  var reportFile = new File(
    projectFolder.absoluteURI + "/" + app.project.file.name + "_report.txt",
  );
  var report = app.project.file.name + "\n\n";
  report += missingFootageString;
  DuFile.write(reportFile, report);

  //ZIP
  if (zip) {
    app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
    app.open(projectFile);
    var zipFile = DuZip.compressFolderContent(
      projectFolder,
      projectName + ".zip",
      true,
    );
  }
};

/**
 * Replaces text in Expressions
 * @param {string} oldString - The string to replace
 * @param {string} newString - The new string
 * @param {boolean} [caseSensitive=true] - Whether the search has to be case sensitive
 */
DuAEProject.replaceInExpressions = function (
  oldString,
  newString,
  caseSensitive,
) {
  caseSensitive = def(caseSensitive, true);

  var re = new RegExp(DuRegExp.escape(oldString), caseSensitive ? "g" : "gi");

  DuAEExpression.doInExpresssions(function (e) {
    e.changed = re.test(e.expression);
    if (e.changed) e.expression = e.expression.replace(re, newString);
    return e;
  });
};

/**
 * Reimplements <code>app.project.autoFixExpressions()</code> because it does not work with some special characters.<br/>
 * Automatically replaces text found in broken expressions in the project, if the new text causes the expression to evaluate without errors.
 * @param {string} oldText The text to replace.
 * @param {string} newText The new text.
 */
DuAEProject.autoFixExpressions = function (oldText, newText) {
  var re = new RegExp(DuRegExp.escape(oldText), "g");

  DuAEExpression.doInExpresssions(
    function (e) {
      if (!e.inError) return e;
      e.changed = re.test(e.expression);
      if (e.changed) e.expression = e.expression.replace(re, newText);
      return e;
    },
    DuAE.SelectionMode.ALL_COMPOSITIONS,
    true,
    true,
    true,
  ); // Apply cache only if it doesn't generate an error
};

/**
 * Gets the unused footages.
 * @return {FootageItem[]} The list of unused items.
 */
DuAEProject.getUnusedFootages = function () {
  var unused = [];
  for (var i = 1, n = app.project.numItems; i <= n; i++) {
    var item = app.project.item(i);
    if (item instanceof FootageItem) {
      if (item.usedIn.length == 0) unused.push(item);
    }
  }
  return unused;
};

/**
 * Gets a folder with its name. If name is "Project Root" or empty, returns the root of the project.
 * @param {string} folderName The name of the folder.
 * @return {FolderItem|null} The folder or null if not found.
 */
DuAEProject.getFolderItem = function (folderName) {
  folderName = def(folderName, "");
  if (folderName == "") return app.project.rootFolder;
  if (DuString.trim(folderName) == "") return app.project.rootFolder;
  if (folderName.toLowerCase() == i18n._("Project Root").toLowerCase())
    return app.project.rootFolder;

  for (var i = 1, n = app.project.numItems; i <= n; i++) {
    var item = app.project.item(i);
    if (item instanceof FolderItem) {
      if (item.name == folderName) return item;
    }
  }

  return null;
};

/**
 * Gets the unused compositions, except the ones in the given folder.
 * @param {FolderItem} [folder] The folder to exclude.
 * @return {CompItem[]} The unused compositions
 */
DuAEProject.getUnusedComps = function (folder) {
  var comps = [];
  folder = def(folder, null);
  for (var i = 1, n = app.project.numItems; i <= n; i++) {
    var item = app.project.item(i);
    if (item instanceof CompItem) {
      if (item.usedIn.length == 0) {
        if (!folder) {
          comps.push(item);
          continue;
        }
        // If it's the root
        if (folder.id == app.project.rootFolder.id) {
          if (item.parentFolder.id != folder.id) comps.push(item);
          continue;
        }
        if (DuAEItem.isInFolder(item, folder)) continue;
        comps.push(item);
      }
    }
  }
  return comps;
};

/**
 * Gets all the precompositions located at the root of the project.
 * @return {CompItem[]}
 */
DuAEProject.getPrecompsAtRoot = function () {
  var precomps = [];
  for (var i = 1, n = app.project.numItems; i <= n; i++) {
    var item = app.project.item(i);
    if (item instanceof CompItem) {
      if (
        item.parentFolder.id == app.project.rootFolder.id &&
        item.usedIn.length != 0
      )
        precomps.push(item);
    }
  }
  return precomps;
};

/**
 * Gets the project name (i.e. the file name without extension)
 * @return {string} The project name.
 */
DuAEProject.name = function () {
  return DuPath.getBasename(app.project.file);
};

/**
 * Bakes the expressions to keyframes
 * @param {DuAEExpression.BakeAlgorithm} [mode=DuAEExpression.BakeAlgorithm.SMART] The algorithm to use for baking the expressions.
 * @param {float} [frameStep=1.0] By default, checks one value per keyframe. A lower value increases the precision and allows for sub-frame sampling. A higher value is faster but less precise.
 */
DuAEProject.bakeExpressions = function (mode, frameStep) {
  DuAEProject.doComps(function (comp) {
    DuAEComp.bakeExpressions(mode, frameStep, comp);
  });
};

/**
 * Bakes the expressions to keyframes
 * @param {DuAEExpression.BakeAlgorithm} [mode=DuAEExpression.BakeAlgorithm.SMART] The algorithm to use for baking the expressions.
 * @param {float} [frameStep=1.0] By default, checks one value per keyframe. A lower value increases the precision and allows for sub-frame sampling. A higher value is faster but less precise.
 */
DuAEProject.bakeCompositions = function (mode, frameStep) {
  DuAEProject.doComps(function (comp) {
    DuAEComp.bake(mode, frameStep, comp);
  });
};

/**
 * Checks if the project contains at least one composition.
 * @return {bool}
 */
DuAEProject.containsComp = function () {
  for (var i = 1, ni = app.project.items.length; i <= ni; i++) {
    if (app.project.item(i) instanceof CompItem) return true;
  }
  return false;
};
