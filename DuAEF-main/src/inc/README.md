# DuAEF

Duduf After Effects Framework

► [The Framework reference is available here](http://duaef.rxlab.io).

## Classes and namespaces

These stables show where to find the implementation for each class & namespace of the framework.  
[Read the reference](http://duaef.rxlab.io) for the description of all classes and namespaces.

### General

|             Name             |    Type     | File                                                                                               | Description                                                                                                            |
| :--------------------------: | :---------: | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
|            `DuAE`            | _namespace_ | [inc/ae.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/ae.jsxinc)                     | Application specific objects and methods.                                                                              |
|          `DuAEComp`          | _namespace_ | [inc/comp.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/comp.jsxinc)                 | Composition specific objects and methods.                                                                              |
|       `DuAEExpression`       | _namespace_ | [inc/expression.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/expression.jsxinc)     | Expression specific objects and methods and cache system.                                                              |
|           `DuAEF`            | _namespace_ | [inc/core.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/core.jsxinc)                 | Main objects and methods.                                                                                              |
|          `DuAEItem`          | _namespace_ | [inc/item.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/item.jsxinc)                 | Projecct items specific objects and methods.                                                                           |
|        `DuAEKeyframe`        |   _Class_   | [inc/ae.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/ae.jsxinc)                     | Properties of an After Effects Keyframe.                                                                               |
|  `DuAEKeySpatialProperties`  |   _Class_   | [inc/ae.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/ae.jsxinc)                     | Spatial properties of a DuAEKeyframe.                                                                                  |
|         `DuAELayer`          | _namespace_ | [inc/layer.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/layer.jsxinc)               | Layer specific objects and methods.                                                                                    |
|     `DuAELayerAnimation`     |   _Class_   | [inc/ae.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/ae.jsxinc)                     | Contains all DuAEPropertyGroupAnimation from an After Effects Layer.                                                   |
|        `DuAEProject`         | _namespace_ | [inc/project.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/project.jsxinc)           | Project specific objects and methods.                                                                                  |
|       `DuAEProjectXMP`       | _namespace_ | [inc/projectXMP.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/projectXMP.jsxinc)     | Manages XMP Metadata of the project.                                                                                   |
|        `DuAEProperty`        |   _Class_   | [inc/property.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/property.jsxinc)         | Property specific objects and methods.                                                                                 |
|   `DuAEPropertyAnimation`    |   _Class_   | [inc/ae.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/ae.jsxinc)                     | Describes the animation of an After Effects property.                                                                  |
|   `DuAEPropertyExpression`   |   _Class_   | [inc/ae.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/ae.jsxinc)                     | Describes an expression and the property containing it.                                                                |
| `DuAEPropertyGroupAnimation` |   _Class_   | [inc/ae.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/ae.jsxinc)                     | Contains all DuAEPropertyAnimation from an After Effects PropertyGroup.                                                |
|      `DuAEPseudoEffect`      |   _Class_   | [inc/pseudoEffect.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/pseudoEffect.jsxinc) | Describes a pseudo effect.                                                                                             |
|         `DuAEPuppet`         | _namespace_ | [inc/puppet.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/puppet.jsxinc)             | Puppet tool specific objects and methods.                                                                              |
|        `DuAERenderer`        |   _Class_   | [inc/renderer.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/renderer.jsxinc)         | Tools to manipulate the render queue and the command line renderer and render compositions in the background or in Ae. |
|      `DuAERendererItem`      |   _Class_   | [inc/renderer.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/renderer.jsxinc)         | An item in the DuAERenderer queue.                                                                                     |
|      `DuAERenderQueue`       | _namespace_ | [inc/renderqueue.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/renderqueue.jsxinc)   | Render queue specific objects and methods.                                                                             |
|       `DuAEShapeLayer`       | _namespace_ | [inc/shapelayer.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/shapelayer.jsxinc)     | Shape layer specific objects and methods.                                                                              |
|          `DuAETag`           | _namespace_ | [inc/tag.jsxinc](https://github.com/RxLaboratory/DuESF/blob/main/inc/tag.jsxinc)                   | Tag methods. Tags are layer markers used by DuAEF to store data.                                                       |

### DuESF Extension

_DuAEF_ also extends _DuESF_ with _After Effects_ specific objects. They're listed here.

|            Name             |    Type     | File                                                                                                               | Description                                          |
| :-------------------------: | :---------: | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
|     `DuAECompSelector`      |   _Class_   | [inc/duscriptui_extension.jsxinc](https://github.com/RxLaboratory/DuAEF/blob/main/inc/duscriptui_extension.jsxinc) | A custom dropdown selector to select comps.          |
|    `DuAEDuAELayerPicker`    |   _Class_   | [inc/duscriptui_extension.jsxinc](https://github.com/RxLaboratory/DuAEF/blob/main/inc/duscriptui_extension.jsxinc) | A two-column group to allow the user to pick layers. |
| `DuAEDuAELayerPickerDialog` |   _Class_   | [inc/duscriptui_extension.jsxinc](https://github.com/RxLaboratory/DuAEF/blob/main/inc/duscriptui_extension.jsxinc) | A layer picker dialog.                               |
|     `DuAELayerSelector`     |   _Class_   | [inc/duscriptui_extension.jsxinc](https://github.com/RxLaboratory/DuAEF/blob/main/inc/duscriptui_extension.jsxinc) | A custom dropdown selector to select layers.         |
|          `DuList`           |   _Class_   | [inc/dulist_extension.jsxinc](https://github.com/RxLaboratory/DuAEF/blob/main/inc/dulist_extension.jsxinc)         | Adds methods specific to AE Collections.             |
|        `DuScriptUI`         | _namespace_ | [inc/duscriptui_extension.jsxinc](https://github.com/RxLaboratory/DuAEF/blob/main/inc/duscriptui_extension.jsxinc) | Adds new methods.                                    |
|     `DuScriptUI.String`     |   _enum_    | [inc/duscriptui_extension.jsxinc](https://github.com/RxLaboratory/DuAEF/blob/main/inc/duscriptui_extension.jsxinc) | Adds new strings used by the UI.                     |
