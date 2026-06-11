import { describe, expect, it } from 'vitest';
import { CharReader } from '../../src/serialization/char-reader.js';
import { DeclarationParser } from '../../src/serialization/declaration-parser.js';
import { FtDeclaredParameters } from '../../src/serialization/ft-declared-parameters.js';
import { FtStringReader, FtTextReader } from '../../src/serialization/ft-text-reader.js';
import { FtMetaReferenceType } from '../../src/types/enums/ft-meta-reference-type.js';

describe('FTStd0.9 declaration compliance (provisional)', () => {
  it('[FT0.9-DECL-001] parses standard signature with Version parameter', () => {
    const text = '|!Fielded Text^| Version="1.1"';
    const charReader = new CharReader();
    charReader.setTextReader(new FtStringReader(text), true);

    const parameters = new FtDeclaredParameters();
    const parser = new DeclarationParser(charReader, parameters);
    parser.signature = CharReader.Signature;
    parser.startLine();

    let readResult = charReader.read();
    while (readResult !== FtTextReader.EofReadResult) {
      parser.parseSignatureLineChar(String.fromCharCode(readResult));
      readResult = charReader.read();
    }

    expect(parameters.count).toBe(1);
    expect(parameters.getName(0)).toBe('Version');
    expect(parameters.getValue(0)).toBe('1.1');
  });

  it('[FT0.9-DECL-002] parses multiple signature parameters', () => {
    const text = '|!Fielded Text^| Version="1.1" Culture="en-US" MainHeadingLine="0"';
    const charReader = new CharReader();
    charReader.setTextReader(new FtStringReader(text), true);

    const parameters = new FtDeclaredParameters();
    const parser = new DeclarationParser(charReader, parameters);
    parser.signature = CharReader.Signature;
    parser.startLine();

    for (let i = 0; i < text.length; i++) {
      parser.parseSignatureLineChar(text[i]);
    }

    expect(parameters.count).toBe(3);
  });

  it('[FT0.9-DECL-003] enforces Version as first declaration parameter per clause 4.3.3', () => {
    // Clause 4.3.3: the first declaration parameter MUST always be Version.
    // Non-compliant: library should reject a signature where Version is not first.
    const text = '|!Fielded Text^| Culture="en-US" Version="1.1"';
    const charReader = new CharReader();
    charReader.setTextReader(new FtStringReader(text), true);

    const parameters = new FtDeclaredParameters();
    const parser = new DeclarationParser(charReader, parameters);
    parser.signature = CharReader.Signature;
    parser.startLine();

    for (let i = 0; i < text.length; i++) {
      parser.parseSignatureLineChar(text[i]);
    }

    // Standard requires Version to be the first (index 0) parameter.
    // If the library accepted a non-Version first param without error,
    // it is non-compliant with clause 4.3.3.
    expect(parameters.getName(0)).toBe('Version');
  });

  it('[FT0.9-DECL-004] validates MetaEmbedded MetaFile MetaUrl priority rules per clause 4.3.4', () => {
    // Clause 4.3.4: when multiple meta reference parameters are present,
    // the priority order is: MetaEmbedded (1=highest) > MetaFile > MetaUrl.
    // So if both MetaEmbedded and MetaUrl are present, MetaEmbedded wins.
    const params = new FtDeclaredParameters();
    params.add('MetaUrl', 'http://example.com/meta.xml');
    params.add('MetaEmbedded', 'True');

    const result = params.getMetaReference();

    // Standard mandates MetaEmbedded takes priority over MetaUrl.
    expect(result.type).toBe(FtMetaReferenceType.Embedded);
  });

  it('[FT0.9-DECL-005] accepts custom x- prefixed declaration parameters per clause 4.3.5', () => {
    // Clause 4.3.5: custom parameters SHOULD use x-/X- prefix.
    // The library must at minimum accept such parameters without error.
    const text = '|!Fielded Text^| Version="1.1" x-Producer="MyApp" X-Schema="v2"';
    const charReader = new CharReader();
    charReader.setTextReader(new FtStringReader(text), true);

    const parameters = new FtDeclaredParameters();
    const parser = new DeclarationParser(charReader, parameters);
    parser.signature = CharReader.Signature;
    parser.startLine();

    for (let i = 0; i < text.length; i++) {
      parser.parseSignatureLineChar(text[i]);
    }

    // x- and X- prefixed custom params must be stored and retrievable.
    expect(parameters.count).toBe(3);
    expect(parameters.indexOfName('x-Producer')).toBeGreaterThanOrEqual(0);
    expect(parameters.indexOfName('X-Schema')).toBeGreaterThanOrEqual(0);
  });
});
