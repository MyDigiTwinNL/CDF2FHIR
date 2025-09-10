import * as parameters from './transformationParameters';
import { v5 as uuidv5 } from 'uuid';
import { InputSingleton } from './inputSingleton';


export type variableAssessments = { [key: string]: string | undefined }
export type transformVariables = { [key: string]: variableAssessments }



/*
 * Create a proxy for JS objects that ensure that the access to non-existing properties generate an error
 * It is intended to be used for the data sent to JSONata to avoid silent errors 
 */
export function createCheckedAccessProxy<T extends object>(obj: T): T {
  const handler: ProxyHandler<T> = {
    get(target, prop, receiver) {
      if (!(prop === 'sequence' || prop === 'then') && !(prop in target)) {
        throw new Error(`Property '${String(prop)}' does not exist in the object:${JSON.stringify(target)}`);
      }
      return Reflect.get(target, prop, receiver);
    }
  };
  return new Proxy(obj, handler);
}

/**
 * Generates a FHIR-compliant UUID based on an unique identified (e.g., participant id)
 */
export const idToUUID = (id: string) => `urn:uuid:${uuidv5(id, parameters.privateNameSpace)}`

/**
 * Function to be used in JSONata for consistent validation of undefined properties/values
 * @param value 
 * @returns 
 */
export const isDefined = (value: unknown) => {
  return value !== undefined
};

/**
 * (Safer) alternative to the regular approach for referencing variables within a JSONata expression,
 * which reports an error if a given variable does not exist. Also useful for getting access to 
 * the input variables within JSONAta bindings (external functions).
 * @param varname of the variable
 * @returns value of the given variable
 */
export const inputValue = (varname: string, wave: string): string | undefined => {
  const assessmentValues = InputSingleton.getInstance().getInput(varname);

  if (assessmentValues === undefined) throw Error(`Variable ${varname} not provided in the input`)
  if (!(wave in assessmentValues)) throw Error(`Assessment ${wave} not available for variable ${varname}`)

  return assessmentValues[wave]

}

export function participantUniqueId(): string | undefined {
  
  const uniqueIdentifier = InputSingleton.getInstance().getUniqueIdentifier();
  if (uniqueIdentifier === undefined){
    throw new Error(`The variable name where the unique identifiers of the patient will be obtained from has not been defined yet.`);    
  }
  else{
    return inputValue(uniqueIdentifier.variableName, uniqueIdentifier.assessmentName);
  }
  
}

export const resourceId = (resourceName: string): string => `${resourceName}-${participantUniqueId()}`

export const waveSpecificResourceId = (resourceName: string, wave: string): string => `${resourceName}-${wave}-${participantUniqueId()}`





/**
 * Returns the map with all the assessments of a given variable.
 * Access to properties not defined in a given variable will raise an error 
 * (a Proxy with this behavior is returned)
 * @param name 
 * @param expectedAssessments assessment expected to be read from the datafile (including potentially missing ones)
 * @returns 
 */
export const inputValues = (varname: string): variableAssessments => {
  const assessmentValues = InputSingleton.getInstance().getInput(varname);
  if (assessmentValues === undefined) throw Error(`Variable ${varname} not provided in the input`)

  return new Proxy(assessmentValues, {
    get(target, property: string) {
      if (!(property in target)) {
        throw new Error(`Property ${String(property)} does not exist in the object ${String(JSON.stringify(target))}.`);
      }
      return target[property];
    }
  });

}


/**
 * Function for echoing strings within a JSONata expression (for debugging purposes)
 * @param text 
 * @returns 
 */
export const echo = (text: string) => console.info(`ECHO: ${text}`);
