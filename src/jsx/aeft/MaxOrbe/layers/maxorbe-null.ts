import { MaxLayer } from "../../MaxFrame/MaxLayer";
import { MaxEffectGroup } from "../../MaxFrame/ADBE-match-names/MaxEffect";

export const makeController = (comp: CompItem) => {
  const controller = MaxLayer.new("Null", comp, "[Ctrl] - MaxOrbe")
    .transform("position", [comp.width / 2, comp.height / 2])
    .build();

  MaxEffectGroup.addTo(controller).new().build();

  return controller;
};