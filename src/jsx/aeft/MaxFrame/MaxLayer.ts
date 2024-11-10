import { MaxAvLayerMatchNames } from "./ADBE-match-names/MaxAvLayerMatchNames";

export const MaxLayer = {
  layer: {} as Layer,

  new: function (type: "ShapeLayer" | "Null", comp: CompItem, name: string) {
    switch (type) {
      case "ShapeLayer":
        this.layer = comp.layers.addShape() as ShapeLayer;
        break;
      case "Null":
        this.layer = comp.layers.addNull() as ShapeLayer;
        break;
      default:
        throw new Error("Please specify the layer type to create");
    }

    this.layer.name = name;
    return this;
  },

  parentTo: function (parentLayer: Layer, withJump: boolean = false) {
    if (withJump) {
      this.layer.setParentWithJump(parentLayer);
      return this;
    }

    this.layer.parent = parentLayer;
    return this;
  },

  transform: function (
    type:
      | "anchorPoint"
      | "position"
      | "xPosition"
      | "yPosition"
      | "zPosition"
      | "scale"
      | "orientation"
      | "xRotation"
      | "yRotation"
      | "zRotation"
      | "opacity",
    value: number | number[] | string,
  ) {
    const transformGroup = this.layer.property(
      MaxAvLayerMatchNames.transform.group,
    ) as PropertyGroup;

    const transformProperty = transformGroup.property(
      MaxAvLayerMatchNames.transform[type],
    ) as Property;

    if (typeof value === "string") {
      transformProperty.expression = value;
      return this;
    }

    transformProperty.setValue(value);
    return this;
  },

  build: function () {
    return this.layer;
  },
};