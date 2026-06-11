# Contributing to FieldedText TypeScript Library

Thank you for your interest in contributing to the FieldedText TypeScript library! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

This project follows a simple code of conduct:

- Be respectful and constructive
- Focus on the code and ideas, not individuals
- Help create a welcoming environment for all contributors

## Getting Started

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 9 or higher
- **Git**: For version control
- **Code Editor**: VS Code recommended (TypeScript support)

### Setting Up Development Environment

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-org/fielded-text-web.git
   cd fielded-text-web
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Build the project**:

   ```bash
   npm run build
   ```

4. **Run tests**:

   ```bash
   npm test
   ```

5. **Verify compliance tests**:

   ```bash
   npm run test:compliance
   ```

### Project Structure

See file source-organisation.md

## Development Workflow

### Branch Strategy

- `main` - Stable, production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual feature branches
- `fix/*` - Bug fix branches

### Making Changes

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes** following coding standards

3. **Run tests frequently**:

   ```bash
   npm run test:watch
   ```

4. **Ensure all tests pass**:

   ```bash
   npm test
   npm run test:compliance
   ```

5. **Build successfully**:

   ```bash
   npm run build
   ```

6. **Commit your changes** with clear messages:

   ```bash
   git commit -m "feat: add support for custom field types"
   ```

### Commit Message Format

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `chore:` - Build process or tooling changes

Example:

```text
feat: add JSON metadata serialization

- Implement JsonMetaSerializationReader
- Implement JsonMetaSerializationWriter
- Add comprehensive tests
- Update documentation
```

## Coding Standards

### TypeScript Style

1. **Strict TypeScript**:
   - All code must pass `tsc --noEmit`
   - Use `strict: true` mode
   - Avoid `any` unless absolutely necessary (with comment explaining why)

2. **Naming Conventions**:
   - Classes: `PascalCase` (e.g., `FtMeta`, `SerializationReader`)
   - Interfaces: `PascalCase` (e.g., `MetaConstructor`)
   - Methods: `camelCase` (e.g., `loadMeta`, `createField`)
   - Properties: `camelCase` (e.g., `fieldList`, `delimiterChar`)
   - Constants: `UPPER_SNAKE_CASE` or `camelCase` for const
   - Private members: `_camelCase` with `private` keyword

3. **File Naming**:
   - Use **kebab-case** for file names (e.g., `ft-meta.ts`, `serialization-reader.ts`)
   - One class per file (with closely related types)
   - File name matches primary class name in kebab-case

4. **Import Extensions**:
   - Always use `.js` extensions in imports:

     ```typescript
     import { FtMeta } from './ft-meta.js';
     ```

   - This is required for ESM with NodeNext module resolution

5. **ESM Only**:
   - Use `import`/`export`, never `require`/`module.exports`
   - No default exports (use named exports)
   - Export from `index.ts` for public API

### Code Formatting

- **Indentation**: 2 spaces
- **Line Length**: 100 characters preferred, 120 maximum
- **Semicolons**: Required
- **Quotes**: Single quotes for strings, double for JSX
- **Trailing Commas**: Required in multiline arrays/objects

### Type Safety

1. **Prefer interfaces over type aliases** for object shapes
2. **Use readonly** for immutable properties
3. **Avoid type assertions** (`as`) unless necessary
4. **Use generics** for reusable type-safe code
5. **Prefer union types** over enums where appropriate

### Best Practices

1. **Error Handling**:
   - Throw descriptive errors
   - Use custom error classes where appropriate
   - Document error conditions in JSDoc

2. **Comments**:
   - Use JSDoc for public APIs
   - Inline comments for complex logic only
   - Keep comments up-to-date with code

3. **Platform Independence**:
   - Never import `node:fs`, `node:path` in core library
   - Use Web Streams API in core, not Node.js streams
   - Put Node-specific code in `ft-node-*.ts` files

## Testing Guidelines

### Test Organization

- **Unit Tests**: `tests/*.test.ts` - One test file per source file or logical group
- **Compliance Tests**: `tests/compliance/*.test.ts` - Standards compliance
- **Integration Tests**: `tests/integration/*.test.ts` - End-to-end scenarios

### Writing Tests

1. **Use Vitest**:

   ```typescript
   import { describe, it, expect } from 'vitest';

   describe('FtMeta', () => {
     it('should create meta with default values', () => {
       const meta = new FtMeta();
       expect(meta.culture).toBe('');
     });
   });
   ```

2. **Test Coverage**:
   - Aim for high coverage (>90%)
   - Test happy path and error cases
   - Test edge cases and boundary conditions

3. **Test Naming**:
   - Use descriptive test names
   - Start with `should` for clarity
   - Be specific about what is being tested

