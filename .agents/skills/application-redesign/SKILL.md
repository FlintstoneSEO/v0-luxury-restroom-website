---
name: application-redesign
description: Use for substantial redesign of authenticated admin, dashboard, portal, or workflow applications after safety boundaries are identified.
---

# application-redesign

## Activation

Use for a substantial redesign of an existing authenticated application, portal, dashboard, admin interface, review system, operational tool, or other stateful product experience. Analyze public marketing surfaces in the same project with `site-redesign`. Route isolated component fixes and routine maintenance directly to the relevant lower-level skill.

## Purpose and boundary

Improve task completion, workflow consistency, role-specific UX, information density, states, and visual clarity while preserving working business logic, authorization, data integrity, and native architecture. A redesign request is **not** permission to rewrite business rules, change stored data meaning, weaken permissions, or replace working services. Inspect before changing; document uncertain behavior and test against the baseline.

Use an audit-first mode when implementation is not yet authorized or the system's data and workflow boundaries are unclear. For complex systems, deliver the audit and a unification recommendation before a structural redesign whose business or data implications need review. Continue with authorized, independent improvements where safe.

## Required inputs

- Existing repository, running application when available, test accounts or safe fixtures for relevant roles, and local validation commands
- Stakeholder goal, primary user tasks, known constraints, and existing product vocabulary
- Access sufficient to inspect workflows, data contracts, authorization boundaries, and responsive states; record gaps explicitly

## Phased workflow

### 1. Application discovery

Inspect the native stack and inventory routes, layouts, shared shells, navigation, authentication, authorization, roles, visible database/data models, API and service layers, application state, forms, tables, dashboards, queues, modals, drawers, submissions, status systems, reusable and domain-specific components, responsive behavior, and accessibility implementation. Record initial, loading, empty, error, and completed behavior. Identify major user types, such as administrators, reviewers, applicants, customers, employees, managers, and operators, from evidence; do not assume they share a UI. Establish baseline behavior and available regression checks.

### 2. Workflow mapping

Map each significant task from entry to return path: user goal, required information, steps, decisions, validation, state changes, save points, completion condition, failure/recovery states, and exit path. Example: queue → record → documents → rubric → comments → save draft → submit → queue. Compare modules that perform the same conceptual task and flag inconsistent navigation, status, scoring, or save behavior.

### 3. Preserve / Improve / Restructure / Replace

Classify major routes, workflows, components, services, and data contracts. **PRESERVE** working architecture and behavior. **IMPROVE** sound features with weak hierarchy, accessibility, responsive behavior, or feedback. **RESTRUCTURE** duplicated or fragmented implementations when shared mechanics can be separated safely. **REPLACE** only an implementation that materially blocks usability or maintainability. Record rationale, dependencies, risk, and regression evidence for each choice. Prefer preservation and controlled refactoring.

### 4. Architecture consistency audit

Look for parallel implementations of reviews, forms, scoring, tables, navigation, statuses, detail views, save patterns, and permission handling. If two or more modules implement the same conceptual workflow, **do not independently restyle them first**. Determine whether components, hooks, services, data adapters, configuration, layouts, domain primitives, or a workflow engine should be shared. Produce a unification recommendation before divergent visual fixes. Do not refactor without understanding business rules and data implications.

For example, a shared `ReviewWorkspace`, `ReviewQueue`, `ReviewStatus`, `ReviewProgress`, `ReviewComments`, and `SubmitReview` may own mechanics while program-specific detail components own content. These names illustrate the boundary, not a required file tree.

### 5. Shared application shell

Evaluate global and sidebar navigation, top bar, breadcrumbs, page titles, module switchers, account controls, role indicators, contextual actions, notifications, and status indicators. Establish one coherent product vocabulary and navigation model across modules while preserving legitimate role differences.

### 6. Application screen composition

Specify screens around user tasks, information priority, contextual actions, status visibility, scanability, progressive disclosure, and tool-appropriate whitespace. Do not apply a marketing sequence of eyebrow → giant heading → paragraph → decorative cards to operational screens. Preserve useful density; remove empty hero-like space above work. Give headings enough width to avoid needless wrapping. Define each screen's primary task, dominant information, action placement, state variants, and mobile adaptation before implementation.

### 7. Tables, queues, and dashboards

Inspect search, filters, sorting, status, ownership, assignment, progress, row and bulk actions, pagination, empty results, and mobile behavior. Confirm dashboards support decisions and navigation to underlying work, with trustworthy labels and definitions. Preserve appropriate density and table semantics; use oversized cards only when they improve the task.

### 8. Forms

Review labels, grouping, helper text, required fields, validation, conditional fields, long-form progress, save behavior, success feedback, error recovery, and destructive or confirmation flows. Consider sections, tabs, steps, save draft, autosave, or sticky actions when the task supports them. Preserve field meaning and business validation. Add autosave only when compatible with existing persistence and conflict handling.

### 9. Review, evaluation, and approval workflows

