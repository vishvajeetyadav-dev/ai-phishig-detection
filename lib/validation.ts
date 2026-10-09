import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const urlAnalysisSchema = z.object({
  url: z
    .string()
    .min(1, 'Please enter a URL')
    .max(2000, 'URL is too long')
    .refine((val) => {
      const trimmed = val.trim();
      if (!trimmed) return false;
      // Prepend https:// only when the user omitted a protocol. If a protocol
      // is supplied, it must explicitly be HTTP or HTTPS.
      const hasProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
      if (hasProtocol && !/^https?:\/\//i.test(trimmed)) return false;

      const withProtocol = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : 'https://' + trimmed;

      try {
        const parsed = new URL(withProtocol);
        return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && !!parsed.hostname;
      } catch {
        return false;
      }
    }, 'Please enter a valid URL'),
});

export const messageAnalysisSchema = z.object({
  message: z
    .string()
    .min(1, 'Please enter a message to analyze')
    .max(10000, 'Message is too long (maximum 10,000 characters)'),
});
