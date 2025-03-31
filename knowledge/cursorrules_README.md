# Cursor Project Rules

This directory contains project-specific rules for the Cursor IDE's AI assistant. These rules help ensure consistent, high-quality behavior aligned with the standards of this codebase.

## 📁 Structure

Each `.mdc` file in this folder defines a set of guidelines for the AI. They are automatically applied based on the file patterns (globs) specified in each rule file.

### Files:

- `project_standards.mdc`: General tone, professionalism, and coding expectations.
- `feature_workflow.mdc`: Workflow for implementing new features using `implementation-plan.mdc`.
- `editing_behavior.mdc`: File-by-file editing flow and user interaction behavior.
- `code_quality.mdc`: Guidelines for performance, error handling, testing, and clean code.
- `compatibility.mdc`: Ensures framework compatibility and restricts unnecessary dependencies.

## 🛠️ Maintaining Rules

- Keep rules concise and specific.
- Group rules by logical function or theme.
- Use `globs` to control which files each rule applies to.
- Test rules by editing files they target—Cursor should apply them automatically.

## ➕ Adding New Rules

1. Create a new `.mdc` file in this directory.
2. Add `name`, `description`, and `globs` fields.
3. Separate metadata from rules using a line with `---`.
4. Add your rules as bullet points.

## 📌 Example Format

```md
name: Example Rule
description: This rule applies to API utilities.
globs: ["src/api/**/*.ts"]

---

- Always include error handling in API functions.
- Use async/await, not .then().
```

---

Questions? Contact the team maintainer or refer to [Cursor Docs](https://docs.cursor.com/context/rules-for-ai) for more.
