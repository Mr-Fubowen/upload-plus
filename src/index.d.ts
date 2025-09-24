export interface Progress {
    /**
     * 已处理数目
     */
    current: number
    /**
     * 全部数目
     */
    total: number
    /**
     * 已处理百分比
     */
    percentage: number
}

export interface UploadResullt {
    data: {
        /**
         * 值为 success 则表示文件分块全部上传完成，否则表示当前文件块上传完成
         */
        state?: 'success' | undefined
        /**
         * state 为 success 的时候，startUpload 返回此数据
         * 此数据也会缓存在 UploadState 中的 data 属性中
         */
        data?: unknown
    }
}

export interface UploadOptions {
    /**
     *
     * @returns 请求头的 Authorization 值
     */
    token: () => string
    uploadUrl: string
    upload: () => UploadResullt
    file: File
    name: string
    /**
     * 上传数据块大小（无单位为字节数目，支持单位 K M G T P）
     * @description 上传数据大小 = chunkSize * batchSize
     * @default 10M
     */
    chunkSize: string
    existsUrl: string
    signValue: string
    /**
     * 上传批次大小
     * @description 上传数据大小 = chunkSize * batchSize
     * @default 10
     */
    batchSize: number
    onProgress: (progress: Progress) => {}
    onSignProgress: (progress: Progress) => {}
    onChunkUploadProgress: (chunk: ChunkInfo, progress: Progress) => {}
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
    data: unknown
    signatured: true
    startUpload: (batchSize?: number) => unknown
    exists: () => boolean
    sign: () => string
    cancel: () => void
}

export declare function upload(options: UploadOptions): UploadState
