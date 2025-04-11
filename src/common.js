export function toChunk(number, size) {
    const sliceList = []
    const total = Math.ceil(number / size)
    for (let index = 0; index < total; index++) {
        let start = index * size
        let end = Math.min(number, start + size)
        sliceList.push({
            start,
            end,
            index
        })
    }
    return sliceList
}
export function toFileChunk(file, chunkSize) {
    const sliceList = toChunk(file.size, chunkSize)
    const chunkList = []
    for (const slice of sliceList) {
        let chunk = file.slice(slice.start, slice.end)
        chunkList.push({
            chunk: chunk,
            index: slice.index,
            total: sliceList.length
        })
    }
    return chunkList
}
