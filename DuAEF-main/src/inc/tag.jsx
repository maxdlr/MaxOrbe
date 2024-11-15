/**
 * After Effects tag methods<br />
 * Tags are markers set on the first frame of layers, displaying an info about the layer (usually, a "type" or tag).<br />
 * These markers are used by DuAEF (and Duik, DuGR, ...) to recognise and manipulate the layers, and to store hidden data.<br />
 * They're also used assign the layer to groups, which can be used by other scripts, especially DuGR.
 * @namespace
 * @category DuAEF
 */
var DuAETag = {};

/**
 * The list of paramaters which can be set by DuAEF in tags.
 * @enum {string}
 * @readonly
 */
DuAETag.Key = {
  /**
   * Used to temporarily store the list of children of the layers.
   */
  CHILD_LAYERS: "childrenLayers",
  /**
   * A list of groups this layer belongs to.
   */
  GROUPS: "groups",
  /**
   * A Custom layer type
   * Historically from duik
   */
  LAYER_TYPE: "duik.type",
};

/**
 * The list of names used for the markers.<br />
 * Names are the string shown to the user on the marker, the comment.<br />
 * Note that these names may change as they may be localized and should not be used to manipulate layers, but only shown to the user.
 * @enum {string}
 * @readonly
 */
DuAETag.Name = {
  /**
   * A layer toggled to edit mode.
   * @default "Edit mode"
   */
  EDIT_MODE: "Edit mode",
};

/**
 * The list of types to parse values.
 * @enum {int}
 * @readonly
 */
DuAETag.Type = {
  STRING: 0,
  BOOL: 1,
  INT: 2,
  ARRAY: 3,
  FLOAT: 4,
};

/**
 * Set to true so the markers are created before the composition start time and hidden
 @type {bool}
 */
DuAETag.hideTags = false;

// low-level undocumented function to get the time the marker should be set on
DuAETag.getTagTime = function (layer) {
  var markerProp = layer.property("ADBE Marker");
  var time = 0;
  if (DuAETag.hideTags) time = -60; // Starting 60 s before start time should be enough!
  if (markerProp.numKeys > 0) {
    // Get an empty frame to set the tag
    var frame = 0;
    if (DuAETag.hideTags) frame = -1000; // Starting 1000 frames before start time should be enough!
    for (var i = 1, n = markerProp.numKeys; i <= n; i++) {
      var kT = markerProp.keyTime(i);
      var kF = DuAEComp.timeToFrames(kT);
      // Frame 0 is available
      if (kF > frame) break;
      if (kF > frame + 10) {
        frame = frame + 10;
        break;
      }
      if (kF < frame) continue;
      frame = frame + 10;
    }
    time = DuAEComp.framesToTime(frame);
  }
  return time;
};

/**
 * Sets a new marker/tag (or gets the existing one) on the first frame of the layer.
 * @param {Layer} layer - The layer to set the tag on.
 * @param {string} [tagName] - The name to display on the marker (the comment of the marker)
 * @param {MarkerValue} [tag] - An existing tag.
 * @param {Boolean} [hidden=DuAETag.hideTags] - When true, the marker will be created before the layer and comp start time, so it's hidden.
 * @return {MarkerValue} The marker (tag), with an extra property <code>keyIndex</code> which is the index of the corresponding keyframe.
 */
DuAETag.set = function (layer, tagName, tag) {
  var markerProp = layer.property("ADBE Marker");

  tag = def(tag, DuAETag.get(layer));

  // Create tag if needed
  if (!tag) {
    var time = DuAETag.getTagTime(layer);
    var comment = def(tagName, "");
    tag = new MarkerValue(comment);
    tag.keyTime = time;
    tag.keyIndex = -1;
  }
  // Otherwise just set comment
  else {
    if (isdef(tagName)) tag.comment = tagName;
  }

  var tagParams = tag.getParameters();
  tagParams.duaef = def(tagParams.duaef, true);
  tag.setParameters(tagParams);

  if (tag.keyIndex > 0) {
    markerProp.setValueAtKey(tag.keyIndex, tag);
  } else {
    markerProp.setValueAtTime(tag.keyTime, tag);
    tag.keyIndex = markerProp.nearestKeyIndex(time);
  }

  return tag;
};

