import { MaxLayer } from "../../MaxFrame/MaxLayer";
import { controller } from "../enums/maxOrbeNames";
import { MaxEffectsMatchNames } from "../../MaxFrame/ADBE-match-names/MaxEffectsMatchNames";

export const makeController = (comp: CompItem) => {
  const ctrl: AVLayer = MaxLayer.new("Null", comp, controller.layer.name as string)
    .transform("position", [comp.width / 2, comp.height / 2])
    .build();

  const ctrlEffects= ctrl.property(MaxEffectsMatchNames.group) as PropertyGroup;
  alert(ctrlEffects.matchName)

  // ctrlEffects.addProperty("Pseudo/MaxOrbe");

  return ctrl;
};