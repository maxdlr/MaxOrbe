import {
  MaxVectorEllipse,
  MaxVectorFill,
  MaxVectorGroup,
  MaxVectorMergePath,
  MaxVectorRectangle,
} from "../../../MaxFrame/MaxShapeLayer";
import {
  MAXORBE_BOTTOM_DOME_FRONT,
  MAXORBE_BOTTOM_DOME_MAIN_BODY,
  MAXORBE_BOTTOM_DOME_MAIN_MASK,
  MAXORBE_DOME,
  MAXORBE_DOME_FILL_COLOR,
} from "../../enums/maxOrbeExpressions";

export const makeDomeGroup = (
  root: PropertyGroup,
  isBottom: boolean = true,
) => {
  const body = MaxVectorGroup.addTo(root, true)
    .new(isBottom ? "Bottom - Dome" : "Top - Dome")
    .transform(
      "opacity",
      isBottom ? MAXORBE_DOME.bottomOpacity : MAXORBE_DOME.topOpacity,
    )
    .build();

  MaxVectorEllipse.addTo(body)
    .new("Bottom - Dome - Front")
    .size({ expression: MAXORBE_BOTTOM_DOME_FRONT.size })
    .position({ expression: MAXORBE_BOTTOM_DOME_FRONT.position });

  const main = MaxVectorGroup.addTo(body).new("Bottom - Dome - Main").build();
  MaxVectorEllipse.addTo(main)
    .new("Bottom - Dome - Main - Body")
    .size({ expression: MAXORBE_BOTTOM_DOME_MAIN_BODY.size })
    .position({ expression: MAXORBE_BOTTOM_DOME_MAIN_BODY.position });
  MaxVectorRectangle.addTo(main)
    .new("Bottom - Dome - Main - Mask")
    .size(MAXORBE_BOTTOM_DOME_MAIN_MASK.size)
    .position(MAXORBE_BOTTOM_DOME_MAIN_MASK.position);
  MaxVectorMergePath.addTo(main)
    .new("Bottom - Dome - Main - Merge Paths")
    .mode("subtract");

  MaxVectorMergePath.addTo(body).new("Bottom - Dome - Merge Paths").mode("add");
  MaxVectorFill.addTo(body)
    .new("Bottom - Dome - Fill")
    .color(MAXORBE_DOME_FILL_COLOR.color)
    .opacity(MAXORBE_DOME_FILL_COLOR.opacity);
};