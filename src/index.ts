import express from 'express';
import { z } from 'zod';

const app = express();
app.use(express.json());

// Feature flag and A/B test assignment engine

const experimentSchema = z.object({
  user_id: z.string(),
  experiment: z.string()
});

const experiments: Record<string, string[]> = {
  'homepage-redesign': ['control', 'variant_a', 'variant_b'],
  'checkout-flow': ['control', 'simplified']
};

app.post('/api/v1/assign', (req, res) => {
  try {
    const { user_id, experiment } = experimentSchema.parse(req.body);
    const variants = experiments[experiment];
    if (!variants) return res.status(404).json({ error: 'Experiment not found' });
    const hash = user_id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const variant = variants[hash % variants.length];
    res.json({ user_id, experiment, variant });
  } catch (e) {
    res.status(400).json({ error: 'Invalid request' });
  }
});


app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'TypeScript-A-B-Testing', version: '3.0.0' });
});

if (require.main === module) {
  app.listen(8080, () => console.log('TypeScript-A-B-Testing running on :8080'));
}

export default app;
