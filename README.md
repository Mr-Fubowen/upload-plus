# Upload Plus

#### Introduction(介绍)

    对分块上传的简单封装

#### Usage(使用)

```js
import { upload } from 'upload-plus'

const uploadState = upload({
    uploadUrl: 'http://xxx'
    file: event.target.files[0],
    signatured: false,
    onSignProgress: progress => {
        console.log(progress)
    },
})
const signValue = await uploadState.sign()
const result = await uploadState.startUpload()
console.log(signValue,result)
```
