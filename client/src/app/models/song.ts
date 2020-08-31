export class Song{
    constructor(
        public _id: string,
        public name: string,
        public number: number,
        public duration: string,
        public file: string,
        public album: string
    ){}
}