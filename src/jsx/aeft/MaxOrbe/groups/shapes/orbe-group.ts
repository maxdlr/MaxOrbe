import {
  MAXORBE_ORBE,
  MAXORBE_ORBE_GRADIENT_FILL,
  MAXORBE_ORBE_PATH,
} from "../../enums/maxOrbeExpressions";
import {
  MaxVectorEllipse,
  MaxVectorGradientFill,
  MaxVectorGroup,
} from "../../../MaxFrame/MaxShapeLayer";

export const makeOrbeGroup = (
  root: PropertyGroup,
  isBottom: boolean = true,
) => {
  const orbeGroup = MaxVectorGroup.addTo(root, true)
    .new(isBottom ? "Bottom - Orbe" : "Top - Orbe")
    .transform(
      "opacity",
      isBottom ? MAXORBE_ORBE.bottomOpacity : MAXORBE_ORBE.topOpacity,
    )
    .build();

  MaxVectorEllipse.addTo(orbeGroup)
    .new(isBottom ? "Bottom - Orbe - Path" : "Top - Orbe - Path")
    .size({
      expression: isBottom
        ? MAXORBE_ORBE_PATH.bottomSize
        : MAXORBE_ORBE_PATH.topSize,
    })
    .position({
      expression: isBottom
        ? MAXORBE_ORBE_PATH.bottomPosition
        : MAXORBE_ORBE_PATH.topPosition,
      value: [0, -82],
    });

  MaxVectorGradientFill.addTo(orbeGroup)
    .new(
      isBottom ? "Bottom - Orbe - Gradient Fill" : "Top - Orbe - Gradient Fill",
    )
    .startPoint(
      isBottom
        ? MAXORBE_ORBE_GRADIENT_FILL.bottomStartPoint
        : MAXORBE_ORBE_GRADIENT_FILL.topStartPoint,
    )
    .endPoint(
      isBottom
        ? MAXORBE_ORBE_GRADIENT_FILL.bottomEndPoint
        : MAXORBE_ORBE_GRADIENT_FILL.topEndPoint,
    )
    .type("radial");
};