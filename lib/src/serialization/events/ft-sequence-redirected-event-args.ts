import { FtField } from '../../fields/instances/ft-field.js';

/**
 * @public
 */
export interface FtSequenceRedirectedEventArgs {
  redirectingField: FtField;
  fieldsAffectedFromIndex: number;
}