Separate workflow mechanics from domain-specific criteria and content for reviews, scoring, approvals, assessments, moderation, and evaluations. A `ReviewWorkspace` can manage navigation, assignment, progress, draft, submission, and status while receiving application, program, and criteria data through explicit contracts. Keep rubric criteria configurable when the underlying architecture supports configuration; do not embed a program's criteria in presentation components. Verify scoring, ownership, and finalization semantics before sharing mechanics.

### 10. State design

For each major interactive screen, specify applicable initial, loading, loaded, empty, partial/in-progress, saved, unsaved, validation-error, server-error, unauthorized, disabled, submitted/completed, and archived states. Design feedback, recovery, and transitions, not just the loaded happy path.

### 11. Role-based UX

Map navigation, dashboards, assignments, administration, editing, submission, reporting, and read/write actions by role. Keep existing permission logic intact. Rendering or hiding a control never replaces backend authorization; test denied states and direct access to protected actions.

### 12. Save and submission behavior

Distinguish Save Draft from Submit. Communicate unsaved changes and save success or failure; guard against accidental loss, duplicate submissions, and irreversible actions. Confirm final submission when appropriate and display a clear completed state. Preserve existing server-side transitions and idempotency guarantees.

### 13. Responsive application UX

Plan tables, sidebars, sticky panels, multi-column workspaces, tabs, filters, action bars, dialogs, forms, and dense screens at required widths and on touch devices. Decide deliberately what stacks, scrolls, collapses, stays sticky, moves to a drawer, or simplifies. Preserve access to key data and actions; do not merely stack desktop columns.

### 14. Accessibility

Review landmarks, heading order, labels, keyboard path, focus management, dialogs, tabs, status announcements, validation messages, table semantics, contrast, touch targets, and destructive-action confirmation. Use `accessibility-audit` for detailed WCAG review and manual checks.

### 15. Visual design and implementation

Only after workflows and architecture are understood, select a visual direction, confirm any IA changes, and implement screen specifications in the native stack with `frontend-ui-builder`. Reuse the repository's typography, spacing, layout, headline wrapping, composition balance, icon, responsive, and accessibility rules in `AGENTS.md` and the relevant planning/review skills. Use one shared vocabulary for buttons, inputs, selects, tabs, badges, statuses, tables, cards, dialogs, alerts, breadcrumbs, filters, pagination, empty states, skeletons, errors, panels, sidebars, headers, and action bars. Do not create unrelated visual systems for different modules. Favor clarity over decorative novelty. Apply `art-direction-generator` for a material visual redesign, adapting its concepts to application density and interaction rather than marketing page rhythm. Use `information-architecture` for changed navigation; its public-site SEO assumptions apply only to public routes.

### 16. QA, remediation, and retest

Use `responsive-design-review`, `visual-design-review`, and `accessibility-audit` on rendered screens. Use `performance-review` and `anti-template-review` where relevant, and `technical-seo-audit` for indexable public surfaces. Adapt `website-qa` as an integrated final review, adding role, permission, workflow, regression, state, form-validation, and loading/empty/error checks. Verify important baseline behavior still works, including data writes and status transitions, using safe fixtures or test environments. Record evidence and limitations. Route blocker and high-severity issues to the earliest owning phase, fix, and rerun affected and downstream checks.

## Application Redesign Audit

Before large structural changes, produce a concise audit with:

1. Existing architecture and baseline behavior
2. User roles and permission boundaries
3. Primary workflows and completion conditions
4. Workflow inconsistencies
5. UI and shared-shell inconsistencies
6. State-management concerns
7. Data and business-logic constraints
8. Preserve / Improve / Restructure / Replace matrix
9. Recommended shared primitives and their ownership boundary
10. Proposed implementation sequence and regression checks

Use the issue format in `AGENTS.md` for actionable findings. Distinguish observed behavior from inference and unknowns. Record consequential choices in `templates/design-decision-log.md`. In audit-only mode, this audit and recommendation are the deliverable; do not imply implementation or QA has occurred.

## Implementation gate and completion

Before changing a major screen, require the audit, mapped workflows, preservation boundary, selected direction and rationale, approved IA changes when any, and an implementation-ready screen specification covering task hierarchy, states, data/actions, permissions, and responsive behavior. Resolve or visibly record missing information that affects correctness. Stop the affected change when authorization, data meaning, validation, submission semantics, or role access cannot be established safely.

After implementation, completion requires verified core journeys for each relevant role, preserved business logic and data integrity, accessible state and error behavior, responsive task completion, coherent shared UI, documented regression evidence, and remediation/retest of blockers and high-severity issues. Do not claim tests or production behavior without evidence.

## Dependencies

- `design-discovery` for missing product context
- `art-direction-generator` for material visual direction changes
- `information-architecture` for navigation and route restructuring
- `frontend-ui-builder` for native implementation
- `responsive-design-review`, `visual-design-review`, and `accessibility-audit` for rendered screens
- `performance-review` and `anti-template-review` when applicable
- `technical-seo-audit` for indexable public surfaces
- `website-qa` for integrated review, extended with application-specific regression checks

