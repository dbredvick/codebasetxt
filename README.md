# codebasetxt

![codebasetxt logo 90s themed retro neon](/wordart-final.png)

**Tired of copying and pasting code back and forth to use o1 Pro**?

Generate a `codebase.txt` with all the relevant code from your project that:

1. Respects `.gitignore`.
2. Skips hidden folders and certain file extensions (images, archives, etc.).
3. Optionally ingore other custom paths (`drizzle`, `node_modules`, etc.).

## Installation

```bash
npm install --global codebasetxt
```

or use `npx` without installing:

```bash
npx codebase
```

## Usage

From within your project directory, simply run:
```bash
codebasetxt
```

This will generate a `codebase.txt` containing all non-ignored files (excluding images, archives, certain file types, etc.).