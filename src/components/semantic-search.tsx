"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export function SemanticSearch({ userId }: { userId: string }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSearch = async () => {
    setLoading(true)
    setError(null)
    setResults([])
    try {
      const res = await fetch("/api/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, query, topK: 8 }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Search failed")
      setResults(json.matches || [])
    } catch (e: any) {
      setError(e?.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Semantic Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Ask or search your files by meaning..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={runSearch} disabled={loading || !query.trim()}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <ul className="space-y-2">
          {results.map((r, idx) => (
            <li key={idx} className="p-2 rounded border">
              <div className="text-xs text-gray-500">score: {r.score?.toFixed?.(4)}</div>
              <div className="whitespace-pre-wrap text-sm">{r.content}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}