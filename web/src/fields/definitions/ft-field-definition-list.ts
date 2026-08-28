import { FtFieldFactory } from '../../factory/ft-field-factory.js';
import { FtDataType } from '../../types/enums/ft-data-type.js';
import { FtFieldDefinition } from './ft-field-definition.js';

/**
 * List of field definitions.
 * @public
 */
export class FtFieldDefinitionList {
  private _items: FtFieldDefinition[] = [];

  get count(): number {
    return this._items.length;
  }

  get(index: number): FtFieldDefinition {
    return this._items[index];
  }

  add(definition: FtFieldDefinition): void {
    this._items.push(definition);
  }

  new(dataType: FtDataType): FtFieldDefinition {
    const definition = FtFieldFactory.createFieldDefinition(dataType, this.count);
    this._items.push(definition);
    return definition;
  }

  clear(): void {
    this._items = [];
  }
}
