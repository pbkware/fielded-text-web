// Build Meta With Sequences Example
// Demonstrates programmatically generating metadata that uses sequences
// The meta is for a CSV file which lists 3 types of pets:
// - Cats: type and name (root) + running speed
// - Dogs: type and name (root) + walk distance, running speed, training info
//   - If training, also includes trainer and session cost
// - Goldfish: type and name (root) + color and chinese classification

import {
  FtBooleanMetaSequenceRedirect,
  FtDataType,
  FtDecimalMetaField,
  FtExactIntegerMetaSequenceRedirect,
  FtFloatMetaField,
  FtIntegerMetaField,
  FtMeta,
  FtMetaSerializerOptions,
  FtSequenceInvokationDelay,
  FtSequenceRedirectType,
  FtXmlMetaSerialization,
} from "@pbkware/fielded-text-web";

// Define Field Names
const TypeFieldName = "Type";
const NameFieldName = "Name";
const RunningSpeedFieldName = "RunningSpeed";
const WalkDistanceFieldName = "WalkDistance";
const TrainingFieldName = "Training";
const TrainerFieldName = "Trainer";
const SessionCostFieldName = "SessionCost";
const ColorFieldName = "Color";
const ChineseClassificationFieldName = "ChineseClassification";

// Define Field Ids
const TypeFieldId = 0;
const NameFieldId = 1;
const RunningSpeedFieldId = 2;
const WalkDistanceFieldId = 3;
const TrainingFieldId = 4;
const TrainerFieldId = 5;
const SessionCostFieldId = 6;
const ColorFieldId = 7;
const ChineseClassificationFieldId = 8;

// Define Sequence Names
const RootSequenceName = "Root";
const CatSequenceName = "Cat";
const DogSequenceName = "Dog";
const GoldFishSequenceName = "GoldFish";
const TrainingSequenceName = "Training";

const meta = new FtMeta();

// Add fields to Meta
const typeField = meta.fieldList.new(FtDataType.Integer);
(typeField as FtIntegerMetaField).name = TypeFieldName;
typeField.id = TypeFieldId;
(typeField as FtIntegerMetaField).format = "G";

const nameField = meta.fieldList.new(FtDataType.String);
nameField.name = NameFieldName;
nameField.id = NameFieldId;

const runningSpeedField = meta.fieldList.new(FtDataType.Float);
(runningSpeedField as FtFloatMetaField).name = RunningSpeedFieldName;
runningSpeedField.id = RunningSpeedFieldId;
(runningSpeedField as FtFloatMetaField).format = "G";

const walkDistanceField = meta.fieldList.new(FtDataType.Float);
(walkDistanceField as FtFloatMetaField).name = WalkDistanceFieldName;
walkDistanceField.id = WalkDistanceFieldId;
(walkDistanceField as FtFloatMetaField).format = "G";

const trainingField = meta.fieldList.new(FtDataType.Boolean);
trainingField.name = TrainingFieldName;
trainingField.id = TrainingFieldId;

const trainerField = meta.fieldList.new(FtDataType.String);
trainerField.name = TrainerFieldName;
trainerField.id = TrainerFieldId;

const sessionCostField = meta.fieldList.new(FtDataType.Decimal);
(sessionCostField as FtDecimalMetaField).name = SessionCostFieldName;
sessionCostField.id = SessionCostFieldId;
(sessionCostField as FtDecimalMetaField).format = "G";

const colorField = meta.fieldList.new(FtDataType.String);
colorField.name = ColorFieldName;
colorField.id = ColorFieldId;

const chineseClassificationField = meta.fieldList.new(FtDataType.String);
chineseClassificationField.name = ChineseClassificationFieldName;
chineseClassificationField.id = ChineseClassificationFieldId;

// Add Sequences to Meta
const rootSequence = meta.sequenceList.new();
rootSequence.name = RootSequenceName;
rootSequence.root = true;

const catSequence = meta.sequenceList.new();
catSequence.name = CatSequenceName;

const dogSequence = meta.sequenceList.new();
dogSequence.name = DogSequenceName;

const goldFishSequence = meta.sequenceList.new();
goldFishSequence.name = GoldFishSequenceName;

const trainingSequence = meta.sequenceList.new();
trainingSequence.name = TrainingSequenceName;

// Add SequenceItems to Sequences
// Add SequenceItems with fields in correct order (index does not need to be specified)
const typeSequenceItem = rootSequence.itemList.new(typeField);

rootSequence.itemList.new(nameField);
catSequence.itemList.new(runningSpeedField);
dogSequence.itemList.new(walkDistanceField);
dogSequence.itemList.new(runningSpeedField);
const trainingSequenceItem = dogSequence.itemList.new(trainingField);
trainingSequence.itemList.new(trainerField);
trainingSequence.itemList.new(sessionCostField);
goldFishSequence.itemList.new(colorField);
goldFishSequence.itemList.new(chineseClassificationField);

// Add redirects to Meta Sequence Items
let typeRedirect = typeSequenceItem.redirectList.new(
  FtSequenceRedirectType.ExactInteger,
) as FtExactIntegerMetaSequenceRedirect;
typeRedirect.invokationDelay = FtSequenceInvokationDelay.AfterSequence;
typeRedirect.sequence = catSequence;
typeRedirect.value = BigInt(1);

typeRedirect = typeSequenceItem.redirectList.new(
  FtSequenceRedirectType.ExactInteger,
) as FtExactIntegerMetaSequenceRedirect;
typeRedirect.invokationDelay = FtSequenceInvokationDelay.AfterSequence;
typeRedirect.sequence = dogSequence;
typeRedirect.value = BigInt(2);

typeRedirect = typeSequenceItem.redirectList.new(
  FtSequenceRedirectType.ExactInteger,
) as FtExactIntegerMetaSequenceRedirect;
typeRedirect.invokationDelay = FtSequenceInvokationDelay.AfterSequence;
typeRedirect.sequence = goldFishSequence;
typeRedirect.value = BigInt(3);

const trainingRedirect = trainingSequenceItem.redirectList.new(
  FtSequenceRedirectType.Boolean,
) as FtBooleanMetaSequenceRedirect;
trainingRedirect.invokationDelay = FtSequenceInvokationDelay.AfterField;
trainingRedirect.sequence = trainingSequence;
trainingRedirect.value = true;

// Serialize Meta to XML
const writeOptions: FtMetaSerializerOptions = {
  indent: true, // Is default so not really necessary
  indentChars: "   ",
};
const xmlOutput = FtXmlMetaSerialization.serialize(meta, writeOptions);

console.log("Generated Meta XML:");
console.log(xmlOutput);
console.log("\nMeta has been created with the following structure:");
console.log("- Root Sequence: Type, Name");
console.log("- Cat Sequence (Type=1): RunningSpeed");
console.log("- Dog Sequence (Type=2): WalkDistance, RunningSpeed, Training");
console.log("  - Training Sequence (Training=true): Trainer, SessionCost");
console.log("- GoldFish Sequence (Type=3): Color, ChineseClassification");
