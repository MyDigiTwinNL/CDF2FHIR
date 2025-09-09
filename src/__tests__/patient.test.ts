import { InputSingleton } from '../inputSingleton';
import * as patientmf from '../lifelines/Patient'
import {genderFHIRV3Codes} from '../codes/fhirv3codes'
import { processInput } from '../mapper'
import { MappingTarget } from '../transformationConfig';


beforeEach(() => {
  
  InputSingleton.getInstance().setUniqueIdentifierVariable({"variableName": "project_pseudo_id", "assessmentName": "1a"})
});

test('Male patient', () => {

  
  const input = {
    "age": {"1a":"22"},
    "date": {"1a":"1992-5","1b":"1995-5","1c":"1997-5","2a":"2001-5","3a":"2003-5","3b":"2005-5"},
    "gender": {"1a":"MALE"},
    "date_of_death": {"global":"2010-2"}
  }  

  InputSingleton.getInstance().setUniqueIdentifierVariable({"variableName": "project_pseudo_id", "assessmentName": "1a"})
  InputSingleton.getInstance().setInput(input);
  expect(patientmf.birthDate()).toBe("1970");
  expect(patientmf.gender()).toBe(genderFHIRV3Codes.male)
  expect(patientmf.deceasedDateTime()).toBe("2010-02")
  

});


test('Female patient, undefined age', () => {
  
  const input = {
    "age": {"1a":""},
    "date": {"1a":"1992-5","1b":"1995-5","1c":"1997-5","2a":"2001-5","3a":"2003-5","3b":"2005-5"},
    "gender": {"1a":"FEMALE"},
    "date_of_death": {"global":"2010-2"}
  }  

  InputSingleton.getInstance().setInput(input);
  expect(patientmf.birthDate()).toBe(undefined);
  expect(patientmf.gender()).toBe(genderFHIRV3Codes.female)
  

});



test('Patient resource generation', () => {

  
    const input = {
        "project_pseudo_id": {"1a":"520681571"},
        "age": {"1a":"22"},
        "date": {"1a":"1992-5","1b":"1995-5","1c":"1997-5","2a":"2001-5","3a":"2003-5","3b":"2005-5"},
        "gender": {"1a":"MALE"},
        "date_of_death": {"global":"2010-2"}
        
      }  
      
    const targets: MappingTarget[] = [
      { "template": './zib-2017-mappings/Patient.jsonata', "module": './lifelines/Patient'},
    ]
    
    processInput(input,targets).then((output:object[]) => {
      expect(output.length).toBe(1);    
    })
    
  })
  
      
