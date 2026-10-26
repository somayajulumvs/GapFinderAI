# GapFinder

GapFinder is a diagnosis-first study workspace. It helps a student see which syllabus topics need attention, practice with cited questions, and focus revision time on the largest gaps.

## Run the demo

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The preloaded workspace is **Maya S. · Biology, Grade 12**. There is no login or password in this prototype; authentication and personal accounts are not implemented.

## What works in this prototype

- Navigate the overview, topic map, materials library, revision plan, and progress views.
- Take a three-question biology diagnostic. Each sample question links to a section in the bundled notes and explains the answer after submission.
- Update the confidence score for each topic answered correctly or incorrectly. Scores and plan check-offs live only in client state and reset on refresh.
- Choose PDF or text files and see their names in the current session. The browser does not upload, parse, or save the selected files.
- Explore the included original sample files in `public/sample-biology-syllabus.txt`, `public/sample-cell-biology-notes.txt`, and `public/sample-biology-practice.txt`.

The sample diagnostic is a fixed question bank. It is not generated from retrieved passages, and its illustrative historical progress values are not evidence of real student performance.

## Architecture

```text
Next.js App Router
  app/page.tsx                  Route entry
  app/gapfinder-dashboard.tsx   Interactive demo workspace and sample state
  app/globals.css               Responsive UI styles
  public/sample-*.txt           Bundled, original example study material

Planned connected services
  Auth -> private document storage -> text extraction -> chunking/embeddings
  -> vector retrieval -> grounded question/answer generation -> evaluation
  -> topic mastery -> prioritized revision plan -> progress history
```

The current repository contains the first, front-end-only part of this architecture. It has no database, API routes, vector store, authentication provider, or LLM integration. No secrets or personal data are required to run the prototype.

## Intended grounded-AI workflow

1. Extract text and page/section metadata from a student's syllabus, notes, and papers. Keep each source private to its owner.
2. Split text into overlapping chunks that preserve headings and page references; create embeddings and store them with document and topic metadata.
3. For a quiz or explain-topic request, retrieve relevant chunks first. Only pass those chunks, their stable citation IDs, and the task to the model. Do not treat model memory as a source.
4. Generate questions and explanations constrained to retrieved evidence. Validate that every question has a source citation and reject unsupported output.
5. Evaluate answers against the retrieved evidence and a rubric; retain per-topic results with confidence and evidence, rather than letting a fluent explanation alone determine mastery.
6. Aggregate results into weak/building/strong topics, show the evidence behind a rating, and prioritize plan items by weakness, exam relevance, and available study time.
7. Recompute topic confidence and the plan after each new diagnostic. Persist an attempt history so progress views reflect measured results.

This is the target workflow, not an implemented RAG pipeline. In particular, this demo's cited question bank is authored sample content, not a model response to a vector search.

## Security and privacy

The prototype handles no account credentials and does not send selected files anywhere. A production version must enforce per-user access on every document and retrieval query, keep provider keys on the server, validate file type and size, scan uploads, and provide deletion/retention controls. Do not present demo data as a real diagnosis.

## Limitations and next steps

- Add sign-in and per-user document storage before handling real student materials.
- Add PDF/text extraction, chunking, embeddings, vector retrieval, and citation-preserving API contracts.
- Integrate a server-side model provider for grounded question generation, answer evaluation, and explain-topic responses; include unsupported-answer fallbacks and evaluation tests.
- Replace sample topic scores and static trend data with persisted, evidence-backed attempts. Tune mastery thresholds with educators.
- Add class-level teacher views, multi-subject support, spaced repetition, LMS integrations, and accessibility/usability testing.

## Checks

```bash
npm run lint
npm run build
```