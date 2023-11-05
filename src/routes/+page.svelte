<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import * as monaco from 'monaco-editor';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
	import { files } from '$lib/files';
	import { WebContainer } from '@webcontainer/api';

	let editorElement: HTMLDivElement;
	let editor: monaco.editor.IStandaloneCodeEditor;
	let model: monaco.editor.ITextModel;
	let webContainerInstance: WebContainer;
	let containerBooted = false;
	let iframe: HTMLIFrameElement;

	function loadCode(code: string, language: string) {
		model = monaco.editor.createModel(code, language);
		editor.setModel(model);
	}

	onMount(async () => {
		self.MonacoEnvironment = {
			getWorker: function (_: any, label: string) {
				return new tsWorker();
			}
		};

		monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

		editor = monaco.editor.create(editorElement, {
			automaticLayout: true,
			theme: 'vs-dark'
		});

		loadCode(files['code.ts'].file.contents, 'typescript');

		if (containerBooted) return;

		webContainerInstance = await WebContainer.boot();
		containerBooted = true;

		await webContainerInstance.mount(files);

		const exitCode = await installDependencies();
		if (exitCode !== 0) {
			throw new Error('installation failed');
		}

		startDevServer();
	});

	onDestroy(() => {
		monaco?.editor.getModels().forEach((model) => model.dispose());
		editor?.dispose();
	});

	async function installDependencies() {
		console.log('installing dependencies');
		// Install dependencies
		const installProcess = await webContainerInstance.spawn('npm', ['install']);
		installProcess.output.pipeTo(
			new WritableStream({
				write(data) {
					console.log(data);
				}
			})
		);
		// Wait for install command to exit
		return installProcess.exit;
	}

	async function startDevServer() {
		console.log('running npm start');
		// Run `npm run start` to start the Express app
		await webContainerInstance.spawn('npm', ['run', 'start']);

		// Wait for `server-ready` event
		webContainerInstance.on('server-ready', (port, url) => {
			// iframeEl.src = url;
			iframe.src = url;
			console.log('server ready');
		});
	}
</script>

<div class="flex h-screen w-full flex-col">
	<!-- TODO: on:input -->
	<div class="flex-grow" bind:this={editorElement} on:input={() => {}} />

	<iframe
		title="idk"
		class="h-48 w-full border-2 border-emerald-500 bg-slate-800"
		src=""
		frameborder="0"
		bind:this={iframe}
	/>
</div>
