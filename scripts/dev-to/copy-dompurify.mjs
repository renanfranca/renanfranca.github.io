#!/usr/bin/env node
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const rootDirectory = process.cwd();
const source = path.join(rootDirectory, 'node_modules', 'dompurify', 'dist', 'purify.es.mjs');
const targetDirectory = path.join(rootDirectory, 'assets', 'js', 'vendor');
const target = path.join(targetDirectory, 'dompurify.es.mjs');

await mkdir(targetDirectory, { recursive: true });
await copyFile(source, target);
console.log('Updated assets/js/vendor/dompurify.es.mjs.');
