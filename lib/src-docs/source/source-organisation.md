---
title: Source organisation
---

# Source Code Organization

This document describes the organization of the source code in the `src/` directory.

## Overview

The source code is organized into a layered architecture with clear separation of concerns and unidirectional dependencies. Files are grouped by functionality and architectural layer.

## Directory Structure

```
src/
├── types/                        # Layer 1: Foundation types (no internal dependencies)
│   └── enums/                    # Enumeration types
│
├── utils/                        # Layer 2: Utility classes and functions
│
├── meta/                         # Layer 3: Build-time metadata model
│   ├── fields/                   # Meta field classes
│   ├── sequences/                # Meta sequences and redirects
│   │   ├── core/                 # Core meta sequence classes
│   │   └── redirects/            # Meta sequence redirect implementations
│   ├── substitutions/            # Meta substitutions
│   ├── ft-meta-defaults.ts       # Metadata defaults
│   └── ft-meta.ts                # Main metadata class
│
├── fields/                       # Layer 3: Runtime field model
│   ├── definitions/              # Field definition classes
│   └── instances/                # Field instance classes
│       └── errors/               # Field errors
│
├── sequences/                    # Layer 3: Runtime sequence model
│   ├── core/                     # Core sequence classes
│   └── redirects/                # Sequence redirect implementations
│
├── substitutions/                # Layer 3: Runtime substitutions
│
├── serialization/                # Layer 4: Serialization infrastructure
│   └── formatting/               # Field formatters for output
│   └── events/                   # Serialization Event argument interfaces
│   └── text-reader/              # Text Readers
│
├── meta-serialization/           # Layer 4: Metadata serialization (XML/JSON)
│   ├── format/                   # Format implementations and options
│   ├── styles/                   # Date/number style serializers
│   ├── types/                    # Meta serialization type mappers
│   │   └── enums/                # Enum serialization helpers
│   └── utils/                    # Shared meta-serialization utilities
│
├── api/                          # Layer 5: High-level public API
│   ├── ft-reader.ts              # High-level reader
│   ├── ft-writer.ts              # High-level writer
│   ├── ft-writer-settings.ts     # Writer configuration
│   └── ft-serialization.ts       # High-level serialization orchestrator
│
├── factory/                      # Layer 6: Object factories
│
└── index.ts                      # Main export file
```

## Dependency Layers

The architecture follows a strict layered dependency model where each layer only depends on layers below it:

```
Layer 1: types/
    ↓
Layer 2: utils/
    ↓
Layer 3: meta/, fields/, sequences/, substitutions/
    ↓
Layer 4: serialization/, meta-serialization/
    ↓
Layer 5: api/
    ↓
Layer 6: factory/
```

## Layer Descriptions

### Layer 1: Foundation Types (`types/`)

Contains all fundamental types with no internal dependencies. This layer includes:

- **`enums/`**: All enumeration types (FtBooleanStyles, FtEndOfLineType, FtPadAlignment, etc.)
- **`errors/`**: Exception and error classes (FtSerializationError, FtSerializationException)
- **`events/`**: Event argument interfaces for field/record/sequence events

Note: standard conceptual types such as `FtDataType` and `FtSequenceRedirectType` are now defined within `types/enums/` rather than a separate `types/standard/` folder.

### Layer 2: Core Domain Models

The core business logic split into parallel subsystems:

- **`meta/`**: Build-time metadata model
  - `fields/`: Meta field classes for defining field metadata
  - `sequences/`: Meta sequence infrastructure
    - `core/`: Meta sequence, item, and list classes
    - `redirects/`: Meta sequence redirect classes (boolean, date, string, exact value, etc.)
  - `substitutions/`: Meta substitution definitions
  - `ft-meta-defaults.ts`: Default metadata values
  - `ft-meta.ts`: Main metadata container

- **`fields/`**: Runtime field model
  - `definitions/`: Field definition classes (FtBooleanFieldDefinition, FtStringFieldDefinition, etc.)
  - `instances/`: Field instance classes (FtBooleanField, FtStringField, etc.)

- **`sequences/`**: Runtime sequence model
  - `core/`: Sequence, SequenceItem, SequenceInvokation classes
  - `redirects/`: Sequence redirect implementations (boolean, date, exact value, etc.)

- **`substitutions/`**: Runtime substitution model

### Layer 3: Serialization Infrastructure

Handles reading and writing of fielded text:

- **`serialization/`**: Core serialization logic
  - Character reading, text parsing, field parsing
  - `formatting/`: Field formatters for output formatting

- **`meta-serialization/`**: Metadata serialization
  - `format/`: XML/JSON serializers and serializer options
  - `styles/`: Date/time and number style serializers
  - `types/`: Meta serialization type adapters and enum mappings
  - `utils/`: Utility helpers shared across serializers

### Layer 4: High-Level API (`api/`)

User-facing API classes:

- `FtReader`: Simplified reader interface
- `FtWriter`: Simplified writer interface
- `FtWriterSettings`: Writer configuration
- `FtSerialization` (plus `FtAbortSerializationException`): High-level serialization orchestrator and control flow

### Layer 5: Factories (`factory/`)

Factory classes for creating instances across all layers:

- Field factories
- Meta factories
- Sequence factories
- Sequence redirect factories
- Substitution factories

## Rationale

This organization provides several benefits:

1. **Clear Dependency Flow**: Dependencies only flow downward through layers, making the codebase easier to understand and maintain.

2. **Separation of Concerns**: Related functionality is grouped together (all field-related code in `fields/`, all sequence-related code in `sequences/`, etc.).

3. **Improved Discoverability**: Easy to locate specific functionality - if you need a field definition, look in `fields/definitions/`; if you need an enum, look in `types/enums/`.

4. **Parallel Models**: The metadata model (`meta/`) and runtime model (`fields/`, `sequences/`) are clearly separated but at the same architectural layer.

5. **Serialization Separation**: Runtime text serialization (`serialization/`) and metadata serialization (`meta-serialization/`) are isolated, reducing coupling between runtime processing and metadata IO.

6. **Testability**: Clear layers make it easier to test components in isolation.
