import { DotNetDateTimeStyles, DotNetNumberStyles } from '@pbkware/dot-net-date-number-formatting';
import { FtBooleanStyles } from '../types/enums/ft-boolean-styles.js';
import { FtDataType } from '../types/enums/ft-data-type.js';
import { FtEndOfLineAutoWriteType } from '../types/enums/ft-end-of-line-auto-write-type.js';
import { FtEndOfLineType } from '../types/enums/ft-end-of-line-type.js';
import { FtHeadingConstraint } from '../types/enums/ft-heading-constraint.js';
import { FtLastLineEndedType } from '../types/enums/ft-last-line-ended-type.js';
import { FtPadAlignment } from '../types/enums/ft-pad-alignment.js';
import { FtPadCharType } from '../types/enums/ft-pad-char-type.js';
import { FtQuotedType } from '../types/enums/ft-quoted-type.js';
import { FtSequenceInvokationDelay } from '../types/enums/ft-sequence-invokation-delay.js';
import { FtSequenceRedirectType } from '../types/enums/ft-sequence-redirect-type.js';
import { FtSubstitutionType } from '../types/enums/ft-substitution-type.js';
import { FtTruncateType } from '../types/enums/ft-truncate-type.js';

/**
 * @public
 */
export namespace FtMetaDefaults {
  export namespace Root {
    export const CultureName = '';
    export const EndOfLineType = FtEndOfLineType.Auto;
    export const EndOfLineChar = ';';
    export const EndOfLineAutoWriteType = FtEndOfLineAutoWriteType.Local;
    export const LastLineEndedType = FtLastLineEndedType.Optional;
    export const QuoteChar = '"';
    export const DelimiterChar = ',';
    export const LineCommentChar = '\x04';
    export const AllowEndOfLineCharInQuotes = true;
    export const IgnoreBlankLines = true;
    export const IgnoreExtraChars = true;
    export const AllowIncompleteRecords = false;
    export const StuffedEmbeddedQuotes = true;
    export const SubstitutionsEnabled = false;
    export const SubstitutionChar = '\\';
    export const HeadingLineCount = 0;
    export const MainHeadingLineIndex = 0;
    export const HeadingConstraint = FtHeadingConstraint.None;
    export const HeadingQuotedType = FtQuotedType.Optional;
    export const HeadingAlwaysWriteOptionalQuote = false;
    export const HeadingWritePrefixSpace = false;
    export const HeadingPadAlignment = FtPadAlignment.Auto;
    export const HeadingPadCharType = FtPadCharType.EndOfValue;
    export const HeadingPadChar = ' ';
    export const HeadingTruncateType = FtTruncateType.Right;
    export const HeadingTruncateChar = '#';
    export const HeadingEndOfValueChar = '\x03';
  }

  export namespace Field {
    export const Id = 0;
    export const Name = '';
    export const DataType = FtDataType.String;
    export const FixedWidth = false;
    export const Width = 1;
    export const Constant = false;
    export const Null = false;
    export const ValueQuotedType = FtQuotedType.Optional;
    export const ValueAlwaysWriteOptionalQuote = false;
    export const ValueWritePrefixSpace = false;
    export const ValuePadAlignment = FtPadAlignment.Auto;
    export const ValuePadCharType = FtPadCharType.EndOfValue;
    export const ValuePadChar = ' ';
    export const ValueTruncateType = FtTruncateType.Exception;
    export const ValueTruncateChar = '#';
    export const ValueEndOfValueChar = '\x03'; // ASCII Control Code: End Of Text
    export const ValueNullChar = '*';

    export namespace RootOverriding {
      export const HeadingConstraint = Root.HeadingConstraint; // Default is actually value assigned to root
      export const HeadingQuotedType = Root.HeadingQuotedType; // Default is actually value assigned to root
      export const HeadingAlwaysWriteOptionalQuote = Root.HeadingAlwaysWriteOptionalQuote; // Default is actually value assigned to root
      export const HeadingWritePrefixSpace = Root.HeadingWritePrefixSpace; // Default is actually value assigned to root
      export const HeadingPadAlignment = Root.HeadingPadAlignment; // Default is actually value assigned to root
      export const HeadingPadCharType = Root.HeadingPadCharType; // Default is actually value assigned to root
      export const HeadingPadChar = Root.HeadingPadChar; // Default is actually value assigned to root
      export const HeadingTruncateType = Root.HeadingTruncateType; // Default is actually value assigned to root
      export const HeadingTruncateChar = Root.HeadingTruncateChar; // Default is actually value assigned to root
      export const HeadingEndOfValueChar = Root.HeadingEndOfValueChar; // Default is actually value assigned to root
    }
  }

  export namespace StringField {
    export const Value = '';
    export const SequenceRedirectType = FtSequenceRedirectType.ExactString;
  }

  export namespace BooleanField {
    export const FalseText = 'False';
    export const TrueText = 'True';
    export const Styles = FtBooleanStyles.IgnoreCase | FtBooleanStyles.MatchFirstCharOnly;
    export const Value = false;
    export const SequenceRedirectType = FtSequenceRedirectType.Boolean;
  }

  export namespace IntegerField {
    export const Styles = DotNetNumberStyles.integer;
    export const Format = 'G';
    export const Value = 0n;
    export const SequenceRedirectType = FtSequenceRedirectType.ExactInteger;
  }

  export namespace FloatField {
    export const Styles = DotNetNumberStyles.float;
    export const Format = 'G';
    export const Value = 0.0;
    export const SequenceRedirectType = FtSequenceRedirectType.ExactFloat;
  }

  export namespace DecimalField {
    export const Styles = DotNetNumberStyles.currency;
    export const Format = 'G';
    export const Value = 0.0;
    export const SequenceRedirectType = FtSequenceRedirectType.ExactDecimal;
  }

  export namespace DateTimeField {
    export const Styles = DotNetDateTimeStyles.none;
    export const Format = 'yyyyMMdd';
    const epochDateStamp = new Date().setUTCFullYear(1, 0, 1);
    const epochTimestamp = new Date(epochDateStamp).setUTCHours(0, 0, 0, 0);
    export const Value = new Date(epochTimestamp);
    export const SequenceRedirectType = FtSequenceRedirectType.ExactDateTime;

    export const DateFormat = 'yyyyMMdd';
    export const DateFormatLength = DateFormat.length;
    export const TimeFormat = 'HHmmss';
    export const TimeFormatLength = TimeFormat.length;
    export const DateTimeFormat = DateFormat + TimeFormat;
    export const DateTimeFormatLength = DateTimeFormat.length;
    export const FractionFormat = 'fffffff';
    export const MaxFractionLength = FractionFormat.length;
    export const TimeAndFractionSeparatorChar = '.';
    export const TimeWithFractionFormat = TimeFormat + TimeAndFractionSeparatorChar + FractionFormat;
    export const DateTimeWithFractionFormat = DateTimeFormat + TimeAndFractionSeparatorChar + FractionFormat;
  }

  export namespace Substitution {
    export const Token = '\\';
    export const Type = FtSubstitutionType.String;
  }

  export namespace Sequence {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    export const Root = false;
  }

  export namespace SequenceRedirect {
    export const InvokationDelay = FtSequenceInvokationDelay.AfterField;
  }
}
