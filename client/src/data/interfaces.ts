export interface Flashcard {
    originalStartTime:number
    selectedStartTime?:number
    isStartTimeSetByUser?:boolean
    //
    originalEndTime:number
    selectedEndTime?:number
    isEndTimeSetByUser?:boolean
    //
    originalImageTime:number
    selectedImageTime?:number
    isImageTimeSetByUser?:boolean
    //
    source:string
    furigana?:string
    translation?:string
    notes?:string
}