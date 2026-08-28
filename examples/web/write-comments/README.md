---
title: Write Comments
---

# Write Comments Example

This [example](#code) demonstrates how to add comment lines to fielded text output for documentation, metadata, and organization.

## What it does

1. Deserializes metadata from an XML string with `LineCommentChar="#"`
2. Uses `writeComment()` to add comment lines throughout the file
3. Writes heading and data records interspersed with comments
4. Shows different comment use cases (header, section markers, footer)

## Running the example

```bash
npx tsx examples/write-comments/index.ts
```

## Expected output

```text
Writing CSV with comments:
=========================

Generated CSV:
==============
# ====================================
# Customer Data Export
# ====================================
#
# Generated: 2024-01-01T12:00:00.000Z
# Generator: FieldedText TypeScript Library
# Format: CSV (Comma-Separated Values)
#
# --- Active Customers ---
Customer Name,Age
John Doe,30
Jane Smith,25
#
# --- Inactive Customers ---
Bob Johnson,45
#
# End of customer data
# Total records: 3

Key observations:
- Comments start with # (defined by lineCommentChar)
- Comments can appear anywhere in the file
- Comments are ignored when reading
- Comments are useful for documentation and metadata
```

## Key concepts

- **Meta deserialization**: Load metadata from XML text with `FtXmlMetaSerialization.deserialize()`
- **Line Comment Character**: Set via `meta.lineCommentChar` (e.g., "#", "//", ";")
- **writeComment()**: Adds a comment line prefixed with the comment character
- **Comment Placement**: Comments can appear before, between, or after data records
- **Reading**: Comments are automatically skipped during reading
- **Documentation**: Comments help explain file contents and format

## Use Cases

**File headers:**

- Generation timestamp
- Tool/version information
- Data source
- Copyright notices

**Section markers:**

- Separate logical sections
- Mark data boundaries
- Add structure to long files

**Data annotations:**

- Notes about specific records
- Warnings or special conditions
- Metadata about following records

**Footer information:**

- Record counts
- Checksums
- Processing notes

## Comment Characters

Common comment characters by format:

- **CSV**: `#` or `//`
- **Configuration files**: `#`, `;`, or `//`
- **SQL-style**: `--`
- **C-style**: `//` (single-line comments only)

Set your comment character based on your file format and reader compatibility.

## Code

{@includeCode ./index.ts}
