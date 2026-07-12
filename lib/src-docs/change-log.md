---
title: Change Log
---

## Version 0.2.0 (**Breaking Changes**)

* Rework API for accessing field values

  * `FtField.asXXX` and `FtField.asNullableXXX` accessors now do NOT attempt to coerce value to the required type. If a value is not the correct type, a type exception is thrown.
  * `FtField.asString` does not support null values. Instead use `FtField.asNullableString`. (Aligns with other asXXX accessors.)
  * `FtField.asObject` accessor has been replaced by `FtField.value`.  Its type has changed from `unknown` to `string | boolean | number | bigint | Date` which covers all value types. Use `FtField.value` to access value without being type specific.
  * `FtField.value` will throw a type exception if a value is assigned to it which does not have the expected type.  Note that `Integer` fields accept both `number` and `bigint` type values.
  * `FtField.getValueText()` has been renamed to `FtField.formatValue()`.
  * `FtField.asValueText` getter has been replaced with `FtField.formatValue()` and setter has been replaced with `FtField.loadValueText()`.
  * Readonly accessor `FtField.loadedValueText` has been renamed to `FtField.valueText`.

* Added `Reading` and `Tables` documentation.
