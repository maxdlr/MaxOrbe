/**
 * Constructs a Pseudo Effect.
 * @class DuAEPseudoEffect
 * @classdesc Describes a pseudo effect
 * @param {DuBinary} binaryFile - The ffx file encoded as a {@link DuBinary}.<br />
 * Note that the pseudo effect's matchName <strong>must start with <code>"Pseudo/"</code></strong>.
 * @property {string} name The default (localized) name
 * @property {string} matchName The matchName
 * @property {boolean} valid * Will be false if the ffx can't be correctly parsed.<br />
 * Note that an invalid pseudo effect can still be applied (if the file exists), but the new effect may not be returned,<br />
 * or the {@link DuAEPseudoEffect.props} Object may be empty.
 * @property {File} file The ffx file.
 * @property {Object} props An object containing information about the properties of the effect, which can be used to generate expressions.<br />
 * Access properties with their names, using the group hierarchy.<br />
 * The info available for each property depends on the original pseudo effect, but there's at least the type and the index of the property.
 * @category DuAEF
 */
function DuAEPseudoEffect(binaryFile) {
  /**
   * Will be false if the ffx can't be correctly parsed.<br />
   * Note that an invalid pseudo effect can still be applied (if the file exists), but the new effect may not be returned,<br />
   * or the {@link DuAEPseudoEffect.index} Object may be empty.
   * @type {Boolean}
   * @name valid
   * @memberof DuAEPseudoEffect
   * @readonly
   */
  this.valid = true;

  // Get the matchname

  /**
   * The matchName
   * @type {string}
   * @name matchName
   * @memberof DuAEPseudoEffect
   * @readonly
   */
  this.matchName = "";
  // A RegEx to get the matchName
  var reMatchName = /\((Pseudo\/[a-z\s0-9.]+)-/gi;

  var matchMatchName = reMatchName.exec(binaryFile.binAsString);
  if (matchMatchName) {
    this.matchName = matchMatchName[1];
  }

  if (this.matchName == "") this.valid = false;

  // Get other infos

  /**
   * The default (localized) name
   * @type {string}
   * @name name
   * @memberof DuAEPseudoEffect
   * @readonly
   */
  this.name = "";

  // We need to get the JSON descriptive array
  // It can be stored either in a JSON object, or in an XML tag
  var reJSON = /{.*\"controlName\"\s*:\s*\"([^\n\r\"]+)\".*/gi;
  var reXML =
    /<\s*control name\s*=\s*\"([^\n\r\"]+)\"\s*>(.*)<\s*\/\s*control\s*>/gi;

  var matchArray = reJSON.exec(binaryFile.binAsString);
  var indexArray = [];
  if (matchArray) {
    // For some reason, the leading { may not be captured...
    if (!matchArray[0].indexOf("{") == 0) matchArray[0] = "{" + matchArray[0];
    // Parse JSON and get the prop array
    var jsonObj = JSON.parse(matchArray[0]);
    this.name = matchArray[1];
    indexArray = jsonObj.controlArray;
  } else {
    matchArray = reXML.exec(binaryFile.binAsString);
    if (matchArray) {
      this.name = matchArray[1];
      indexArray = JSON.parse(matchArray[2]);
    }
  }

  if (!indexArray) this.valid = false;

  /**
   * An object containing information about the properties of the effect, which can be used to generate expressions.<br />
   * Access properties with their names, using the group hierarchy.<br />
   * The info available for each property depends on the original pseudo effect, but there's at least the type and the index of the property.
   * @example
   * var pseudoEffect = new DuAEPseudoEffect( pseudoEffectBin );
   * var propIndex = pseudoEffect.props["groupName"]["PropertyName"].index;
   * var effect = pseudoEffect.apply( aLayer );
   * var expression = 'thisLayer.effect("' + pseudoEffect.name + '")(' + propIndex + ');';
   * @type {Object}
   * @name props
   * @memberof DuAEPseudoEffect
   * @readonly
   */
  this.props = {};

  // Recursive method to get props
  var textOffset = 0;
  var mn = this.matchName;
  function getProps(groupIndex) {
    // The group
    var groupProps = {};

    // Each Text prop offsets the indices
    //textOffset = def(textOffset, 0);

    // For next props until we find the end of the group
    for (var i = groupIndex, n = indexArray.length; i < n; i++) {
      var prop = indexArray[i];

      // Recursion if it's a new group
      if (prop.type == "group") {
        var newGroup = getProps(i + 1);
        // update properties for the group
        newGroup.index = i + 1 + textOffset;
        newGroup.name = prop.name;
        newGroup.invisible = prop.invisible;
        // Jump to the end
        i = newGroup.lastIndex;
        groupProps[prop.name] = newGroup;
      }
      // finished this group
      else if (prop.type == "endgroup") {
        groupProps.lastIndex = i;
        return groupProps;
      }
      // It's a prop
      else {
        // We just need to set the index
        prop.index = i + 1 + textOffset;
        groupProps[prop.name] = prop;
        if (prop.type == "text") textOffset++;
      }
    }

    return groupProps;
  }

  this.props = getProps(0);

  // Finally, extract the file

  /**
   * The ffx file
   * @type {File}
   * @name file
   * @memberof DuAEPseudoEffect
   * @readonly
   */
  this.file = binaryFile.toFile();
}

/**
 * This method adds the pseudo effect to a layer
 * @param {Layer} layer - The layer
 * @param {string} [name=this.name] - A name for the effect
 * @return {PropertyGroup|null} The effect. May be null if the pseudo effect was not parsed correctly
 */
DuAEPseudoEffect.prototype.apply = function (layer, name) {
  name = def(name, this.name);

  return DuAELayer.addPseudoEffect(layer, this.file, this.matchName, name);
};