4. **Arrange-Act-Assert**:

   ```typescript
   it('should parse CSV with quoted fields', () => {
     // Arrange
     const meta = buildMetadata();
     const csvData = '"John Doe","30"';

     // Act
     const reader = new SerializationReader();
     reader.loadMeta(meta);
     reader.open(csvData);
     const success = reader.read();

     // Assert
     expect(success).toBe(true);
     expect(reader.fieldList[0].asString).toBe('John Doe');
   });
   ```

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Compliance tests only
npm run test:compliance

# Generate compliance report
npm run compliance:baseline
```

### Test Fixtures

Place test data files in `tests/fixtures/`:

- CSV files
- XML metadata files
- JSON metadata files

Keep fixtures small and focused.

## Documentation

### JSDoc Comments

All public APIs must have JSDoc comments:

````typescript
/**
 * Represents metadata for a fielded text file.
 *
 * This class defines the structure, formatting, and parsing rules for
 * delimited or fixed-width text files.
 *
 * @example
 * ```typescript
 * const meta = new FtMeta();
 * meta.culture = DotNetLocaleSettings.createInvariant();
 * meta.delimiterChar = ',';
 * ```
 */
export class FtMeta {
  /**
   * The culture/locale identifier (e.g., 'en-US', 'fr-FR' or invariant).
   *
   * Affects number and date formatting, string comparison, and boolean parsing.
   *
   * @default ''
   */
  culture: DotNetLocaleSettings; // Default is invariant

  /**
   * Creates a new field definition of the specified type.
   *
   * @param dataType - The data type for the field
   * @returns A new field metadata instance
   *
   * @example
   * ```typescript
   * const field = meta.fieldList.new(FtDataType.String);
   * field.name = 'CustomerName';
   * ```
   */
  createField(dataType: FtDataType): FtMetaField {
    // ...
  }
}
````

### Documentation Tags

Use these JSDoc tags:

- `@param` - Parameter description
- `@returns` - Return value description
- `@throws` - Error conditions
- `@example` - Usage example
- `@see` - Related items
- `@deprecated` - Deprecated APIs

### User Guide

When adding features, update the relevant guide in `docs/guide/`:

- `getting-started.md` - Basic setup and first operations
- `reading.md` - Reading operations
- `writing.md` - Writing operations
- `metadata.md` - Metadata system
- `advanced.md` - Advanced topics

### Examples

When adding significant features, consider adding an example in `examples/`:

1. Create directory `examples/my-feature/`
2. Add `index.ts` with runnable code
3. Add `README.md` explaining the example
4. Update `examples/README.md` to list the new example

## Submitting Changes

### Pull Request Process

1. **Ensure tests pass**:

   ```bash
   npm test
   npm run test:compliance
   npm run build
   ```

2. **Update documentation**:
   - Add/update JSDoc comments
   - Update user guides if needed
   - Add example if appropriate

3. **Create pull request**:
   - Clear title and description
   - Reference related issues
   - List breaking changes if any

4. **Code review**:
   - Address review comments
   - Keep discussion focused and constructive

5. **Merge**:
   - Squash commits if requested
   - Ensure CI passes

### Pull Request Checklist

- [ ] Tests pass (`npm test`)
- [ ] Compliance tests pass (`npm run test:compliance`)
- [ ] Build succeeds (`npm run build`)
- [ ] JSDoc comments added/updated
- [ ] User guide updated (if needed)
- [ ] Example added (if appropriate)
- [ ] No breaking changes (or documented)
- [ ] Commit messages follow convention

## Release Process

### Version Numbering

Follow Semantic Versioning (semver):

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backward compatible
- **Patch** (0.0.1): Bug fixes, backward compatible

### Release Steps

1. **Update version** in `package.json`
2. **Update CHANGELOG.md** with changes
3. **Run full test suite**:

   ```bash
   npm test
   npm run test:compliance
   ```

4. **Build**:

   ```bash
   npm run build
   ```

5. **Tag release**:

   ```bash
   git tag -a v0.1.0 -m "Release v0.1.0"
   git push origin v0.1.0
   ```

6. **Publish** (if applicable):

   ```bash
   npm publish
   ```

## Getting Help

- **Issues**: Report bugs or request features on GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions
- **Standard**: Refer to [FieldedText Standard v0.9](https://www.fieldedtext.org)
- **C# Library**: Reference [C# implementation](https://pbkware.klink.au/fielded-text/c-sharp-library/index.html)

## Recognition

Contributors will be recognized in:

- `README.md` acknowledgments section
- Git commit history
- Release notes

Thank you for contributing to FieldedText TypeScript!
