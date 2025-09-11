import { Zib2017Patient } from '../fhir-resource-interfaces/zib2017patient';
import { inputValue } from '../functionsCatalog';
import { lifelinesDateToISO } from './lifelinesFunctions'
import { CodeProperties, CodesCollection } from '../codes/codesCollection';


/**
 * DISCLAIMER:
 * This file is derived from an implementation originally developed for the MyDigitwin project.
 * It is included here solely to support unit tests in the distribution of this tool.
 * The original version may continue to evolve and remains under active development.
 * This copy does not necessarily reflect the latest or final implementation.
 */


/*
Based on HCIM resource:
https://simplifier.net/packages/nictiz.fhir.nl.stu3.zib2017/2.2.12/files/2002232/~overview

Related Lifelines variables:
gender, age (See Lifelines data manual)

*/


export const patient: Zib2017Patient = {

    birthDate: function (): string | undefined {
        return lifelinesBirthDate();
    },
    deceasedDateTime: function (): string | undefined {
        return lifelinesDeceasedDateTime();
    },
    gender: function (): CodeProperties | undefined {
        return lifelinesGender();
    }

}

/**
 * 
 * @precondition in reported age is defined, it is a number
 * 
 * @returns approximate birthdate given the baseline assessment date and the reported age. Undefined
 *          if there is no reported age or undefined assessment date.
 */
const lifelinesBirthDate = (): string | undefined => {
    const assessmetDate: string | undefined = inputValue("date", "1a")

    if (assessmetDate === undefined) {
        return undefined
    }
    else {
        const surveyDateParts = assessmetDate.split("-");

        const reportedAge: string | undefined = inputValue("age", "1a")

        if (reportedAge != undefined) {
            const surveyAge = Number(reportedAge);
            const surveyYear = Number(surveyDateParts[0]);
            return (surveyYear - surveyAge).toString()
        }
        else {
            return undefined;
        }
    }


}

const lifelinesDeceasedDateTime = (): string | undefined => {
    const dod = inputValue("date_of_death", "global")
    if (dod !== undefined) {
        return lifelinesDateToISO(dod)
    }
    else {
        return undefined;
    }

}

const lifelinesGender = (): CodeProperties | undefined => {

    if (inputValue("gender", "1a") === "MALE") {
        return CodesCollection.getInstance().getFHIRV3Code("M")
    }
    else if (inputValue("gender", "1a") === "FEMALE") {
        return CodesCollection.getInstance().getFHIRV3Code("F")
    }
    else {
        return undefined;
    }
}    
