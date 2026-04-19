import simpleGit, { type LogResult, type DefaultLogFields } from "simple-git";
import { getDocsRoot } from "./docs";

function getGit() {
  return simpleGit(getDocsRoot());
}

export interface CommitEntry {
  hash: string;
  hashShort: string;
  date: string;
  message: string;
  author: string;
}

export async function getFileHistory(relPath: string, maxCount = 30): Promise<CommitEntry[]> {
  const git = getGit();
  try {
    const log: LogResult<DefaultLogFields> = await git.log({
      file: relPath,
      maxCount,
    });
    return log.all.map((entry) => ({
      hash: entry.hash,
      hashShort: entry.hash.slice(0, 7),
      date: entry.date,
      message: entry.message,
      author: entry.author_name,
    }));
  } catch {
    return [];
  }
}

export async function getFileDiff(relPath: string, hash: string): Promise<string> {
  const git = getGit();
  try {
    const diff = await git.diff([`${hash}~1`, hash, "--", relPath]);
    return diff || "(差分なし)";
  } catch {
    // First commit case - show the whole file at that commit
    try {
      const content = await git.show([`${hash}:${relPath}`]);
      return `+++ ${relPath}\n` + content.split("\n").map((l) => `+ ${l}`).join("\n");
    } catch {
      return "(差分を取得できませんでした)";
    }
  }
}