/**
 * Gets the tag.
 * @param {Layer} layer - The layer to get the tag from.
 * @return {MarkerValue|null} The marker (tag) or <code>null</code> if not found.
 */
DuAETag.get = function (layer) {
  if (!layer) return null;

  var markerProp = layer.property("ADBE Marker");

  for (var i = 1, num = markerProp.numKeys; i <= num; i++) {
    var tag = markerProp.keyValue(i);
    tag.keyIndex = i;
    tag.keyTime = markerProp.keyTime(i);
    var params = tag.getParameters();
    if (!params.duaef) continue;
    // check time to shoz / hide
    if (
      (DuAETag.hideTags && tag.keyTime >= 0) ||
      (!DuAETag.hideTags && tag.keyTime < 0)
    ) {
      var time = DuAETag.getTagTime(layer);
      markerProp.removeKey(tag.keyIndex);
      markerProp.setValueAtTime(time, tag);
      tag.keyTime = time;
      tag.keyIndex = markerProp.nearestKeyIndex(time);
    }
    return tag;
  }
  return null;
};

/**
 * Removes the tag from the layer
 * @param {Layer} layer - The layer containing the tag.
 * @param {MarkerValue} [tag] If you have the tag as returned by {@link DuAETag.get} or {@link DuAETag.set}, providing it here improves performance.
 */
DuAETag.remove = function (layer, tag) {
  tag = def(tag, DuAETag.get(layer));
  if (!tag) return;

  var markerProp = layer.property("ADBE Marker");
  markerProp.removeKey(tag.keyIndex);
};

/**
 * Sets the name (comment of the marker) of the tag.
 * @param {Layer} layer The layer to get the tag from
 * @param {string} [tagName] - The name to display on the marker (the comment of the marker)
 * @param {MarkerValue} [tag] If you have the tag as returned by {@link DuAETag.get} or {@link DuAETag.set}, providing it here improves performance.
 * @return {string} The name.
 */
DuAETag.setName = function (layer, tagName, tag) {
  tag = def(tag, DuAETag.get(layer));
  if (!tag) DuAETag.set(layer, tagName);
  else {
    tag.comment = tagName;
    var markerProp = layer.property("ADBE Marker");
    markerProp.setValueAtKey(tag.keyIndex, tag);
  }
};

/**
 * Gets the name (comment of the marker) of the tag.
 * @param {Layer} layer The layer to get the tag from
 * @return {string} The name.
 */
DuAETag.getName = function (layer) {
  var tag = DuAETag.get(layer);
  if (!tag) return "";
  return tag.comment;
};

/**
 * Sets a new parameter (a key/value pair) to the hidden parameters stored in the tag.
 * @param {Layer} layer - The layer to get the tag from.
 * @param {string} key - The key. May be one of {@link DuAETag.Key}.
 * @param {string} value - The value, which needs to be a string.
 * @param {MarkerValue} [tag] If you have the tag as returned by {@link DuAETag.get} or {@link DuAETag.set}, providing it here improves performance.
 * @return {Boolean} Success, may be false if there's no tag on this layer yet.
 */
DuAETag.setValue = function (layer, key, value, tag) {
  tag = def(tag, DuAETag.set(layer));
  if (!tag) return;

  var tagParams = tag.getParameters();
  tagParams.duaef = def(tagParams.duaef, true);

  tagParams[key] = value;
  tag.setParameters(tagParams);

  layer.property("ADBE Marker").setValueAtKey(tag.keyIndex, tag);
};

/**
 * Gets the value of a specific key in the tag parameters.
 * @param {Layer} layer - The layer to get the tag from.
 * @param {string} key - The key. May be one of {@link DuAETag.Key}.
 * @param {DuAETag.Type} [type=DuAETag.Type.STRING] - The expected type for the value.
 * @param {MarkerValue} [tag] If you have the tag as returned by {@link DuAETag.get} or {@link DuAETag.set}, providing it here improves performance.
 * @return {any} The value, null if the key was not found.
 */
