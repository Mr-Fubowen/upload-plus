import axios from 'axios'
import { Thread } from 'web-worker-enhance'
import { toFileChunk, toChunk } from './common'
import { toByteCount } from './byteUtils'

export const UploadStateEnum = Object.freeze({
    WAITING: 0,
    UPLOADING: 1,
    SUCCESS: 2,
    ERROR: 3
})
export const createProgress = (current, total) => {
    return {
        current: current,
        total: total,
        percentage: Math.round((current / total) * 100)
    }
}
async function sign() {
    if (!this.signatured) {
        return
    }
    if (this.signValue) {
        return this.signValue
    }
    this.signValue = await Thread.run('hashCode', 'hashCode', this.file, {
        on: {
            progress: progress => this.onSignProgress?.call(this, progress)
        }
    })
    return this.signValue
}
async function exists() {
    const response = await axios.post(this.existsUrl, {
        // name: this.uniqueId(),
        sign: await this.sign()
    })
    const { isExist, data } = response.data.data
    this.chunks.forEach(it => {
        if (isExist) {
            it.state = UploadStateEnum.SUCCESS
        } else {
            if (data.some(idx => idx == it.index)) {
                it.state = UploadStateEnum.SUCCESS
            }
        }
    })
    if (isExist) {
        this.state = UploadStateEnum.SUCCESS
    }
    return isExist
}
async function startUpload(batchSize) {
    // if (await this.exists()) {
    //     return
    // }
    let waitingList = this.chunks.filter(it => it.state == UploadStateEnum.WAITING)
    let total = this.chunks.length
    let completedCount = total - waitingList.length
    this.state = UploadStateEnum.UPLOADING
    this.onProgress?.call(this, createProgress(completedCount, total))
    const batchs = toChunk(waitingList.length, batchSize || this.batchSize)
    for (const batch of batchs) {
        const uploading = waitingList.slice(batch.start, batch.end)
        const tasks = uploading.map(async it => {
            it.tokenSource = axios.CancelToken.source()
            it.state = UploadStateEnum.UPLOADING
            let form = new FormData()
            form.append('chunk', it.chunk)
            form.append('index', it.index)
            form.append('total', it.total)
            form.append('sign', this.signValue)
            form.append('name', this.name)
            try {
                const response = await axios.post(this.uploadUrl, form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    cancelToken: it.tokenSource.token,
                    onUploadProgress: event => {
                        it.progress.current = event.loaded
                        it.progress.total = event.total
                        it.progress.percentage = Math.round((event.loaded / event.total) * 100)
                        this.onChunkUploadProgress?.call(this, it, it.progress)
                    }
                })
                const { data, status, statusText } = response
                if (status == 200) {
                    it.state = UploadStateEnum.SUCCESS
                    completedCount++
                    if (data.data.state == 'success') {
                        this.path = data.data.data
                        this.state = UploadStateEnum.SUCCESS
                    }
                    this.onProgress?.call(this, createProgress(completedCount, total))
                } else {
                    it.state = UploadStateEnum.ERROR
                    it.error = statusText
                    this.state = UploadStateEnum.ERROR
                }
            } catch (error) {
                it.state = UploadStateEnum.ERROR
                it.error = error.message
                this.state = UploadStateEnum.ERROR
            }
        })
        await Promise.all(tasks)
    }
    return this.path
}
async function cancel() {
    this.chunks.forEach(it => {
        if (it.state == UploadStateEnum.UPLOADING) {
            it.tokenSource.cancel('取消上传')
        }
    })
}
export function upload(options) {
    const {
        uploadUrl,
        file,
        name,
        chunkSize = '10M',
        existsUrl,
        signValue,
        batchSize = 10,
        onProgress,
        onSignProgress,
        onChunkUploadProgress
    } = options
    return {
        existsUrl,
        uploadUrl,
        file,
        name: name || file.name,
        chunkSize,
        batchSize,
        chunks: toFileChunk(file, toByteCount(chunkSize)).map(it => ({
            chunk: it.chunk,
            index: it.index,
            total: it.total,
            state: UploadStateEnum.WAITING,
            progress: {
                current: 0,
                total: 0,
                percentage: 0
            }
        })),
        state: UploadStateEnum.WAITING,
        path: '',
        signValue,
        signatured: true,
        startUpload,
        exists,
        sign,
        cancel,
        onProgress,
        onSignProgress,
        onChunkUploadProgress
    }
}
