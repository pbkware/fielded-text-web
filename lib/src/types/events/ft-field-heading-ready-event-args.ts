import { FtField } from '../../fields/instances/ft-field.js';

/**
 * @public
 */
export interface FtFieldHeadingReadyEventArgs {
  field: FtField;
  lineIndex: number;
}
