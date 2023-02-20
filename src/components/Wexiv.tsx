import { createSignal, Show } from 'solid-js';
import DataTable from './DataTable';
import wexiv from './wasm/wexiv.js';
import './Wexiv.css';

export default function Weiv() {
    const [fileName, setFileName] = createSignal({ name: "" });
    const [preview, setPreview] = createSignal({ url: 'favicon.svg' });
    const [metaData, setMetaData] = createSignal(new Map(), { equals: false });

    const name = 'wexiv'
    const i1 = 'svg > path:nth-of-type(1)'
    const i2 = 'svg > path:nth-of-type(2)'
    const hidden = 'hidden'

    function filezzz(e) {
        const target = e.target
        const file = target.files.item(0)
        const src = URL.createObjectURL(file)
        setPreview({ url: src });
        setFileName({ name: file.name });
    }

    function clearIcon() {
        let icons = document.getElementById('copy')!
        let icon1 = icons.querySelector(i1)!
        if (!icon1.classList.contains(hidden)) icon1.classList.toggle(hidden)
        let icon2 = icons.querySelector(i2)!
        if (!icon2.classList.contains(hidden)) icon2.classList.toggle(hidden)
    }

    function getIndex() {
        try {
            let req = indexedDB.open(name, 3)

            req.onerror = (e) => {
                console.error(e)
            }

            req.onsuccess = (e) => {
                let transaction = req.result.transaction(name, 'readonly')
                transaction.onerror = function (err) {
                    throw err
                }

                let store = transaction.objectStore(name)
                let all = store.getAll()
                all.onerror = function (err) {
                    throw err
                }
                all.onsuccess = function (ev) {
                    let icons = document.getElementById('view')!
                    if (all.result.length === 0) {
                        let icon2 = icons.querySelector(i2)!
                        if (!icon2.classList.contains(hidden)) icon2.classList.toggle(hidden)
                        let icon3 = icons.querySelector('svg > path:nth-of-type(3)')!
                        if (icon3.classList.contains(hidden)) icon3.classList.toggle(hidden)
                        return
                    }
                    all.result.forEach((element) => {
                        setMetaData((current) => { current.set(element.name, element); return current; })
                    });
                    let icon1 = icons.querySelector(i1)!
                    if (!icon1.classList.contains(hidden)) icon1.classList.toggle(hidden)
                    let icon2 = icons.querySelector(i2)!
                    if (icon2.classList.contains(hidden)) icon2.classList.toggle(hidden)
                }
            }
        } catch (e) {
            let icons = document.getElementById('view')!
            let icon2 = icons.querySelector(i2)!
            if (!icon2.classList.contains(hidden)) icon2.classList.toggle(hidden)
            let icon1 = icons.querySelector(i1)!
            if (icon1.classList.contains(hidden)) icon1.classList.toggle(hidden)
            console.error(e)
        }
    }

    function deleteIndex(rowName: string) {
        if (!confirm(rowName + ' metadata storage will be deleted')) {
            return
        }
        let req = indexedDB.open(name, 3)
        req.onerror = (e) => {
            console.error(e)
        }

        req.onsuccess = (e) => {
            let transaction = req.result.transaction(name, 'readwrite')
            transaction.onerror = (err) => {
                console.error(err)
            }

            let store = transaction.objectStore(name)
            let all = store.delete(rowName)
            all.onerror = (err) => {
                console.error(err)
            }
            all.onsuccess = (ev) => {
                setMetaData((current) => { current.delete(rowName); return current; })
            }
        }
    }

    function clearIndex() {
        if (!confirm('All metadata storage will be deleted')) {
            return
        }
        let req = indexedDB.open(name, 3)
        req.onerror = (e) => {
            console.error(e)
        }

        req.onsuccess = (e) => {
            let transaction = req.result.transaction(name, 'readwrite')
            transaction.onerror = (err) => {
                console.error(err)
            }

            let store = transaction.objectStore(name)
            var keyRangeAlpha = IDBKeyRange.bound('A', 'Z')
            var keyRangeNumber = IDBKeyRange.bound('0', '9')
            let all = store.delete(keyRangeAlpha)
            all.onerror = (err) => {
                console.error(err)
            }
            all.onsuccess = (ev) => {
                setMetaData((current) => { current.clear(); return current; })
            }
            all = store.delete(keyRangeNumber)
            location.reload()
        }
    }

    function meta() {
        let icons = document.getElementById('copy')!
        wexiv().then((acc, rej) => {
            if (rej) throw rej
            const files = document.getElementById('files') as HTMLInputElement
            const file = files.files?.item(0)
            if (file) {
                file.arrayBuffer().then((ab) => {
                    try {
                        const tmp = new Uint8Array(ab)
                        const numBytes = tmp.length * tmp.BYTES_PER_ELEMENT
                        const ptr = acc._malloc(numBytes)
                        let heapBytes = acc.HEAPU8.subarray(ptr, ptr + numBytes)
                        heapBytes.set(tmp)
                        const nameBytesUTF8 = acc.lengthBytesUTF8(file.name)
                        const namePtr = acc._malloc(nameBytesUTF8)
                        acc.stringToUTF8(file.name, namePtr, namePtr + nameBytesUTF8)
                        if (acc._getmeta(heapBytes.byteOffset, tmp.length, namePtr) !== 0) {
                            throw "NOT Get Meta"
                        }
                        acc._free(heapBytes.byteOffset)
                        acc._free(namePtr)
                        let icon1 = icons.querySelector(i1)!
                        if (!icon1.classList.contains(hidden)) icon1.classList.toggle(hidden)
                        let icon2 = icons.querySelector(i2)!
                        if (icon2.classList.contains(hidden)) icon2.classList.toggle(hidden)
                        icons.classList.add('steppin')
                    } catch (e) {
                        throw e
                    }
                })
            }
        }).catch((e) => {
            let icon2 = icons.querySelector(i2)!
            if (!icon2.classList.contains(hidden)) icon2.classList.toggle(hidden)
            let icon1 = icons.querySelector(i1)!
            if (icon1.classList.contains(hidden)) icon1.classList.toggle(hidden)
            console.error(e)
        })
        if (icons.classList.contains('steppin')) icons.classList.remove('steppin')
    }

    return (<>
        <div class="grid grid-flow-row gap-3">
            <div class="align-middle py-3">
                1
                <label for="files" onClick={() => clearIcon()}
                    class="px-5 py-2.5 rounded-lg border focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 bg-gray-800 text-gray-400 border-gray-600 hover:text-white hover:bg-gray-700">
                    Choose File
                </label>
                <input id="files" name="files" type="file" accept="image/*" onChange={filezzz} hidden />
            </div>
            <div class="flex">
                <div class="align-middle py-1.5">
                    2
                    <button type="button"
                        class="py-2.5 px-5 mb-2 text-sm font-medium text-gray-400 rounded-lg border border-gray-600 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 bg-gray-800 hover:text-white hover:bg-gray-700"
                        onClick={() => meta()}>Copy Metadata</button>
                    <br />
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" id="copy" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke="red" class="hidden"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke="green" class="hidden"
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
            </div>

            <div>
                <p>{fileName().name}</p>
                <img src={preview().url} class="object-contain" />
            </div>
            <div class="flex">
                <div class="align-middle py-1.5">
                    3
                    <button type="button"
                        class="py-2.5 px-5 mb-2 text-sm font-medium text-gray-400 rounded-lg border border-gray-600 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 bg-gray-800 hover:text-white hover:bg-gray-700"
                        onClick={() => getIndex()}>View Metadata</button>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" id="view" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke="red" class="hidden"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke="green" class="hidden"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke="green" class="hidden"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            </div >
            <div id="datatable">
                <Show when={metaData().size > 0} fallback={<br />}>
                    <DataTable rows={[...metaData().values()]} del={(name: string) => deleteIndex(name)} />
                </Show>
            </div>
        </div >
        <div class="relative bottom-0 mt-20">
            <button type="button"
                class="px-5 py-2.5 rounded-lg border focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 bg-gray-800 text-gray-400 border-gray-600 hover:text-white hover:bg-gray-700"
                onClick={() => clearIndex()}>Clear Metadata Storage</button>
        </div >
    </>);
}