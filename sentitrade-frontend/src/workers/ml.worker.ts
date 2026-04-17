import { pipeline, env } from '@xenova/transformers';

// Skip local model checks, use HuggingFace CDN
env.allowLocalModels = false;

class PipelineFactory {
    static task = 'feature-extraction';
    static model = 'Supabase/bge-small-en';
    static instance: any = null;

    static async getInstance(progress_callback: any) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { 
                progress_callback,
                quantized: true // Use compressed int8 weights for browser CPU
            });
        }
        return this.instance;
    }
}

// Simple Named Entity Recognition mapping based on keywords since we use embeddings
// In a true production app, we would use a dedicated token-classification model
const MOCK_NER_KEYWORDS = ['NVDA', 'BTC', 'SPY', 'GOLD', 'OIL', 'TSLA', 'ETH', 'AAPL'];

self.addEventListener('message', async (event) => {
    // We only process 'analyze' requests
    if (event.data.type !== 'analyze') return;
    
    const text = event.data.text;
    const id = event.data.id;

    try {
        // 1. Get model instance
        const extractor = await PipelineFactory.getInstance((e: any) => {
            self.postMessage({ type: 'progress', data: e });
        });

        // 2. Perform embedding extraction (example of complex NLP in browser)
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        
        // Convert Float32Array to standard array for postMessage serialization
        const embedding = Array.from(output.data);

        // 3. Simple Keyword NER Extractor (fallback)
        const entities = MOCK_NER_KEYWORDS.filter(k => text.toUpperCase().includes(k));

        // 4. Send analysis back
        self.postMessage({
            type: 'result',
            id: id,
            result: {
                embedding,
                entities,
                originalText: text
            }
        });

    } catch (err: any) {
        self.postMessage({
            type: 'error',
            id: id,
            error: err.message
        });
    }
});
