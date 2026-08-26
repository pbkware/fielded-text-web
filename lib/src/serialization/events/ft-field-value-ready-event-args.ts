import { FtField } from '../../fields/instances/ft-field.js';

/**
 * @public
 */
export interface FtFieldValueReadyEventArgs {
  field: FtField;
  recordIndex: number;
}
