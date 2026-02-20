import type { ToolAction } from './socket/events';
import type { AgentInputItem } from '@openai/agents';
import type { SessionHistoryMessage } from './socket/events';

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

const TOOL_ACTION_BY_NAME: Record<string, ToolAction> = {
  search_patients: 'LOOKUP_PATIENT',
  get_patient_details: 'LOOKUP_PATIENT',
  get_patient_medical_history: 'LOOKUP_PATIENT',
  get_patient_stats: 'LOOKUP_PATIENT',

  search_appointments: 'LOOKUP_APPOINTMENT',
  get_appointment_details: 'LOOKUP_APPOINTMENT',
  get_today_appointments: 'LOOKUP_APPOINTMENT',

  list_departments: 'LOOKUP_DEPARTMENT',
  search_providers: 'LOOKUP_DEPARTMENT',
  get_ward_info: 'LOOKUP_DEPARTMENT',
  get_bed_availability: 'LOOKUP_DEPARTMENT',

  search_encounters: 'LOOKUP_CLINICAL',
  search_admissions: 'LOOKUP_CLINICAL',
  search_clinical_orders: 'LOOKUP_CLINICAL',
  search_medication_orders: 'LOOKUP_CLINICAL',

  search_invoices: 'LOOKUP_BILLING',
  get_invoice_details: 'LOOKUP_BILLING',
  search_payments: 'LOOKUP_BILLING',
};

export function getToolAction(toolName: string): ToolAction {
  return TOOL_ACTION_BY_NAME[toolName] || 'PROCESSING';
}

export function extractTextDeltaFromRawEvent(rawEvent: Record<string, unknown>): string | undefined {
  const eventType = typeof rawEvent.type === 'string' ? rawEvent.type : '';

  if (eventType === 'response.output_text.delta') {
    const delta = rawEvent.delta;
    if (typeof delta === 'string') return delta;
    if (
      delta &&
      typeof delta === 'object' &&
      'text' in delta &&
      typeof (delta as { text?: unknown }).text === 'string'
    ) {
      return (delta as { text: string }).text;
    }
  }

  if (eventType === 'response.output_text.added' && typeof rawEvent.text === 'string') {
    return rawEvent.text;
  }

  if (eventType === 'response.content_part.added') {
    const part = rawEvent.part as Record<string, unknown> | undefined;
    if (part?.type === 'output_text' && typeof part.text === 'string') {
      return part.text;
    }
  }

  return undefined;
}

function extractUserTextContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';

  return content
    .map((part) => {
      if (!part || typeof part !== 'object') return '';
      const typedPart = part as { type?: unknown; text?: unknown };
      if (typedPart.type === 'input_text' && typeof typedPart.text === 'string') {
        return typedPart.text;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n')
    .trim();
}

function extractAssistantTextContent(content: unknown): string {
  if (!Array.isArray(content)) return '';

  return content
    .map((part) => {
      if (!part || typeof part !== 'object') return '';
      const typedPart = part as { type?: unknown; text?: unknown };
      if (typedPart.type === 'output_text' && typeof typedPart.text === 'string') {
        return typedPart.text;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n')
    .trim();
}

export function toSessionHistoryMessages(history: AgentInputItem[]): SessionHistoryMessage[] {
  const messages: SessionHistoryMessage[] = [];

  history.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;

    const maybeMessage = item as { role?: unknown; content?: unknown };
    if (maybeMessage.role === 'user') {
      const text = extractUserTextContent(maybeMessage.content);
      if (text) {
        messages.push({
          id: `history_${index}`,
          role: 'user',
          content: text,
        });
      }
      return;
    }

    if (maybeMessage.role === 'assistant') {
      const text = extractAssistantTextContent(maybeMessage.content);
      if (text) {
        messages.push({
          id: `history_${index}`,
          role: 'assistant',
          content: text,
        });
      }
    }
  });

  return messages;
}
