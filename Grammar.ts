export class Grammar {
    VN: Set<string>; 
    VT: Set<string>; 
    P: Map<string, string[]>; 
    S: string;

    constructor(vN: Set<string>, vT: Set<string>, p: Map<string, string[]>, s: string) {
        this.VN = vN;
        this.VT = vT;
        this.P = p;
        this.S = s;
    }

    toString(): string {
        let vNData = "V_n = {" + Array.from(this.VN).join(", ") + "}\n";
        let vTData = "V_t = {" + Array.from(this.VT).join(", ") + "}\n";
        let pData = "P = {\n";
        
        this.P.forEach((value, key) => {
            pData += "\t" + key + " ---> " + value.join(" | ") + "\n";
        });
        
        pData += "}\n";
        let sData = "S = " + this.S + "\n";
        
        return `${vNData}${vTData}${pData}${sData}`;
    }
}
