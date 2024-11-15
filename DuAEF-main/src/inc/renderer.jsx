/**
 * Constructs a new DuAERenderer instance
 * @class DuAERenderer
 * @classdesc A class used to easily manage After Effects Renderer/RenderQueue
 * @param {string} [defaultOutputTemplate] The default output module template name to use when adding comp to the queue. Empty string to let default AE OM defaultOutputTemplate.
 * @param {PostRenderAction} [defaultPostRenderAction=PostRenderAction.NONE] The default PostRenderAction.
 * @category DuAEF
 */
function DuAERenderer(defaultOutputTemplate, defaultPostRenderAction) {
  /**
   * The default output module template name to use when adding comps to the queue. Empty string to let default AE OM defaultOutputTemplate.
   * @type {string}
   * @name defaultOutputTemplate
   * @memberof DuAERenderer
   */
  this.defaultOutputTemplate = def(defaultOutputTemplate, "");

  /**
   * The default PostRenderAction.
   * @type {PostRenderAction}
   * @name defaultPostRenderAction
   * @memberof DuAERenderer
   */
  this.defaultPostRenderAction = def(
    defaultPostRenderAction,
    PostRenderAction.NONE,
  );

  /**
   * The items in the queue
   * @type {DuAERendererItem[]}
   * @name items
   * @memberof DuAERenderer
   */
  this.items = [];

  this.rqItemsEnabled = [];

  // get aerender
  var aerenderBinName = "aerender";
  if (DuSystem.win) aerenderBinName += ".exe";

  /**
   * The After Effects command line renderer
   * @type {DuProcess}
   * @name aerender
   * @memberof DuAERenderer
   */
  this.aerender = new DuProcess(
    Folder.appPackage.absoluteURI + "/" + aerenderBinName,
    ["-continueOnMissingFootage"],
  );
}

/**
 * Adds a comp to the render queue
 * @memberof DuAERenderer
 * @param {CompItem}          comp              - The Composition to add
 * @param {string}            outputPath        - The output file path
 * @param {string}            [outputTemplate]    - Overrides the default output module template
 * @param {PostRenderAction}  [postRenderAction]  - Overrides the default PostRenderAction
 */
DuAERenderer.prototype.addComp = function (
  comp,
  outputPath,
  outputTemplate,
  postRenderAction,
) {
  outputTemplate = def(outputTemplate, this.defaultOutputTemplate);
  postRenderAction = def(postRenderAction, this.defaultPostRenderAction);
  var item = new DuAERendererItem(
    comp,
    outputPath,
    outputTemplate,
    postRenderAction,
  );
  this.items.push(item);
};

/**
 * Adds a DuAERendererItem to the After Effects renderQueue
 * @memberof DuAERenderer
 * @param {DuAERendererItem}          item              - The Item to add.
 * @return {RenderQueueItem}		The item created.
 */
DuAERenderer.prototype.addItemToAEQueue = function (item) {
  //add comp to render queue
  var rqItem = app.project.renderQueue.items.add(item.comp);
  var outputModule = rqItem.outputModule(1);
  //set output format
  outputModule.applyTemplate(item.outputTemplate);

  //set output file
  var outputFile = new File(item.outputPath);
  outputModule.file = outputFile;
  //set post render action
  outputModule.postRenderAction = item.postRenderAction;
  return rqItem;
};

/**
 * Renders a comp in background using aerender.exe
 * Automatically manages the existing After Effects render queue to leave it untouched.
 * The project will be saved.
 * @memberof DuAERenderer
 * @param {CompItem}          comp              - The Composition to render
 * @param {string}            outputPath        - The output file path
 * @param {string}            [outputTemplate]    - Overrides Durenderer.defaultOutputTemplate
 * @param {PostRenderAction}  [postRenderAction]  - Overrides DuAERenderer.defaultPostRenderAction
 */
DuAERenderer.prototype.backgroundRenderComp = function (
  comp,
  outputPath,
  outputTemplate,
  postRenderAction,
) {
  outputTemplate = def(outputTemplate, this.defaultOutputTemplate);
  postRenderAction = def(postRenderAction, this.defaultPostRenderAction);

  //disable existing items
  this.disableRqItems();
  if (!app.project.file) app.project.save();
  //launch
  var rqItem = this.addItemToAEQueue(
    new DuAERendererItem(comp, outputPath, outputTemplate, postRenderAction),
  );
  app.project.save();
  var newProjectName =
    app.project.file.fsName.replace(/\.aep$/gi, "") + "_DuRenderer.aep";
  //copy the project as a new file
  app.project.file.copy(newProjectName);

  //launch aerender.exe
  this.aerender.queue.push(["-project", newProjectName]);
  this.aerender.startQueue();

  rqItem.remove();
  this.enableRqItems();
  app.project.save();
};

/**
 * Renders a comp in After Effects
 * Automatically manages the existing After Effects render queue to leave it untouched.
 * @memberof DuAERenderer
 * @param {CompItem}          comp              - The Composition to render
 * @param {string}            outputPath        - The output file path
 * @param {string}            [outputTemplate]    - Overrides Durenderer.defaultOutputTemplate
 * @param {PostRenderAction}  [postRenderAction]  - Overrides DuAERenderer.defaultPostRenderAction
 */
