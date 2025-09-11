
/*
Based on HCIM Problem resource:
https://simplifier.net/packages/nictiz.fhir.nl.stu3.zib2017/1.3.4/files/113638/

Related Lifelines variables:
http://wiki.lifelines.nl/doku.php?id=blood_pressure
*/

import { CodeProperties } from "../codes/codesCollection"

export type BloodPressureReadingEntry = {
    "assessment":string,
    "cuffType": CodeProperties|undefined,
    "measuringLocation": CodeProperties|undefined,
    "systolicBloodPressure": number|undefined,
    "diastolicBloodPressure": number|undefined,
    "arterialBloodPressure": number|undefined,
    "collectedDateTime": string|undefined
}


export interface BloodPressure{

    results(): BloodPressureReadingEntry[]
    
}
