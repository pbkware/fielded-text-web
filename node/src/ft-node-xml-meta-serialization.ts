import { FtMeta, FtMetaSerializerOptions, FtXmlMetaSerialization } from '@pbkware/fielded-text-web';
import { PathOrFileDescriptor, readFileSync, writeFileSync } from 'node:fs';

/** @public */
export class FtNodeXmlMetaSerialization extends FtXmlMetaSerialization {
  deserializeFromFile(filePath: PathOrFileDescriptor, warnings?: string[], encoding: BufferEncoding = 'utf-8'): FtMeta {
    const content = readFileSync(filePath, encoding);
    return this.deserialize(content, warnings);
  }

  serializeToFile(meta: FtMeta, filePath: PathOrFileDescriptor, options?: FtMetaSerializerOptions, encoding: BufferEncoding = 'utf-8'): void {
    const content = this.serialize(meta, options);
    writeFileSync(filePath, content, encoding);
  }
}
