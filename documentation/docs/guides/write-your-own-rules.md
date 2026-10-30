# Write your own rules

Your stack, framework, or conventions are not covered by the bundled rules? The `author-engineering-rules` skill interviews you and writes a rule set for your project, in the same format as the bundled ones.

## Start

Ask the agent, for example:

```text
Use the author-engineering-rules skill to write rules for our Angular front end.
```

The skill is bundled with the plugin, so it is available in every project.

## What happens

1. **Mode.** New stack, extension of an installed stack, or checks only. If you only want the bundled NestJS or Vue rules as they are, it points you to [`/rules-install`](./install-rules).
2. **Stack identity.** Folder name, description, `detect` dependencies, and review marker.
3. **Themes, one at a time.** Architecture, Code Patterns, Libraries, Testing, plus any theme you add. For each one it asks questions and collects evidence: a good example, a bad example, documentation links, internal documents, and accepted exceptions.
4. **File plan, drafts, approval.** It proposes the files, shows each draft, and writes only what you approve.
5. **Checks.** It derives short, file-bound checklists from the `MUST` and `MUST NOT` rules.
6. **Validation.** It runs the `rules_check` tool and fixes the errors.

Rule files are written in English. The interview follows your language.

## Result

Rules are written under `.opencode/rules/<stack>/`, with the same layout as the bundled stacks:

```text
.opencode/rules/angular/
  README.md            # description, detect, review-marker
  architecture/        # decision records
  engineering-rules/   # detailed rules by theme
  checks/              # short checklists bound to file globs
```

A rule that cannot be justified with evidence stays `Proposed` and uses `SHOULD` wording, so agents do not treat it as mandatory.

## Detect and scope

A stack is applied to files whose nearest `package.json` declares one of its `detect` dependencies. For a stack outside the JavaScript ecosystem, or for conventions that span the repository, omit `detect`: the stack applies to every file, so keep its globs specific (`**/*.java`, `**/migrations/**`).

## Finish

- Run `rules_check` again after any manual edit.
- Commit `.opencode/rules/` through a pull request, like code.
- Run [`/ocr-rules`](./ocr-rules) so the code review applies the same checks.

To adjust rules later, see [Customize the rules](./customize-rules). For the format of checks, see [Engineering rules](../concepts/engineering-rules).
