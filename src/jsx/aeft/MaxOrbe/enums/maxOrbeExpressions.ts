export const MAXORBE_LAYER = {
  anchorPoint: `parent.effect("Anchor Offset")("Point")`,
};

////////////////////// ----------------- //////////////////////

export const MAXORBE_BOTTOM_BODY_STROKE = {
  color: `parent.effect("body.stroke.color")("Color")`,
  width: `parent.effect("body.stroke.width")("Slider")`,
};

export const MAXORBE_BOTTOM_BODY_TOP = {
  opacity: `rot = parent.effect("body.rot.x")("Angle");
rot > 0 ? 100 : 0;`,
};

export const MAXORBE_BOTTOM_BODY_TOP_HOLE = {
  size: `ctrlLayer = parent;
x = ctrlLayer.effect("body.size")("Slider") / 2;
z = ctrlLayer.effect("body.rot.x")("Angle");
[x, linear(z, 0, 180, 0, x)]`,
  position: "[0,0]",
  fillColor: `parent.effect("body.hole.color")("Color")`,
};

export const MAXORBE_BOTTOM_BODY_TOP_MAIN = {
  size: `ctrlLayer = parent;
x = ctrlLayer.effect("body.size")("Slider");
z = ctrlLayer.effect("body.rot.x")("Angle");
[x, linear(z, 0, 180, 0, x)]`,
  position: "[0,0]",
  color: `parent.effect("body.stroke.color")("Color")`,
  strokeWidth: `parent.effect("body.stroke.width")("Slider")`,
};

export const MAXORBE_BODY_BOTTOM_BACK = {
  size: `ctrlLayer = parent;
x = ctrlLayer.effect("body.size")("Slider");
z = ctrlLayer.effect("body.rot.x")("Angle");
[x, linear(z, -180, 0, x, 0)]`,
  position: "[0,0]",
};

export const MAXORBE_BODY_BOTTOM_MAIN_BODY = {
  size: `temp = parent.effect("body.size")("Slider");
[temp, temp]`,
  position: "[0,0]",
  gradientEndPoint: `temp = parent.effect("body.size")("Slider");
[temp/1.7, 0]`,
};

export const MAXORBE_BODY_BOTTOM_MAIN_BODY_MASK = {
  size: `temp = parent.effect("body.size")("Slider");
[temp, temp/2]`,
  position: `temp = parent.effect("body.size")("Slider");
[0, -temp/4]`,
};

////////////////////// ----------------- //////////////////////

export const MAXORBE_ORBE = {
  bottomOpacity: `mainOpa = content("Bottom - Dome").transform.opacity;
condition = parent.effect("Active mini-orbe")("Checkbox");
condition == 1 ? mainOpa : 0;`,
  topOpacity: `mainOpa = content("Top - Dome").transform.opacity;
condition = parent.effect("Active mini-orbe")("Checkbox");
condition == 1 ? mainOpa : 0;`,
}

export const MAXORBE_ORBE_PATH = {
  bottomSize: `temp = parent.effect("body.size")("Slider") / 4;
[temp, temp]`,
  bottomPosition: `freq = 3;
amp = 50;
loopTime = thisComp.duration;
t = time % loopTime;
wiggle1 = wiggle(freq, amp, 1, 0.5, t);
wiggle2 = wiggle(freq, amp, 1, 0.5, t - loopTime);
ease(t, 0, loopTime, wiggle1, wiggle2)`,
  topSize: `content("Bottom - Orbe").content("Bottom - Orbe - Path").size`,
  topPosition: `content("Bottom - Orbe").content("Bottom - Orbe - Path").position`,
}

export const MAXORBE_ORBE_GRADIENT_FILL = {
  bottomStartPoint: `content("Bottom - Orbe").content("Bottom - Orbe - Path").position`,
  bottomEndPoint:`pos = content("Bottom - Orbe").content("Bottom - Orbe - Gradient Fill").startPoint;
w = content("Bottom - Orbe").content("Bottom - Orbe - Path").size[0];
[pos[0] + w/2,pos[1]]`,
  topStartPoint: `content("Bottom - Orbe").content("Bottom - Orbe - Gradient Fill").startPoint`,
  topEndPoint: `content("Bottom - Orbe").content("Bottom - Orbe - Gradient Fill").endPoint`
}

////////////////////// ----------------- //////////////////////

export const MAXORBE_DOME = {
  bottomOpacity: `parent.effect("body.rot.x")("Angle") > 0 ? 0 : 100`,
  topOpacity: `main = thisLayer.content("Bottom - Dome").transform.opacity;
main == 0 ? 100 : 0`,
};

export const MAXORBE_BOTTOM_DOME_FRONT = {
  size: `ctrlLayer = parent;
x = ctrlLayer.effect("body.size")("Slider");
z = ctrlLayer.effect("body.rot.x")("Angle");
[x, linear(z, 0, 180, 0, x)]`,
  position: "[0,0]",
};

export const MAXORBE_BOTTOM_DOME_MAIN_BODY = {
  size: `temp = parent.effect("body.size")("Slider");
[temp, temp]`,
  position: `[0,0]`,
};

export const MAXORBE_BOTTOM_DOME_MAIN_MASK = {
  size: `temp = parent.effect("body.size")("Slider");
[temp, temp/2]`,
  position: `temp = parent.effect("body.size")("Slider");
[0, temp/4]`,
};

export const MAXORBE_DOME_FILL_COLOR = {
  color: `parent.effect("body.dome.color")("Color")`,
  opacity: `parent.effect("body.dome.opacity")("Slider")`,
};

////////////////////// ----------------- //////////////////////

export const MAXORBE_REFLECTION_PATH = {
  size: `thisLayer.content("Bottom - Dome").content("Bottom - Dome - Main").content("Bottom - Dome - Main - Body").size / 1.1`,
  position: `[0,0]`,
};

export const MAXORBE_REFLECTION_TRIM = {
  offset: `ctrlr = parent.transform.rotation;
-ctrlr + 180`,
};
