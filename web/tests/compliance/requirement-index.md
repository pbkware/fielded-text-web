# FTStd0.9 Requirement Index

Clause references below are mapped from `standard/FTStd0.9.txt`.
This index is expanded incrementally as compliance modules are added.

| Requirement ID  | Area                   | Requirement Summary                                                                    | FT Clause     | Test Status |
| --------------- | ---------------------- | -------------------------------------------------------------------------------------- | ------------- | ----------- |
| FT0.9-DECL-001  | Declarations           | Parser recognizes standard signature and comment-char convention                       | 4.3.1         | Implemented |
| FT0.9-DECL-002  | Declarations           | Declaration parameters parse as name/value pairs with standard string quoting          | 4.3.2         | Implemented |
| FT0.9-DECL-003  | Declarations           | First declaration parameter must be `Version` and must be present                      | 4.3.3         | Implemented |
| FT0.9-DECL-004  | Declarations           | Meta reference parameters (`MetaEmbedded`, `MetaFile`, `MetaUrl`) honor priority rules | 4.3.4         | Implemented |
| FT0.9-DECL-005  | Declarations           | Custom declaration parameter names should use `x-` prefix to avoid conflicts           | 4.3.5         | Implemented |
| FT0.9-CSV-001   | Record parsing         | Reader parses basic delimited record lines with heading line metadata                  | 4.8           | Implemented |
| FT0.9-QUOTE-001 | Delimited quoting      | Quoted field delimiter handling follows delimited-field rules                          | 4.10.7        | Implemented |
| FT0.9-QUOTE-002 | Delimited quoting      | Stuffed embedded quotes are interpreted as one quote when enabled                      | 4.10.7        | Implemented |
| FT0.9-QUOTE-003 | String quoting         | Standard string quoting doubles embedded quotes when representing string values        | 5.1.6         | Implemented |
| FT0.9-EOL-001   | End-of-line            | `EndOfLineType=CrLf` uses CRLF sequence to delimit lines                               | 3.7.1.1       | Implemented |
| FT0.9-EOL-002   | End-of-line            | `LastLineEndedType` behavior (`Never`, `Always`, `Optional`) is enforced               | 3.7.1.3       | Implemented |
| FT0.9-EOL-003   | Delimited records      | EOL characters are part of field text inside quoted fields when allowed                | 4.10.7        | Implemented |
| FT0.9-TYPES-001 | Field data types       | Boolean, Integer, Float and Decimal parse from value text per field definitions        | 4.10.9        | Implemented |
| FT0.9-TYPES-002 | Field data types       | DateTime parse/format behavior conforms to DateTime formatting rules                   | 4.10.9, 5.2.6 | Implemented |
| FT0.9-ERR-001   | Embedded meta validity | `MetaEmbedded` present requires embedded meta section, otherwise file invalid          | 4.4           | Implemented |
| FT0.9-ERR-002   | Record parsing errors  | Extra trailing chars rejected when `IgnoreExtraChars=False`                            | 4.8           | Implemented |
| FT0.9-ERR-003   | Record parsing errors  | Incomplete records accepted only when `AllowIncompleteRecords=True`                    | 4.8           | Implemented |
