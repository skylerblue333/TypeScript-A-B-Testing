import { createHash } from 'crypto';
import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json({ limit: '32kb' }));

const variantSchema = z.object({
  name: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_.-]+$/),
  weight: z.number().int().min(1).max(100),
});

const experimentSchema = z.object({
  name: z.string().min(1).max(128).regex(/^[a-zA-Z0-9_.-]+$/),
  variants: z.array(variantSchema).min(2).max(20),
}).superRefine((experiment, ctx) => {
  const total = experiment.variants.reduce((sum, variant) => sum + variant.weight, 0);
  if (total !== 100) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Variant weights must total 100' });
  }
  if (new Set(experiment.variants.map((variant) => variant.name)).size !== experiment.variants.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Variant names must be unique' });
  }
});

const assignmentSchema = z.object({
  user_id: z.string().min(1).max(256),
  experiment: z.string().min(1).max(128),
});

type Experiment = z.infer<typeof experimentSchema>;
export const experiments = new Map<string, Experiment>();

experiments.set('homepage-redesign', {
  name: 'homepage-redesign',
  variants: [
    { name: 'control', weight: 34 },
    { name: 'variant_a', weight: 33 },
    { name: 'variant_b', weight: 33 },
  ],
});

function assignmentBucket(experiment: string, userId: string): number {
  const digest = createHash('sha256').update(`${experiment}:${userId}`).digest();
  return digest.readUInt32BE(0) % 100;
}

function selectVariant(experiment: Experiment, userId: string): string {
  const bucket = assignmentBucket(experiment.name, userId);
  let upperBound = 0;
  for (const variant of experiment.variants) {
    upperBound += variant.weight;
    if (bucket < upperBound) return variant.name;
  }
  return experiment.variants[experiment.variants.length - 1].name;
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'sky-ab-testing' });
});

app.get('/ready', (_req, res) => {
  res.json({ ready: true });
});

app.get('/api/v1/experiments', (_req, res) => {
  res.json([...experiments.values()].sort((a, b) => a.name.localeCompare(b.name)));
});

app.post('/api/v1/experiments', (req, res) => {
  const parsed = experimentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ error: 'invalid_experiment' });
  if (experiments.has(parsed.data.name)) return res.status(409).json({ error: 'experiment_exists' });
  experiments.set(parsed.data.name, parsed.data);
  return res.status(201).json(parsed.data);
});

app.post('/api/v1/assign', (req, res) => {
  const parsed = assignmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ error: 'invalid_request' });
  const experiment = experiments.get(parsed.data.experiment);
  if (!experiment) return res.status(404).json({ error: 'experiment_not_found' });
  const variant = selectVariant(experiment, parsed.data.user_id);
  return res.json({ user_id: parsed.data.user_id, experiment: experiment.name, variant });
});

if (require.main === module) {
  app.listen(8080, () => console.log('sky-ab-testing listening on :8080'));
}

export { assignmentBucket, selectVariant };
export default app;
