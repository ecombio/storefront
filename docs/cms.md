# CMS

This document describes how content is managed for the project, independent of any specific tool. It covers what counts as content, who owns it, how it moves from draft to published, and the rules that keep it consistent. Tool-specific setup belongs in its own doc (for example, `terminal-cms.md`).

## Purpose

- Keep all editorial and site content in one managed system, separate from application code
- Let non-developers publish and update content safely
- Make content structured, searchable, reusable, and easy to audit

## Scope

**In scope:** blog posts, pages, navigation menus, media files, legal and policy pages, SEO metadata, translations, and structured content entries (author bios, FAQs, banners).

**Out of scope:** application code, transactional data, and user accounts. These are managed elsewhere.

## Content model

Every content type has a defined set of fields. Add or change a type only through the process in "Change management" below.

| Type             | Key fields                                                                                                   | Notes                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| Post             | title, handle, author, summary, body, featured image, tags, SEO title, SEO description, publish date, status | Handle is the permanent URL slug   |
| Page             | title, handle, body, SEO fields, status                                                                      | Evergreen content                  |
| Menu             | title, handle, ordered items (label, target)                                                                 | Changes affect the whole site      |
| Media file       | file, alt text, usage notes                                                                                  | Alt text is required               |
| Policy page      | title, body, last reviewed date                                                                              | Reviewed on a schedule             |
| Structured entry | defined per entry type                                                                                       | Examples: author, FAQ item, banner |

### Field rules

- **Titles:** sentence case or title case, applied consistently, no trailing punctuation
- **Handles/slugs:** lowercase, hyphen-separated, short, and never changed after publication without a redirect
- **SEO title:** about 60 characters or fewer; **SEO description:** about 155 characters or fewer
- **Alt text:** describes the image's purpose, not just its appearance
- **Tags:** drawn from the approved tag list (see "Taxonomy")

## Taxonomy

Tags and categories are controlled vocabularies, not free text.

- One canonical spelling and casing per tag (for example, `Electric Scooters`, not `electric-scooters` or `electric scooter`)
- No duplicate or near-duplicate tags; merge instead of adding a variant
- Keep the approved list in one place and review it quarterly
- A post should have a small number of relevant tags, not every possible one

## Roles

| Role      | Responsibilities                                                   |
| --------- | ------------------------------------------------------------------ |
| Author    | Writes drafts, supplies metadata and media                         |
| Editor    | Reviews content, enforces style and taxonomy, approves publication |
| Publisher | Schedules and publishes approved content                           |
| Admin     | Manages content types, permissions, integrations, and credentials  |

One person may hold several roles. Publishing rights should be limited to those who need them.

## Workflow

1. **Draft:** author creates content with all required fields
2. **Review:** editor checks accuracy, style, links, SEO fields, alt text, and tags
3. **Approve:** editor signs off
4. **Publish:** content goes live, immediately or on schedule
5. **Maintain:** content is reviewed periodically, and updated or archived when outdated

Content is never deleted without a reason. Prefer archiving or unpublishing, and add a redirect when a URL is retired.

## Bulk and automated changes

Scripted or bulk edits are allowed but follow stricter rules:

- Use a preview (dry run) step that lists every change before anything is written
- Apply changes only after the preview has been reviewed
- Verify the result with a follow-up read
- Use credentials with the minimum permissions the job needs
- Never store credentials in the repository or paste them into chats, tickets, or screenshots
- Record significant bulk changes (what, when, why) in the change log

## Quality checklist (before publishing)

- [ ] Title, handle, and summary are set
- [ ] Author is assigned
- [ ] SEO title and description are written and within length guidelines
- [ ] Featured image and all images have alt text
- [ ] Tags come from the approved list
- [ ] Internal and external links work
- [ ] Content is proofread and fact-checked
- [ ] Layout is checked on mobile and desktop

## Change management

Changes to the content model, taxonomy, or workflow:

1. Propose the change with its reason and the content it affects
2. Check for dependencies (templates, code, integrations, redirects)
3. Get approval from an Admin
4. Apply it, then update this document

## Governance

- **Content owner:** responsible for overall accuracy and direction
- **Review cadence:** policy pages every 6 to 12 months, evergreen content annually, tag list quarterly
- **Access reviews:** check who has publishing and admin access each quarter
- **Backups and history:** keep version history where the system supports it, and export content on a regular schedule

## Change log

| Date | Change | Author |
| ---- | ------ | ------ |
|      |        |        |
