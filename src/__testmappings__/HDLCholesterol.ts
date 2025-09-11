import {inputValue,createCheckedAccessProxy} from '../functionsCatalog';
import {assesmentMissed,collectedDateTime} from './lifelinesFunctions'
import {Zib2017LaboratoryTestResult, TestResultEntry} from '../fhir-resource-interfaces/zib2017laboratoryTestResult'
import {getSNOMEDCode,getLOINCCode,getUCUMCode,CodeProperties} from '../codes/codesCollection'


/**
 * DISCLAIMER:
 * This file is derived from an implementation originally developed for the MyDigitwin project.
 * It is included here solely to support unit tests in the distribution of this tool.
 * The original version may continue to evolve and remains under active development.
 * This copy does not necessarily reflect the latest or final implementation.
 */


/**
 * A laboratory result describes the result of a laboratory analysis. These are specimen-oriented 
 * tests as performed in laboratories such as Clinical Chemistry, Serology, Microbiology, etc. 
 * In addition to the results of tests with a singular result, this concept can also contain 
 * the results of more complex tests with multiple results or a ‘panel’.
 * 
 * 
 * Related variables:
 * ------------------------------------------------------------------
 *                                [1A][1B][1C][2A][3A][3B]
 * hdlchol_result_all_m_1         [X ][  ][  ][X ][  ][  ]
 * ------------------------------------------------------------------
 * 
 * @precondition hdlResults is a number (not undefined)
 * 
 */


export const hdlCholesterol:Zib2017LaboratoryTestResult = {
    referenceRangeUpperLimit: function (): number | undefined {
        //only lower limit defined for hdl cholesterol
        return undefined;
    },
    referenceRangeLowerLimit: function (): number | undefined {
        return referenceRangeLowerLimit();
    },
    results: function (): TestResultEntry[] {
        const waves = ["1a", "2a"];

        //if the assessment was missed, do not evaluate/create the resource
        return waves.filter((wave) => !assesmentMissed(wave)).map((wave) => createCheckedAccessProxy({
            "assessment": wave,
            "resultFlags": resultFlags(wave),
            "testResult": hdlResults(wave),
            "collectedDateTime": collectedDateTime(wave)
        })
        );
    },
    diagnosticCategoryCoding: function (): CodeProperties[] {
        //laboratory_report,microbiology_procedure
        return [getSNOMEDCode('4241000179101'), getSNOMEDCode('19851009')];
    },
    diagnosticCodeCoding: function (): CodeProperties[] {
        //"HDLc SerPl-sCnc"
        return [getLOINCCode('14646-4')];
    },
    diagnosticCodeText: function (): string {
        return "Cholesterol in HDL [Moles/Vol]";
    },
    observationCategoryCoding: function (): CodeProperties[] {
        //"Laboratory test finding (finding)","display": "Serum chemistry test"
        return [getSNOMEDCode('49581000146104'), getSNOMEDCode('275711006')];
    },
    observationCodeCoding: function (): CodeProperties[] {
        return [getLOINCCode('14646-4')];
    },
    resultUnit: function (): CodeProperties {
        return getUCUMCode('mmol/L');
    },
    labTestName: function (): string {
        return "hdl-chol"
    }
}



const referenceRangeLowerLimit = function():number{
    return 1
};


/*
Based on HCIM Problem resource:
https://simplifier.net/packages/nictiz.fhir.nl.stu3.zib2017/2.2.13/files/2039136

*/



/**
 * @precondition hdlResults is a number (not undefined)
 * @param wave 
 * @returns 
 */
const isHDLBelowReferenceRange = function(wave:string):boolean|undefined{
    const hdlres = hdlResults(wave)    
    if (hdlResults(wave)!=undefined){
        return Number(inputValue("hdlchol_result_all_m_1",wave)) < referenceRangeLowerLimit()    
    }
    else{
        return undefined
    }
    
};

/**
 * 
 * @precondition isHDLBelowReferenceRange is true
 * @param wave 
 * @returns 
 */
const resultFlags = function(wave:string):CodeProperties|undefined{

    if (isHDLBelowReferenceRange(wave)){
        //below_reference_range
        return getSNOMEDCode('281300000');        
    }
    else{
        return undefined
    }
    
};

/**
 * 
 * @param wave 
 * @returns hdl results, or undefined
 */
const hdlResults=function(wave:string):number|undefined{
    const hdlres = inputValue("hdlchol_result_all_m_1",wave);

    if (hdlres!=undefined){
        return Number(hdlres)    
    }
    else{
        return undefined
    }    
};

