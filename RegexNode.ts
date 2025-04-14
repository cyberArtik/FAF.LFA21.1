export enum RegexNodeType {
    Literal,
    Alternation,
    Concatenation,
    Repetition
}

export class RegexNode {
    type: RegexNodeType;
    value: string = "";
    children: RegexNode[] = [];
    minRepeat: number = 0;
    maxRepeat: number = 0;

    constructor(type: RegexNodeType) {
        this.type = type;
    }
}