import type { UpdateNodeCommand } from '../services';

// Local form data type with flat string attributes for UI
export interface FormData {
  label?: string;
  markdownContent?: string;
  attributes?: Record<string, string | undefined>;
}

// Convert FormData to UpdateNodeCommand for API
export function toUpdateNodeCommand(data: FormData): UpdateNodeCommand {
  const result: UpdateNodeCommand = {
    label: data.label,
    markdownContent: data.markdownContent,
  };

  if (data.attributes && Object.keys(data.attributes).length > 0) {
    result.attributes = data.attributes as unknown as UpdateNodeCommand['attributes'];
  }

  return result;
}
