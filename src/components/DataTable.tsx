import { For, Show } from 'solid-js';
import prettyPrintJsontoHtml from './pretty-print-json';
import './DataTable.css';

export default function DataTable(props: any) {
	const tableRows = () => (props.rows as any[]);

	const rowClickHandler = (idx: number) => {
		const id = 'row' + `${idx}`
		let row = document.getElementById(id)
		if (!row) return;
		row.hidden ? row.hidden = false : row.hidden = true
		if (!row.hidden) row.scrollIntoView()
	}

	function deleteIndex(rowName: string) {
		props.del(rowName);
	}

	return (<>
		<div>
			<table class="table-fixed w-full">
				<thead class="align-center">
					<tr>
						<th>Name</th>
						<th>Exif</th>
						<th>IPTC</th>
						<th>XMP</th>
					</tr>
				</thead>
				<tbody>
					<For each={tableRows()} fallback={<p>NO DATA</p>}>
						{(row, index) => <>
							<tr class="bordere sm:h-12 align-middle whitespace-pre overflow-hidden"
								onClick={() => rowClickHandler(index())}>
								<td id={'name' + index()} class="overflow-hidden">
									<p class="mx-1">{row.name}</p>
								</td>
								<Show when={Object.keys(row.exif).length !== 0} fallback={<td><p class="mx-1">Empty</p></td>}>
									<td>
										<p class="mx-1">Present</p>
									</td>
								</Show>
								<Show when={Object.keys(row.iptc).length !== 0} fallback={<td><p class="mx-1">Empty</p></td>}>
									<td>
										<p class="mx-1">Present</p>
									</td>
								</Show>
								<Show when={Object.keys(row.xmp).length !== 0} fallback={<td><p class="mx-1">Empty</p></td>}>
									<td>
										<p class="mx-1">Present</p>
									</td>
								</Show>
							</tr>
							<tr id={'row' + index()} class="whitespace-pre-wrap" hidden>
								<td>
									<button class="flex" onClick={() => { rowClickHandler(index()); deleteIndex(row.name); }}>
										<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
											stroke="red" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round"
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
										Remove
									</button>

								</td>
								<td innerHTML={prettyPrintJsontoHtml(row.exif)}></td>
								<td innerHTML={prettyPrintJsontoHtml(row.iptc)}></td>
								<td innerHTML={prettyPrintJsontoHtml(row.xmp)}></td>
							</tr>
						</>}
					</For >
				</tbody >
			</table >
		</div >
	</>);
}
