import type { UpdateNodeCommand } from '../services';

// Local form data type with flat string attributes for UI
export interface FormData {
  label?: string;
  description?: string;
  content?: string;
  attributes?: Record<string, string | undefined>;
}

// Convert FormData to UpdateNodeCommand for API
export function toUpdateNodeCommand(data: FormData): UpdateNodeCommand {
  const result: UpdateNodeCommand = {
    label: data.label,
    description: data.content ?? data.description,
  };

  if (data.attributes && Object.keys(data.attributes).length > 0) {
    result.attributes = data.attributes as unknown as UpdateNodeCommand['attributes'];
  }

  return result;
}
