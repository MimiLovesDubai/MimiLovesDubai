import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Naam is verplicht").max(120),
  description: z.string().trim().max(2000).optional().default(""),
});

export const documentSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  content: z.string().max(200_000).optional().default(""),
});

export const conversationSchema = z.object({
  agentId: z.string().uuid(),
  projectId: z.string().uuid().nullable().optional(),
});

export const chatSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().trim().min(1, "Bericht is leeg").max(20_000),
});

export const taskSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(2000).optional().default(""),
  projectId: z.string().uuid().nullable().optional(),
});

export const taskStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["todo", "doing", "done"]),
});

export const generateTasksSchema = z.object({
  conversationId: z.string().uuid(),
});

export const promptSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(60).default("algemeen"),
  content: z.string().trim().min(1).max(10_000),
});

export const checkoutSchema = z.object({
  plan: z.enum(["pro", "agency"]),
});
