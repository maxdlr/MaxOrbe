import { MaxLayer } from "../../MaxFrame/MaxLayer";
import { MAXORBE_LAYER } from "../enums/maxOrbeExpressions";
import { MaxVectorRoot } from "../../MaxFrame/MaxShapeLayer";
import { makeReflectionGroup } from "../groups/shapes/reflection-group";
import { makeDomeGroup } from "../groups/shapes/dome-group";
import { makeOrbeGroup } from "../groups/shapes/orbe-group";
import { makeBottomBodyGroup } from "../groups/shapes/bottom-body-group";

export const makeMaxOrbeShapeLayer = (controller: Layer, comp: CompItem) => {
  const maxOrbe = MaxLayer.new("ShapeLayer", comp, "MaxOrbe")
    .parentTo(controller)
    .transform("position", [0, 0])
    .transform("anchorPoint", MAXORBE_LAYER.anchorPoint)
    .build();
  const rootGroup = MaxVectorRoot.new(maxOrbe).build();

  makeReflectionGroup(rootGroup);
  makeDomeGroup(rootGroup, false);
  makeOrbeGroup(rootGroup, false);
  makeBottomBodyGroup(rootGroup);
  makeDomeGroup(rootGroup);
  makeOrbeGroup(rootGroup);
};