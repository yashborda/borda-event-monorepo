# Smart Grouped Commit

You are performing a smart grouped commit. Follow these exact steps:

## Step 1 — Ask About Branch

Ask the user: **"Do you want to commit to the current branch (`{current_branch}`) or create a new branch?"**

First, run `git branch --show-current` to get the current branch name and show it in the question.

Present two choices:

1. Commit to the current branch
2. Create a new branch (ask for branch type and ticket number)

Wait for the user's answer before proceeding.

## Step 2 — Create Branch (if chosen)

If the user wants a new branch, ask **two follow-up questions in a single message**:

1. **Branch type** — present three choices: `feature`, `bugfix`, `hotfix`
2. **Ticket number** — ask for a ticket number (e.g. `BE-28`). Make clear it is optional; the user can skip it.

Then:

- Suggest a branch name based on the staged/unstaged changes using the format:
  - With ticket: `<type>/<ticket-number>-<short-description>` (e.g. `hotfix/BE-28-japan-blogs-setup`)
  - Without ticket: `<type>/<short-description>` (e.g. `bugfix/blog-editor-paste-issue`)
- Confirm the name with the user or use what they provide
- Run: `git checkout -b <branch-name>` (branches are normally cut from `development`, the default PR base for this repo — mention this if the user is currently on a different branch)

Store the ticket number (if provided) — it will be prepended to every commit message in Step 5.

## Step 3 — Analyse Changes

Run `git status --short` and `git diff --name-only HEAD` to see all modified, added, and deleted files.

Group the files logically by area. Typical groupings for this project (single Next.js app):

- **src/app/(main)/<feature>/** — each CMS feature module as its own group (e.g. `blogs`, `blog-categories`, `faqs`, `payout-stories`, `users`, `trading-rules`, `json-configs`)
- **src/components/** — shared components together (`ui/`, `data-table/`, `guards/`)
- **src/services/** + **src/types/** — API service and type changes together (or with the feature that uses them, if specific to it)
- **src/hooks/**, **src/stores/**, **src/lib/**, **src/providers/** — shared logic, grouped with the feature they serve or on their own if cross-cutting
- **src/server/**, **src/app/api/** — server/API route changes together
- Config files (`next.config.mjs`, `biome.json`, `package.json`, `tsconfig.json`, etc.) as their own group

## Step 4 — Show the Grouping Plan

Present the proposed grouping to the user as a numbered list before doing anything. Ask them to confirm or adjust. Example:

```
Proposed commits:
1. src/app/(main)/blogs — Japan locale support in blog form and list
2. src/services + src/types — blog API params and types for locale filter
3. src/components/ui — shared select component tweak

Proceed with this grouping? (yes / adjust)
```

Wait for confirmation.

## Step 5 — Commit Each Group

For each group **in order**:

1. `git add <files in this group>`
2. Write a concise conventional-commit message (feat/fix/refactor/chore) that explains WHY, not just what changed
3. If a ticket number was provided, prepend it to the message:
   - With ticket: `BE-12 feat(scope): Description Here`
   - Without ticket: `feat(scope): Description Here`
4. Commit using: `git commit -m "<message>"`
5. **Do NOT add any `Co-Authored-By` line** — commits must appear only under the user's git identity

## Step 6 — Confirm

Run `git log --oneline -6` and show the result so the user can verify all commits landed correctly.

## Step 7 — Push

Push the branch to the remote:

- If the branch has no upstream yet, run: `git push -u origin <branch-name>`
- If it already tracks a remote, run: `git push`

Show the output so the user can see the remote URL and confirm the push succeeded.

## Rules

- Never add `Co-Authored-By: Claude` or any Claude attribution to commits
- Always use the repo's existing git `user.name` and `user.email` — never override them
- Commit messages follow Conventional Commits: `type(scope): description`
- Use Title Case for the description part of commit messages
- If a ticket number was given, it is always the very first token in the commit message: `TICKET type(scope): Description`
- One logical change per commit — don't mix unrelated files in the same commit