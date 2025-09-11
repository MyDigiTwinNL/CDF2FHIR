import { CodeProperties } from 'src/codes/codesCollection';


/*
Based on HCIM resource:
https://simplifier.net/packages/nictiz.fhir.nl.stu3.zib2017/2.2.12/files/2002232/~overview

Related Lifelines variables:
gender, age (See Lifelines data manual)

*/


export interface Zib2017Patient {

    birthDate(): string | undefined

    deceasedDateTime(): string | undefined

    gender(): CodeProperties | undefined

}



