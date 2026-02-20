import { patientTools } from './patient.tools';
import { appointmentTools } from './appointment.tools';
import { departmentTools } from './department.tools';
import { clinicalTools } from './clinical.tools';
import { billingTools } from './billing.tools';

export const allTools = [
  ...patientTools,
  ...appointmentTools,
  ...departmentTools,
  ...clinicalTools,
  ...billingTools,
];