DuAERenderer.prototype.renderComp = function (
  comp,
  outputPath,
  outputTemplate,
  postRenderAction,
) {
  outputTemplate = def(outputTemplate, this.defaultOutputTemplate);
  postRenderAction = def(postRenderAction, this.defaultPostRenderAction);

  //disable existing items
  this.disableRqItems();

  //launch
  var rqItem = this.addItemToAEQueue(
    new DuAERendererItem(comp, outputPath, outputTemplate, postRenderAction),
  );
  app.project.renderQueue.render();

  //remove item after render
  rqItem.remove();

  //enable existing items
  this.enableRqItems();
};

/**
 * Renders the queue in background using aerender.exe
 * Automatically manages the existing After Effects render queue to leave it untouched.
 * The project will be saved.
 * @memberof DuAERenderer
 */
DuAERenderer.prototype.backgroundRender = function () {
  //disable existing items
  this.disableRqItems();
  if (!app.project.file) app.project.save();

  var rqItems = [];
  var postProcesses = [];
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    //add comp to render queue
    var rqItem = this.addItemToAEQueue(item);
    rqItems.push(rqItem);
  }

  app.project.save();
  var newProjectName =
    app.project.file.fsName.replace(/\.aep$/gi, "") + "_Durenderer.aep";
  //copy the project as a new file
  app.project.file.copy(newProjectName);
  this.aerender.queue.push(["-project", newProjectName]);
  this.aerender.startQueue();

  this.items = [];

  //remove items
  for (var i = rqItems.length - 1; i >= 0; i--) {
    rqItems[i].remove();
  }

  //enable existing items
  this.enableRqItems();
  app.project.save();
};

/**
 * Renders the queue in After Effects
 * Automatically manages the existing After Effects render queue to leave it untouched.
 * @memberof DuAERenderer
 */
DuAERenderer.prototype.render = function () {
  //disable existing items
  this.disableRqItems();
  var rqItems = [];
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    //add comp to render queue
    var rqItem = this.addItemToAEQueue(item);
    rqItems.push(rqItem);
  }
  //render
  app.project.renderQueue.render();

  this.items = [];

  //remove items
  for (var i = rqItems.length - 1; i >= 0; i--) {
    rqItems[i].remove();
  }

  //enable existing items
  this.enableRqItems();
};

/**
 * Disables all current items in the AE renderQueue
 * You can re-enable them using DuAERenderer.enableRqItems()
 */
DuAERenderer.prototype.disableRqItems = function () {
  for (var i = 1; i <= app.project.renderQueue.numItems; i++) {
    var item = app.project.renderQueue.items[i];
    if (item.render) this.rqItemsEnabled.push(i);
    if (
      item.status != RQItemStatus.RENDERING &&
      item.status != RQItemStatus.DONE &&
      item.status != RQItemStatus.WILL_CONTINUE
    )
      item.render = false;
  }
};

/**
 * Enables all previously added Items in the AE renderQueue, if they were previously disabled by DuAERenderer.disableRqItems()
 */
DuAERenderer.prototype.enableRqItems = function () {
  //re-enable render queue
  for (var i = 0; i < this.rqItemsEnabled; i++) {
    var item = app.project.renderQueue.items[this.rqItemsEnabled[i]];
    item.render = true;
  }
};

/**
 * Constructs a new item to render
 * @class DuAERendererItem
 * @classdesc An item in the Durenderer queue
 * @param {CompItem}			comp				- The composition to render
 * @param {string}             [outputTemplate]       - The output module template name to use when adding comp to the queue. Empty string to let default AE OM defaultOutputTemplate.
 * @param {PostRenderAction}   [postRenderAction]     - The PostRenderAction.
 * @param {string}			outputPath			- The output file path.
 */
function DuAERendererItem(comp, outputPath, outputTemplate, postRenderAction) {
  /**
   * The composition to render
   * @type {CompItem}
   * @name comp
   * @memberof DuAERendererItem
   */
  this.comp = comp;
  /**
   * The output file path.
   * @type {string}
   * @name outputPath
   * @memberof DuAERendererItem
   */
  this.outputPath = outputPath;
  /**
   * The output module template name to use when adding comp to the queue. Empty string to let default AE OM defaultOutputTemplate.
   * @type {string}
   * @name outputTemplate
   * @memberof DuAERendererItem
   */
  this.outputTemplate = outputTemplate;
  /**
   * The PostRenderAction.
   * @type {PostRenderAction}
   * @name postRenderAction
   * @memberof DuAERendererItem
   */
  this.postRenderAction = postRenderAction;
}

/**
 * Loads the outputModules found in the project and recreates them to make them available in the current Ae installation
 * @static
 * @param {File|string} project - An After Effects project file containing one render queue item with the modules to load
 */
DuAERenderer.loadOutputModules = function (project) {
  if (!(project instanceof File)) project = new File(project);
  if (!project.exists) return;

  //import project
  var importedProject = app.project.importFile(new ImportOptions(project));

  //the last rqItem contains the modules
  var rqItem = app.project.renderQueue.item(app.project.renderQueue.numItems);

  //load modules
  for (var i = 1, num = rqItem.outputModules.length; i <= num; i++) {
    var om = rqItem.outputModule(i);
    var templateList = new DuList(om.templates);
    if (templateList.indexOf(om.name) < 0) om.saveAsTemplate(om.name);
  }

  //remove project
  importedProject.remove();
};
