/**
 * Render Queue methods
 * @namespace
 * @category DuAEF
 */
var DuAERenderQueue = {};

/**
 * Checks if the given template is installed
 * @param {string} templateName The name of the template
 * @return {Boolean} true if the template is available
 */
DuAERenderQueue.hasRenderSettingsTemplate = function (templateName) {
  // create fake comp to get templates
  var tempComp = app.project.items.addComp("DuAEF Temp", 4, 4, 1, 1, 24);
  var tempItem = app.project.renderQueue.items.add(tempComp);
  var itemTemplates = tempItem.templates;
  for (var i = 0, num = itemTemplates.length; i < num; i++) {
    if (itemTemplates[i] == templateName) {
      tempComp.remove();
      return true;
    }
  }
  tempComp.remove();
  return false;
};

/**
 * Checks if the given template is installed
 * @param {string} templateName The name of the template
 * @return {Boolean} true if the template is available
 */
DuAERenderQueue.hasOutputModuleTemplate = function (templateName) {
  // create fake comp to get templates
  var tempComp = app.project.items.addComp("DuAEF Temp", 4, 4, 1, 1, 24);
  var tempItem = app.project.renderQueue.items.add(tempComp);
  var omTemplates = tempItem.outputModule(1).templates;
  for (var i = 0, num = omTemplates.length; i < num; i++) {
    if (omTemplates[i] == templateName) {
      tempComp.remove();
      return true;
    }
  }
  tempComp.remove();
  return false;
};
