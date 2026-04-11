import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email too long')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password too long'),
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name contains invalid characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email too long')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['patient', 'doctor', 'admin'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const mriResponseSchema = z.object({
  id: z.string().uuid(),
  confidence: z.number().min(0).max(100),
  modelAccuracy: z.number().min(0).max(100),
  classification: z.enum(['Low', 'Early', 'Moderate', 'High']),
  heatmapData: z.array(z.array(z.number())),
  findings: z.array(z.string()),
  metadata: z.object({
    scan_id: z.string(),
    model_version: z.string(),
    device_inference: z.string(),
  }),
});

export const speechResponseSchema = z.object({
  id: z.string().uuid(),
  classification: z.enum(['Low', 'High']),
  confidence: z.number().min(0).max(100),
  modelAccuracy: z.number().min(0).max(100),
  transcript: z.string().nullable(),
  features: z.object({
    jitter: z.number().nullable(),
    shimmer: z.number().nullable(),
    pitch: z.number(),
    pauseDuration: z.number(),
    spectralCentroid: z.number(),
  }),
});

export const riskResponseSchema = z.object({
  overallRisk: z.number().min(0).max(100),
  classification: z.enum(['Low', 'Moderate', 'High']),
  recommendation: z.string(),
  confidence: z.number().nullable(),
});

export const patientSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().int().min(0).max(150),
  gender: z.enum(['M', 'F', 'Other']).optional(),
  condition: z.string().optional(),
  riskLevel: z.string().optional(),
  status: z.string().optional(),
  lastConsultation: z.string().optional(),
});

export const patientsListResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  count: z.number().int().nonnegative(),
  data: z.array(patientSchema),
  source: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type MRIResponse = z.infer<typeof mriResponseSchema>;
export type SpeechResponse = z.infer<typeof speechResponseSchema>;
export type RiskResponse = z.infer<typeof riskResponseSchema>;
export type Patient = z.infer<typeof patientSchema>;
