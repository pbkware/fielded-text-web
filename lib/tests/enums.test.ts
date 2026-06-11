// Tests for all enum types
import { describe, expect, it } from 'vitest';
import {
  FtBooleanStyles,
  FtDataType,
  FtEndOfLineAutoWriteType,
  FtEndOfLineType,
  FtQuotedType,
  FtReadRecordResult,
  FtSequenceInvokationDelay,
  FtSequenceRedirectType,
} from '../src/index.js';
import { DataTypeMetaSerialization } from '../src/meta-serialization/types/enums/data-type-meta-serialisation.js';
import { SequenceRedirectTypeMetaSerialization } from '../src/meta-serialization/types/enums/sequence-redirect-type-meta-serialisation.js';

describe('FtEndOfLineType', () => {
  it('should have correct enum values', () => {
    expect(FtEndOfLineType.Auto).toBe('Auto');
    expect(FtEndOfLineType.Char).toBe('Char');
    expect(FtEndOfLineType.CrLf).toBe('CrLf');
  });
});

describe('FtEndOfLineAutoWriteType', () => {
  it('should have correct enum values', () => {
    expect(FtEndOfLineAutoWriteType.CrLf).toBe('CrLf');
    expect(FtEndOfLineAutoWriteType.Cr).toBe('Cr');
    expect(FtEndOfLineAutoWriteType.Lf).toBe('Lf');
    expect(FtEndOfLineAutoWriteType.Local).toBe('Local');
  });
});

describe('FtQuotedType', () => {
  it('should have correct enum values', () => {
    expect(FtQuotedType.Never).toBe('Never');
    expect(FtQuotedType.Always).toBe('Always');
    expect(FtQuotedType.Optional).toBe('Optional');
  });
});

describe('FtBooleanStyles', () => {
  it('should have correct flag values', () => {
    expect(FtBooleanStyles.IgnoreCase).toBe(1);
    expect(FtBooleanStyles.MatchFirstCharOnly).toBe(2);
    expect(FtBooleanStyles.IgnoreTrailingChars).toBe(4);
    expect(FtBooleanStyles.FalseIfNotMatchTrue).toBe(8);
  });

  it('should support bitwise operations', () => {
    const combined = FtBooleanStyles.IgnoreCase | FtBooleanStyles.MatchFirstCharOnly;
    expect(combined).toBe(3);
    expect(combined & FtBooleanStyles.IgnoreCase).toBeTruthy();
    expect(combined & FtBooleanStyles.MatchFirstCharOnly).toBeTruthy();
    expect(combined & FtBooleanStyles.IgnoreTrailingChars).toBe(0);
  });
});

describe('FtDataType', () => {
  it('should have correct constant values', () => {
    // expect(FtDataType.Unknown).toBe('Unknown');
    expect(FtDataType.String).toBe('String');
    expect(FtDataType.Boolean).toBe('Boolean');
    expect(FtDataType.Integer).toBe('Integer');
    expect(FtDataType.Float).toBe('Float');
    expect(FtDataType.Decimal).toBe('Decimal');
    expect(FtDataType.DateTime).toBe('DateTime');
  });

  it('should convert type to name', () => {
    expect(DataTypeMetaSerialization.serialize(FtDataType.String)).toBe(undefined);
    expect(DataTypeMetaSerialization.serialize(FtDataType.Boolean)).toBe('Boolean');
    expect(DataTypeMetaSerialization.serialize(FtDataType.Integer)).toBe('Integer');
    expect(DataTypeMetaSerialization.serialize(FtDataType.DateTime)).toBe('DateTime');
  });

  it('should generate warnings for invalid type and value', () => {
    const warnings: string[] = [];
    DataTypeMetaSerialization.deserialize(0, warnings);
    DataTypeMetaSerialization.deserialize('XX', warnings);
    expect(warnings.length).toBe(2);
  });
});

describe('FtSequenceRedirectType', () => {
  it('should have correct constant values', () => {
    expect(FtSequenceRedirectType.Null).toBe('Null');
    expect(FtSequenceRedirectType.ExactString).toBe('ExactString');
    expect(FtSequenceRedirectType.CaseInsensitiveString).toBe('CaseInsensitiveString');
    expect(FtSequenceRedirectType.Boolean).toBe('Boolean');
  });

  it('should convert type to name', () => {
    expect(SequenceRedirectTypeMetaSerialization.serialize(FtSequenceRedirectType.Null, FtDataType.String)).toBe('Null');
    expect(SequenceRedirectTypeMetaSerialization.serialize(FtSequenceRedirectType.ExactString, FtDataType.String)).toBe(undefined);
    expect(SequenceRedirectTypeMetaSerialization.serialize(FtSequenceRedirectType.CaseInsensitiveString, FtDataType.String)).toBe(
      'CaseInsensitiveString',
    );
    expect(SequenceRedirectTypeMetaSerialization.serialize(FtSequenceRedirectType.Boolean, FtDataType.Boolean)).toBe(undefined);
  });

  it('should generate warnings for invalid type and value', () => {
    const warnings: string[] = [];
    SequenceRedirectTypeMetaSerialization.deserialize(0, FtDataType.String, warnings);
    SequenceRedirectTypeMetaSerialization.deserialize('XX', FtDataType.String, warnings);
    expect(warnings.length).toBe(2);
  });
});

describe('FtReadRecordResult', () => {
  it('should have correct enum values', () => {
    expect(FtReadRecordResult.SameTable).toBe('SameTable');
    expect(FtReadRecordResult.NewTable).toBe('NewTable');
    expect(FtReadRecordResult.NoMoreRecords).toBe('NoMoreRecords');
  });
});

describe('FtSequenceInvokationDelay', () => {
  it('should have correct enum values', () => {
    expect(FtSequenceInvokationDelay.AfterField).toBe('AfterField');
    expect(FtSequenceInvokationDelay.AfterSequence).toBe('AfterSequence');
  });
});
