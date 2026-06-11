---
title: Sequences
---

# Sequences Implementation Summary

## Overview

The FieldedText library supports **sequence redirects** for conditional field structures, as specified in the FTStd0.9 standard (Section 4.13).

## Sequence Redirects

### What They Are

Sequence redirects allow records to have different field structures based on field values. When a field value matches a redirect condition, additional fields from another sequence are included in the record.

### Key Features

- ✅ Full read/write support
- ✅ Multiple redirect types (ExactInteger, ExactString, Boolean, etc.)
- ✅ Nested redirects (redirects within redirects)
- ✅ Event notifications (onSequenceRedirected)
- ✅ Comprehensive test coverage
- ✅ Standards-compliant (FTStd0.9 Section 4.13.3)

### Example Use Case

```typescript
// Different pet types with different fields:
// Cat (Type=1): Name, RunningSpeed
// Dog (Type=2): Name, WalkDistance, RunningSpeed, Training
//   If Training=true: Trainer, SessionCost
// Fish (Type=3): Name, Color, Classification

// CSV Output:
(1, Misty, 45);
(2, Buddy, 0.5, 35, False);
(2, Charlie, 2, 48, True, John, 32);
(3, Bubbles, Orange, Wen);
```

### Implementation Details

- Redirects are defined on sequence items via `redirectList`
- Each redirect specifies:
  - Type (ExactInteger, Boolean, etc.)
  - Target sequence
  - Trigger value
  - Invokation delay (AfterField, AfterSequence)
- Writer automatically includes redirected fields
- Reader automatically parses redirected fields

### Test Coverage

- `tests/sequence-redirects.test.ts` (3 tests, all passing)
  - Integer-based redirects
  - Nested redirects (redirect within redirect)
  - Event triggering

### Example Files

- [examples/read-sequence/](../../../examples/read-sequence/index.ts) - Reading with redirects
- [examples/write-sequence/](../../../examples/write-sequence/index.ts) - Writing with redirects
- [examples/sequences-with-readback/](../../../examples/sequences-with-readback/index.ts) - Comprehensive redirect demonstration

## Standards Compliance

This implementation follows **FTStd0.9** specification:

### From Section 4.13.2 (Sequence Item elements):

> "Each Sequence Item **must** specify an existing Field."

### From Section 4.13.3 (Sequence Redirect elements):

Sequence redirects are fully specified with support for:

- Condition types: ExactString, CaseInsensitiveString, Boolean, ExactInteger, ExactFloat, ExactDateTime, Date, ExactDecimal, Null
- Invokation delays: AfterField, AfterSequence
- Multiple redirects per field

## Test Results

All tests passing:

```
✓ tests/sequence-redirects.test.ts (3 tests)
✓ Full test suite: 460 tests passed
```

All examples working:

```
✓ examples/sequences/ - Demonstrates redirect-based conditional structures
✓ examples/read-sequence/ - Reading with sequence redirects
✓ examples/write-sequence/ - Writing with sequence redirects
✓ examples/build-meta-with-sequences/ - Building metadata with sequences
```

## Summary

**Sequence redirects** provide a powerful, standards-compliant way to handle conditional/repeating field structures in fielded text files. Use them for:

- Records with different field sets based on type/category
- Optional fields triggered by boolean flags
- Hierarchical data with nested conditional structures
- Any scenario requiring variable field layouts per record
