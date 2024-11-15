/* License
	DuAEF - Duduf After Effects Framework

	Copyright (c) 2008 - 2021 Nicolas Dufresne, RxLaboratory

	https://RxLaboratory.org

	This file is part of DuAEF.

		DuAEF is free software: you can redistribute it and/or modify
		it under the terms of the GNU General Public License as published by
		the Free Software Foundation, either version 3 of the License, or
		(at your option) any later version.

		DuAEF is distributed in the hope that it will be useful,
		but WITHOUT ANY WARRANTY; without even the implied warranty of
		MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
		GNU General Public License for more details.

		You should have received a copy of the GNU General Public License
		along with DuAEF. If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * The Duduf After Effects ExtendScript Framework.<br />
 * by {@link https://RxLaboratory.org RxLaboratory} and {@link http://duduf.com Duduf}.
 * @example
 * // Encapsulate everything to avoid global variables!
 * // The parameter is either undefined (stand alone script) or the panel containing the ui (ScriptUI)
 * (function(thisObj)
 * {
 *      // Include the framework
 *      #include "DuAEF.jsxinc";
 *
 *      // Running the init() method of DuAEF is required to setup everything properly.
 *      DuAEF.init( "YourScriptName", "1.0.0", "YourCompanyName" );
 *
 *      // These info can be used by the framework to improve UX, but they're optional
 *      DuESF.chatURL = 'http://chat.rxlab.info'; // A link to a live-chat server like Discord or Slack...
 *      DuESF.bugReportURL = 'https://github.com/RxLaboratory/DuAEF_Dugr/issues/new/choose'; // A link to a bug report form
 *      DuESF.featureRequestURL = 'https://github.com/RxLaboratory/DuAEF_Dugr/issues/new/choose'; // A link to a feature request form
 *      DuESF.aboutURL = 'http://rxlaboratory.org/tools/dugr'; // A link to the webpage about your script
 *      DuESF.docURL = 'http://dugr.rxlab.guide'; // A link to the documentation of the script
 *      DuESF.scriptAbout = 'Duduf Groups: group After Effects layers!'; // A short string describing your script
 *      DuESF.companyURL = 'https://rxlaboratory.org'; // A link to your company's website
 *      DuESF.rxVersionURL = 'http://version.rxlab.io' // A link to an RxVersion server to check for updates
 *
 *      // Build your UI here, declare your methods, etc.
 *
 *      // This will be our main panel
 *      var ui = DuScriptUI.scriptPanel( thisObj, true, true, new File($.fileName) );
 *      ui.addCommonSettings(); // Automatically adds the language settings, location of the settings file, etc
 *
 *      DuScriptUI.staticText( ui.settingsGroup, "Hello world of settings!" ); // Adds a static text to the settings panel
 *      DuScriptUI.staticText( ui.mainGroup, "Hello worlds!" ); // Adds a static text to the main panel
 *
 *      // When you're ready to display everything
 *      DuScriptUI.showUI(ui);
 *
 *      // Note that if you don't have a UI or if you don't use DuScriptUI to show it,
 *      // you HAVE TO run this method before running any other function:
 *      // DuAEF.enterRunTime();
 *
 * })(this);
 * @namespace
 * @author Nicolas Dufresne and contributors
 * @copyright 2017 - 2023 Nicolas Dufresne, RxLaboratory
 * @version {duaefVersion}
 * @license GPL-3.0 <br />
 * DuAEF is free software: you can redistribute it and/or modify<br />
 * it under the terms of the GNU General Public License as published by<br />
 * the Free Software Foundation, either version 3 of the License, or<br />
 * (at your option) any later version.<br />
 *<br />
 * DuAEF is distributed in the hope that it will be useful,<br />
 * but WITHOUT ANY WARRANTY; without even the implied warranty of<br />
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the<br />
 * GNU General Public License for more details.<br />
 *<br />
 * You should have received a copy of the GNU General Public License<br />
 * along with DuAEF. If not, see {@link http://www.gnu.org/licenses/}.
 * @category DuAEF
 */
var DuAEF = {};
/**
 * The Current DuAEF Version
 * @readonly
 * @memberof DuAEF
 * @type {string}
 */
DuAEF.version = new DuVersion("{duaefVersion}");
/**
 * The current DuAEF File
 * @readonly
 * @memberof DuAEF
 * @type {File}
 */
DuAEF.file = new File($.fileName);

/**
 * This method has to be called once at the very beginning of the script, just after the inclusion of DuAEF <code>#include DuAEF.jsxinc</code>
 * @param {string} [scriptName="DuAEF"] - The name of your script, as it has to be displayed in the UI and the filesystem
 * @param {string} [scriptVersion="0.0.0"] - The version of your script, in the form "XX.XX.XX-Comment", for example "1.0.12-Beta". The "-Comment" part is optional.
 * @param {string} [companyName=""] - The name of the company/organization/author of the script.
 */
DuAEF.init = function (scriptName, scriptVersion, companyName) {
  DuESF.init(scriptName, scriptVersion, companyName);
  DuColor.Color.AE_DARK_GREY = DuAEUI.bgColor();
  DuColor.Color.APP_BACKGROUND_COLOR = DuAEUI.bgColor();
  DuColor.Color.APP_TEXT_COLOR = DuAEUI.textColor();
};

/**
 * This method has to be called once at the end of the script, when everything is ready and the main UI visible (after any prompt or setup during startup).
 */
DuAEF.enterRunTime = function () {
  DuESF.enterRunTime();
};

/**
 * A Global Object to share some Data with other scripts
 */
if (typeof $.global["DUAEF_DATA"] === "undefined") $.global["DUAEF_DATA"] = {};
