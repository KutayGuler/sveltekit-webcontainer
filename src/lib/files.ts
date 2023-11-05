import type { FileSystemTree } from '@webcontainer/api';

export const files: FileSystemTree = {
	'code.ts': {
		file: {
			contents: `const x = 5;`
		}
	},
	'package.json': {
		file: {
			// TODO: complete json
			contents: `
      {
        "name": "roguelighter-tutorial",
        "type": "module"
      }`
		}
	}
};
