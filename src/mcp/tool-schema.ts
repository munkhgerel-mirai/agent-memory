import * as z from "zod/v4";

import type {
  CapabilityPayloadField,
  CapabilityPayloadValueType,
  McpToolDescriptor,
} from "../domain/framework-agnostic-integration.js";

export function mcpInputSchema(descriptor: McpToolDescriptor): z.ZodObject<z.ZodRawShape> {
  const shape: Record<string, z.ZodType> = {};

  for (const field of descriptor.inputFields) {
    const schema = schemaForValueType(field.valueType).describe(field.description);
    shape[field.name] = field.required ? schema : schema.optional();
  }

  return z.strictObject(shape);
}

function schemaForValueType(valueType: CapabilityPayloadValueType): z.ZodType {
  switch (valueType) {
    case "string":
      return z.string();
    case "string_array":
      return z.array(z.string());
    case "boolean":
      return z.boolean();
    case "number":
      return z.number();
    case "object":
      return z.record(z.string(), z.unknown());
  }
}