import { describe, expect, it } from 'vitest';
import {
  FtBooleanMetaField,
  FtBooleanMetaSequenceRedirect,
  FtDataType,
  FtDecimalMetaField,
  FtExactIntegerMetaSequenceRedirect,
  FtFloatMetaField,
  FtIntegerMetaField,
  FtMeta,
  FtReader,
  FtSequenceInvokationDelay,
  FtSequenceRedirectType,
  FtSerializationWriter,
  FtStringMetaField,
  FtStringWriter,
} from '../src/index.js';

describe('Sequence Redirects', () => {
  it('should redirect to different sequences based on integer field value', () => {
    const meta = new FtMeta();
    meta.delimiterChar = ',';
    meta.headingLineCount = 0;

    // Create fields
    const typeField = meta.fieldList.new(FtDataType.Integer);
    (typeField as FtIntegerMetaField).name = 'Type';
    (typeField as FtIntegerMetaField).format = 'G';

    const nameField = meta.fieldList.new(FtDataType.String);
    (nameField as FtStringMetaField).name = 'Name';

    const speedField = meta.fieldList.new(FtDataType.Float);
    (speedField as FtFloatMetaField).name = 'Speed';
    (speedField as FtFloatMetaField).format = 'G';

    const colorField = meta.fieldList.new(FtDataType.String);
    (colorField as FtStringMetaField).name = 'Color';

    // Create sequences
    const rootSequence = meta.sequenceList.new();
    rootSequence.name = 'Root';
    rootSequence.root = true;

    const typeItem = rootSequence.itemList.new(typeField);

    rootSequence.itemList.new(nameField);

    const catSequence = meta.sequenceList.new();
    catSequence.name = 'Cat';
    catSequence.itemList.new(speedField);

    const dogSequence = meta.sequenceList.new();
    dogSequence.name = 'Dog';
    dogSequence.itemList.new(colorField);

    // Add redirects to type field
    let redirect = typeItem.redirectList.new(FtSequenceRedirectType.ExactInteger) as FtExactIntegerMetaSequenceRedirect;
    redirect.invokationDelay = FtSequenceInvokationDelay.AfterSequence;
    redirect.sequence = catSequence;
    redirect.value = BigInt(1);

    redirect = typeItem.redirectList.new(FtSequenceRedirectType.ExactInteger) as FtExactIntegerMetaSequenceRedirect;
    redirect.invokationDelay = FtSequenceInvokationDelay.AfterSequence;
    redirect.sequence = dogSequence;
    redirect.value = BigInt(2);

    // Write test data
    const writer = new FtSerializationWriter(meta);
    const stringWriter = new FtStringWriter();
    writer.open(stringWriter, true);

    // Cat record (type=1)
    writer.setFieldValueByName('Type', BigInt(1));
    writer.setFieldValueByName('Name', 'Whiskers');
    writer.setFieldValueByName('Speed', 30.5);
    writer.write();

    // Dog record (type=2)
    writer.setFieldValueByName('Type', BigInt(2));
    writer.setFieldValueByName('Name', 'Buddy');
    writer.setFieldValueByName('Color', 'Brown');
    writer.write();

    // Another cat
    writer.setFieldValueByName('Type', BigInt(1));
    writer.setFieldValueByName('Name', 'Felix');
    writer.setFieldValueByName('Speed', 28.0);
    writer.write();

    writer.close();

    const csvText = stringWriter.toString();

    // Verify output
    const lines = csvText.trim().split('\n');
    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('1,Whiskers,30.5');
    expect(lines[1]).toBe('2,Buddy,Brown');
    expect(lines[2]).toBe('1,Felix,28');

    // Read back and verify
    const reader = new FtReader();
    reader.loadMeta(meta);
    reader.open(csvText);
    reader.autoNextTable = true;

    expect(reader.read()).toBe(true);
    expect(reader.getFieldByName('Type')!.asBigInt).toBe(BigInt(1));
    expect(reader.getFieldByName('Name')!.asString).toBe('Whiskers');
    expect(reader.getFieldByName('Speed')!.asFloat).toBe(30.5);

    expect(reader.read()).toBe(true);
    expect(reader.getFieldByName('Type')!.asBigInt).toBe(BigInt(2));
    expect(reader.getFieldByName('Name')!.asString).toBe('Buddy');
    expect(reader.getFieldByName('Color')!.asString).toBe('Brown');

    expect(reader.read()).toBe(true);
    expect(reader.getFieldByName('Type')!.asBigInt).toBe(BigInt(1));
    expect(reader.getFieldByName('Name')!.asString).toBe('Felix');
    expect(reader.getFieldByName('Speed')!.asFloat).toBe(28.0);

    expect(reader.read()).toBe(false);
  });

  it('should support nested redirects (redirect within redirect)', () => {
    const meta = new FtMeta();
    meta.delimiterChar = ',';
    meta.headingLineCount = 0;

    // Fields
    const typeField = meta.fieldList.new(FtDataType.Integer);
    (typeField as FtIntegerMetaField).name = 'Type';
    (typeField as FtIntegerMetaField).format = 'G';

    const nameField = meta.fieldList.new(FtDataType.String);
    (nameField as FtStringMetaField).name = 'Name';

    const trainingField = meta.fieldList.new(FtDataType.Boolean);
    (trainingField as FtBooleanMetaField).name = 'Training';

    const trainerField = meta.fieldList.new(FtDataType.String);
    (trainerField as FtStringMetaField).name = 'Trainer';

    const costField = meta.fieldList.new(FtDataType.Decimal);
    (costField as FtDecimalMetaField).name = 'Cost';
    (costField as FtDecimalMetaField).format = 'G';

    // Root sequence
    const rootSequence = meta.sequenceList.new();
    rootSequence.name = 'Root';
    rootSequence.root = true;

    const typeItem = rootSequence.itemList.new(typeField);
    rootSequence.itemList.new(nameField);

    // Dog sequence
    const dogSequence = meta.sequenceList.new();
    dogSequence.name = 'Dog';
    const trainingItem = dogSequence.itemList.new(trainingField);

    // Training sequence (only invoked if training=true)
    const trainingSequence = meta.sequenceList.new();
    trainingSequence.name = 'Training';
    trainingSequence.itemList.new(trainerField);
    trainingSequence.itemList.new(costField);

    // Redirect from type to dog
    let typeRedirect = typeItem.redirectList.new(FtSequenceRedirectType.ExactInteger) as FtExactIntegerMetaSequenceRedirect;
    typeRedirect.invokationDelay = FtSequenceInvokationDelay.AfterSequence;
    typeRedirect.sequence = dogSequence;
    typeRedirect.value = BigInt(2);

    // Redirect from training to training sequence
    const trainingRedirect = trainingItem.redirectList.new(FtSequenceRedirectType.Boolean) as FtBooleanMetaSequenceRedirect;
    trainingRedirect.invokationDelay = FtSequenceInvokationDelay.AfterField;
    trainingRedirect.sequence = trainingSequence;
    trainingRedirect.value = true;

    // Write test data
    const writer = new FtSerializationWriter(meta);
    const stringWriter = new FtStringWriter();
    writer.open(stringWriter, true);

    // Dog without training
    writer.setFieldValueByName('Type', BigInt(2));
    writer.setFieldValueByName('Name', 'Max');
    writer.setFieldValueByName('Training', false);
    writer.write();

    // Dog with training
    writer.setFieldValueByName('Type', BigInt(2));
    writer.setFieldValueByName('Name', 'Charlie');
    writer.setFieldValueByName('Training', true);
    writer.setFieldValueByName('Trainer', 'John');
    writer.setFieldValueByName('Cost', 45.5);
    writer.write();

    writer.close();

    const csvText = stringWriter.toString();
    const lines = csvText.trim().split('\n');

    expect(lines[0]).toBe('2,Max,False');
    expect(lines[1]).toBe('2,Charlie,True,John,45.5');

    // Read back
    const reader = new FtReader();
    reader.loadMeta(meta);
    reader.open(csvText);
    reader.autoNextTable = true;

    expect(reader.read()).toBe(true);
    expect(reader.getFieldByName('Name')!.asString).toBe('Max');
    expect(reader.getFieldByName('Training')!.asBoolean).toBe(false);

    expect(reader.read()).toBe(true);
    expect(reader.getFieldByName('Name')!.asString).toBe('Charlie');
    expect(reader.getFieldByName('Training')!.asBoolean).toBe(true);
    expect(reader.getFieldByName('Trainer')!.asString).toBe('John');
    expect(reader.getFieldByName('Cost')!.asDecimal).toBe(45.5);

    expect(reader.read()).toBe(false);
  });

  it('should trigger sequence redirect events', () => {
    const meta = new FtMeta();
    meta.delimiterChar = ',';
    meta.headingLineCount = 0;

    const typeField = meta.fieldList.new(FtDataType.Integer);
    (typeField as FtIntegerMetaField).name = 'Type';
    (typeField as FtIntegerMetaField).format = 'G';

    const dataField = meta.fieldList.new(FtDataType.String);
    (dataField as FtStringMetaField).name = 'Data';

    const rootSequence = meta.sequenceList.new();
    rootSequence.name = 'Root';
    rootSequence.root = true;

    const typeItem = rootSequence.itemList.new(typeField);

    const specialSequence = meta.sequenceList.new();
    specialSequence.name = 'Special';
    specialSequence.itemList.new(dataField);

    const redirect = typeItem.redirectList.new(FtSequenceRedirectType.ExactInteger) as FtExactIntegerMetaSequenceRedirect;
    redirect.invokationDelay = FtSequenceInvokationDelay.AfterSequence;
    redirect.sequence = specialSequence;
    redirect.value = BigInt(99);

    const writer = new FtSerializationWriter(meta);
    const stringWriter = new FtStringWriter();
    writer.open(stringWriter, true);

    const redirectEvents: Array<{ fieldName: string }> = [];

    writer.onSequenceRedirected = (args) => {
      redirectEvents.push({
        fieldName: args.redirectingField.name,
      });
    };

    // Regular record (no redirect)
    writer.setFieldValueByName('Type', BigInt(1));
    writer.write();

    // Special record (triggers redirect)
    writer.setFieldValueByName('Type', BigInt(99));
    writer.setFieldValueByName('Data', 'Special');
    writer.write();

    writer.close();

    // Verify redirect event was fired once (for the special record)
    expect(redirectEvents.length).toBe(1);
    expect(redirectEvents[0].fieldName).toBe('Type');
  });
});