DuAETag.getValue = function (layer, key, type, tag) {
  tag = def(tag, DuAETag.get(layer));
  if (!tag) return null;

  type = def(type, DuAETag.Type.STRING);

  var params = tag.getParameters();
  if (!params) return null;

  var val = params[key];
  if (!isdef(val)) return null;
  if (type == DuAETag.Type.STRING) return val;
  if (type == DuAETag.Type.BOOL) {
    if (val === "false") return false;
    else if (val === "true") return true;
    else if (val === "") return false;
    else if (parseInt(val) == 0) return false;
    else return true;
  }
  if (type == DuAETag.Type.INT) {
    if (val == "") return 0;
    return parseInt(val);
  }
  if (type == DuAETag.Type.FLOAT) {
    if (val == "") return 0;
    return parseFloat(val);
  }
  if (type == DuAETag.Type.ARRAY) {
    if (val == "") return [];
    return val.split(",");
  }

  return null;
};

/**
 * Gest the list of the groups this layer belongs to.
 * @param {Layer} layer
 * @param {MarkerValue} [tag] If you have the tag as returned by {@link DuAETag.get} or {@link DuAETag.set}, providing it here improves performance.
 * @returns {string[]} The list of groups. May be an empty list.
 */
DuAETag.getGroups = function (layer, tag) {
  tag = def(tag, DuAETag.get(layer));

  var groups = DuAETag.getValue(
    layer,
    DuAETag.Key.GROUPS,
    DuAETag.Type.ARRAY,
    tag,
  );
  if (!groups) return [];
  return groups;
};

/**
 * Assigns the layer to a group.<br >
 * If the layer does not have a tag yet, a new one will be created with the group name.
 * @param {Layer} layer The layer.
 * @param {string} groupName The group.
 * @param {MarkerValue} [tag] If you have the tag as returned by {@link DuAETag.get} or {@link DuAETag.set}, providing it here improves performance.
 */
DuAETag.addGroup = function (layer, groupName, tag) {
  tag = def(tag, DuAETag.set(layer));

  var groups = DuAETag.getGroups(layer, tag);
  if (!groups) groups = [];

  groups = new DuList(groups);
  if (groups.indexOf(groupName) >= 0) return;

  groups.push(groupName);

  DuAETag.setValue(layer, DuAETag.Key.GROUPS, groups.join(","), tag);
  DuAETag.setName(layer, groups.join(" | "), tag);
};

/**
 * Unassigns the layer from a group.
 * @param {Layer} layer The layer.
 * @param {string} groupName The group.
 * @param {MarkerValue} [tag] If you have the tag as returned by {@link DuAETag.get} or {@link DuAETag.set}, providing it here improves performance.
 */
DuAETag.removeGroup = function (layer, groupName, tag) {
  tag = def(tag, DuAETag.get(layer));

  var groups = DuAETag.getGroups(layer, tag);
  if (!groups) return;

  groups = new DuList(groups);
  if (groups.indexOf(groupName) < 0) return;
  groups.removeAll(groupName);
  DuAETag.setValue(layer, DuAETag.Key.GROUPS, groups.join(","), tag);
  DuAETag.setName(layer, groups.join(" | "), tag);
};

/**
 * Renames a group
 * @param {Layer} layer The layer.
 * @param {string} previousName The current name
 * @param {string} newName The new name
 * @param {MarkerValue} [tag] If you have the tag as returned by {@link DuAETag.get} or {@link DuAETag.set}, providing it here improves performance.
 */
DuAETag.renameGroup = function (layer, previousName, newName, tag) {
  tag = def(tag, DuAETag.get(layer));

  var groups = DuAETag.getGroups(layer, tag);
  if (!groups) return;

  groups = new DuList(groups);
  groups.replace(previousName, newName);
  DuAETag.setValue(layer, DuAETag.Key.GROUPS, groups.join(","), tag);
  DuAETag.setName(layer, groups.join(" | "), tag);
};
