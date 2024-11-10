import { ValueAndExpressionSet } from "../MaxTypes";

export const setPropertyValueAndExpression = (
  propertyGroup: PropertyGroup,
  propertyMatchName: string,
  valueOrExpression: ValueAndExpressionSet,
) => {
  const property = propertyGroup.property(
    propertyMatchName,
  ) as ShapePropertyType;

  if (valueOrExpression.expression)
    property.expression = valueOrExpression.expression;
  if (valueOrExpression.value) property.setValue(valueOrExpression.value);
};