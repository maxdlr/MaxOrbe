import {
  MaxVectorEllipse,
  MaxVectorGroup,
  MaxVectorStroke,
  MaxVectorTrimPath,
} from "../../../MaxFrame/MaxShapeLayer";
import {
  MAXORBE_REFLECTION_PATH,
  MAXORBE_REFLECTION_TRIM,
} from "../../enums/maxOrbeExpressions";

export const makeReflectionGroup = (root: PropertyGroup) => {
  const reflectionGroup = MaxVectorGroup.addTo(root, true)
    .new("Reflection")
    .build();

  MaxVectorEllipse.addTo(reflectionGroup)
    .new("Reflection - Path")
    .size({ expression: MAXORBE_REFLECTION_PATH.size })
    .position({ expression: MAXORBE_REFLECTION_PATH.position });

  MaxVectorTrimPath.addTo(reflectionGroup)
    .new("Reflection - TrimPath")
    .start(40)
    .end(60)
    .offset(MAXORBE_REFLECTION_TRIM.offset);

  MaxVectorStroke.addTo(reflectionGroup)
    .new("Reflection - Stroke")
    .width(40)
    .color([1, 1, 1, 1])
    .cap("round")
    .taper({ value: 100 }, { value: 100 }, { value: 10 }, { value: 10 });
};