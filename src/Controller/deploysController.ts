import type { Request, Response } from 'express'

type Deploy = { sha: string; message: string; date: string; url: string }

type GitHubCommit = {
  sha: string
  html_url: string
  commit: { message: string; author: { date: string } | null }
}

const CACHE_MS = 10 * 60_000
const GITHUB_TIMEOUT_MS = 5000

let cache: { at: number; data: Deploy[] } | null = null

async function fetchCommits(repo: string): Promise<Deploy[]> {
  const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=5`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-api' },
    signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`GitHub answered ${res.status}`)

  const commits = (await res.json()) as GitHubCommit[]
  return commits.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split('\n')[0],
    date: c.commit.author?.date ?? '',
    url: c.html_url,
  }))
}

export async function getDeploys(_req: Request, res: Response) {
  const repo = process.env.GITHUB_REPO
  if (!repo) return res.json({ success: true, deploys: [] })

  if (cache && Date.now() - cache.at < CACHE_MS) {
    return res.json({ success: true, deploys: cache.data })
  }

  try {
    const data = await fetchCommits(repo)
    cache = { at: Date.now(), data }
    res.json({ success: true, deploys: data })
  } catch (err) {
    console.error('Could not load commits from GitHub:', err)
    res.json({ success: true, deploys: cache?.data ?? [] })
  }
}
