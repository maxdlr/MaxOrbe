import { makeMaxOrbeShapeLayer } from "./MaxOrbe/layers/maxorbe-shapes";
import { makeController } from "./MaxOrbe/layers/maxorbe-null";

export const createMaxOrbe = () => {
  const comp: CompItem | undefined =
    (app.project.activeItem as CompItem) ?? undefined;

  if (!comp) {
    alert("Please select a composition");
    return;
  }
  // const controller = comp.layer("[CTRL] - MaxOrbe") as Layer;

  const controller: Layer = makeController(comp);
  makeMaxOrbeShapeLayer(controller, comp);
};