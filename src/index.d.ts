export interface UploadOptions {
    uploadUrl: string
    file: File
    name: string
    chunkSize: string = '10M'
    existsUrl: string
    signValue: string
    batchSize: number = 10
    onProgress: (progress) => {}
    onSignProgress: (progress) => {}
    onChunkUploadProgress: (progress) => {}
}

export declare enum UploadStateEnum {
    WAITING = 0,
    UPLOADING = 1,
    SUCCESS = 2,
    ERROR = 3
}

export interface ChunkInfo {
    chunk: Blob
    index: number
    total: number
    state: UploadStateEnum
    progress: {
        current: number
        total: number
        percentage: number
    }
}

export interface UploadState extends UploadOptions {
    chunks: ChunkInfo
    state: UploadStateEnum
    path: string
    signatured: true
    startUpload: (batchSize?: number) => string
    exists: () => boolean
    sign: () => string
    cancel: () => void
}

export declare function upload(options: UploadOptions): UploadState
