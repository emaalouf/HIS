import { tool } from '@openai/agents';
import { invoiceService } from '../../services/invoice.service';
import { paymentService } from '../../services/payment.service';

type SearchInvoicesArgs = {
  patientId?: string;
  status?: 'DRAFT' | 'ISSUED' | 'SUBMITTED' | 'PARTIAL' | 'PAID' | 'DENIED' | 'VOID';
  search?: string;
  page?: number;
  limit?: number;
};

type InvoiceIdArgs = {
  invoiceId: string;
};

type SearchPaymentsArgs = {
  invoiceId?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER' | 'CHECK' | 'OTHER';
  page?: number;
  limit?: number;
};

export const searchInvoices = tool({
  name: 'search_invoices',
  description: 'Search patient invoices. Can filter by patient, status, and date range.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      patientId: { type: 'string', description: 'Filter by patient ID' },
      status: { type: 'string', enum: ['DRAFT', 'ISSUED', 'SUBMITTED', 'PARTIAL', 'PAID', 'DENIED', 'VOID'], description: 'Filter by invoice status' },
      search: { type: 'string', description: 'Search by invoice number or patient name' },
      page: { type: 'number' },
      limit: { type: 'number' },
    },
    required: [],
  }) as const,
  execute: async (input) => {
    const args = input as SearchInvoicesArgs;
    const result = await invoiceService.list({
      page: args.page || 1,
      limit: Math.min(args.limit || 10, 20),
      patientId: args.patientId,
      status: args.status as any,
      search: args.search,
    });
    return JSON.stringify({
      invoices: result.invoices,
      total: result.total,
    });
  },
});

export const getInvoiceDetails = tool({
  name: 'get_invoice_details',
  description: 'Get full details for a specific invoice including line items, payments, and claims.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      invoiceId: { type: 'string', description: 'The invoice ID' },
    },
    required: ['invoiceId'],
  }) as const,
  execute: async (input) => {
    const args = input as InvoiceIdArgs;
    const invoice = await invoiceService.findById(args.invoiceId);
    if (!invoice) return JSON.stringify({ error: 'Invoice not found' });
    return JSON.stringify(invoice);
  },
});

export const searchPayments = tool({
  name: 'search_payments',
  description: 'Search payment records. Can filter by invoice and payment method.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      invoiceId: { type: 'string', description: 'Filter by invoice ID' },
      paymentMethod: { type: 'string', enum: ['CASH', 'CARD', 'TRANSFER', 'CHECK', 'OTHER'], description: 'Filter by payment method' },
      page: { type: 'number' },
      limit: { type: 'number' },
    },
    required: [],
  }) as const,
  execute: async (input) => {
    const args = input as SearchPaymentsArgs;
    const result = await paymentService.list({
      page: args.page || 1,
      limit: Math.min(args.limit || 10, 20),
      invoiceId: args.invoiceId,
      method: args.paymentMethod as any,
    });
    return JSON.stringify({
      payments: result.payments,
      total: result.total,
    });
  },
});

export const billingTools = [
  searchInvoices,
  getInvoiceDetails,
  searchPayments,
];
