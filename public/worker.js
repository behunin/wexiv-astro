importScripts("wexiv.js");
const wasm = wexiv();
onmessage = function (e) {
    wasm.then((acc, rej) => {
        if (rej) throw rej
        try {
            const tmp = new Uint8Array(e.data[0])
            const name = e.data[1]
            const numBytes = tmp.length * tmp.BYTES_PER_ELEMENT
            const ptr = acc._malloc(numBytes)
            let heapBytes = acc.HEAPU8.subarray(ptr, ptr + numBytes)
            heapBytes.set(tmp)
            const nameBytesUTF8 = acc.lengthBytesUTF8(name)
            const namePtr = acc._malloc(nameBytesUTF8)
            acc.stringToUTF8(name, namePtr, namePtr + nameBytesUTF8)
            if (acc._getmeta(heapBytes.byteOffset, tmp.length, namePtr) !== 0) {
                throw "NOT Get Meta"
            }
            acc._free(ptr)
            acc._free(namePtr)
        } catch (e) {
            throw e
        }
    }).catch((e) => {
        console.error(e)
    })
};

onerror = function (e) {
    console.error(e)
}