import type { Tensor } from "@xenova/transformers"
let embedder: any | null = null

async function getEmbedder() {
  if (embedder) return embedder
  const { pipeline } = await import("@xenova/transformers")
  // all-MiniLM-L6-v2: 384-dim sentence embeddings
  embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")
  return embedder
}

function meanPool(tensor: Tensor): number[] {
  // tensor shape: [1, tokens, dims]
  const data = tensor.data as Float32Array | number[]
  const dims = (tensor.dims && tensor.dims[2]) || 384
  const tokens = (tensor.dims && tensor.dims[1]) || (data.length / dims)
  const out = new Array(dims).fill(0)
  for (let t = 0; t < tokens; t++) {
    const offset = t * dims
    for (let d = 0; d < dims; d++) out[d] += (data as any)[offset + d]
  }
  const denom = tokens || 1
  for (let d = 0; d < dims; d++) out[d] /= denom
  return out
}

export async function embedText(text: string): Promise<number[]> {
  const e = await getEmbedder()
  const output: Tensor | Tensor[] = await e(text, { normalize: true })
  const tensor = Array.isArray(output) ? output[0] : output
  return meanPool(tensor)
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const e = await getEmbedder()
  const outputs: (Tensor | Tensor[])[] = await e(texts, { normalize: true, batch_size: 8 })
  const tensors = Array.isArray(outputs) ? outputs : [outputs]
  return tensors.map((t) => meanPool(Array.isArray(t) ? t[0] : t))
}