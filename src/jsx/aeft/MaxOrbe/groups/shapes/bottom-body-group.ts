import {
  MAXORBE_BODY_BOTTOM_BACK,
  MAXORBE_BODY_BOTTOM_MAIN_BODY,
  MAXORBE_BODY_BOTTOM_MAIN_BODY_MASK,
  MAXORBE_BOTTOM_BODY_STROKE,
  MAXORBE_BOTTOM_BODY_TOP,
  MAXORBE_BOTTOM_BODY_TOP_HOLE,
  MAXORBE_BOTTOM_BODY_TOP_MAIN,
} from "../../enums/maxOrbeExpressions";
import {
  MaxVectorEllipse,
  MaxVectorFill,
  MaxVectorGradientFill,
  MaxVectorGroup,
  MaxVectorMergePath,
  MaxVectorRectangle,
  MaxVectorStroke,
} from "../../../MaxFrame/MaxShapeLayer";

export const makeBottomBodyGroup = (root: PropertyGroup) => {
  const body = MaxVectorGroup.addTo(root, true).new("Bottom - Body").build();
  buildTop(body);
  buildBottom(body);
  MaxVectorStroke.addTo(body)
    .new("Body - Stroke")
    .color(MAXORBE_BOTTOM_BODY_STROKE.color)
    .width(MAXORBE_BOTTOM_BODY_STROKE.width)
    .cap("round")
    .join("round")
    .build();
};

const buildBottom = (parent: PropertyGroup) => {
  const bodyBottom = MaxVectorGroup.addTo(parent).new("Body - Bottom").build();
  MaxVectorEllipse.addTo(bodyBottom)
    .new("Body - Bottom - Back")
    .size({ expression: MAXORBE_BODY_BOTTOM_BACK.size })
    .position({ expression: MAXORBE_BODY_BOTTOM_BACK.position });

  const main = MaxVectorGroup.addTo(bodyBottom)
    .new("Body - Bottom - Main")
    .build();

  MaxVectorEllipse.addTo(main)
    .new("Body - Bottom - Body")
    .size({ expression: MAXORBE_BODY_BOTTOM_MAIN_BODY.size })
    .position({ expression: MAXORBE_BODY_BOTTOM_MAIN_BODY.position });

  MaxVectorRectangle.addTo(main)
    .new("Body - Bottom - Body - Mask")
    .size(MAXORBE_BODY_BOTTOM_MAIN_BODY_MASK.size)
    .position(MAXORBE_BODY_BOTTOM_MAIN_BODY_MASK.position);

  MaxVectorMergePath.addTo(main)
    .new("Body - Bottom - Body - Merge")
    .mode("subtract");

  MaxVectorMergePath.addTo(bodyBottom).new("Body - Bottom - Merge").mode("add");

  MaxVectorGradientFill.addTo(bodyBottom)
    .new("Body - Bottom - GradientFill")
    .type("radial")
    .startPoint([0, 0])
    .endPoint(MAXORBE_BODY_BOTTOM_MAIN_BODY.gradientEndPoint)
    .highlight(26, 51);
};

const buildTop = (parent: PropertyGroup) => {
  const bodyTop = MaxVectorGroup.addTo(parent)
    .new("Body - Top")
    .transform("opacity", MAXORBE_BOTTOM_BODY_TOP.opacity)
    .build();

  MaxVectorEllipse.addTo(bodyTop)
    .new("Body - Top - Hole")
    .size({ expression: MAXORBE_BOTTOM_BODY_TOP_HOLE.size })
    .position({ expression: MAXORBE_BOTTOM_BODY_TOP_HOLE.position });

  MaxVectorFill.addTo(bodyTop)
    .new("Body - Top - Hole - Fill")
    .color(MAXORBE_BOTTOM_BODY_TOP_HOLE.fillColor);

  MaxVectorEllipse.addTo(bodyTop)
    .new("Body - Top - Main")
    .size({ expression: MAXORBE_BOTTOM_BODY_TOP_MAIN.size })
    .position({ expression: MAXORBE_BOTTOM_BODY_TOP_MAIN.position });

  MaxVectorFill.addTo(bodyTop)
    .new("Body - Top - Main - Fill")
    .color(MAXORBE_BOTTOM_BODY_TOP_MAIN.color);

  MaxVectorStroke.addTo(bodyTop)
    .new("Body - Top - Main - Stroke")
    .color(MAXORBE_BOTTOM_BODY_TOP_MAIN.color)
    .width(MAXORBE_BOTTOM_BODY_TOP_MAIN.strokeWidth)
    .cap("round")
    .join("round");
};