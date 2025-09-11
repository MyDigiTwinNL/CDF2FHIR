import { InputSingleton } from '../inputSingleton';
import { processInput } from '../mapper'
import { MappingTarget } from '../transformationConfig';
import { bloodPressure } from '../__testmappings__/BloodPressure'; 
import {BloodPressureReadingEntry} from '../fhir-resource-interfaces/zib2017bloodPressure';


beforeEach(() => {  
  InputSingleton.getInstance().setUniqueIdentifierVariable({"variableName": "project_pseudo_id", "assessmentName": "1a"})
});


test('BloodPressure values mapping', () => {

  
  const input = {
    "bp_entrytype_all_m_1":         {"1a":"2","2a":"2"},
    "bp_bandsize_all_m_1":          {"1a":"1","2a":"4","3a":"1"},
    "bp_arm_all_m_1":                           {"3a":"2"},
    "bpavg_systolic_all_m_1":       {"1a":"130","2a":"130"},
    "bpavg_diastolic_all_m_1":      {"1a":"140","2a":"140"},
    "bpavg_arterial_all_m_1":       {"1a":"113","2a":"113"},
    "date": {"1a":"1992-5","1b":"1995-5","1c":"1997-5","2a":"2001-5","2b":"2002-5","3a":"2003-5","3b":"2005-5"},
    "project_pseudo_id": { "1a": "520681571" },
  }

  InputSingleton.getInstance().setInput(input);
  const results = bloodPressure.results();
  expect(results.length).toBe(2);  
  expect((results[0] as BloodPressureReadingEntry).systolicBloodPressure).toBe(130)
  expect((results[0] as BloodPressureReadingEntry).diastolicBloodPressure).toBe(140)
  expect((results[1] as BloodPressureReadingEntry).collectedDateTime).toBe("2001-05")
  expect((results[0] as BloodPressureReadingEntry).cuffType?.display).toBe("Klein")
  expect((results[1] as BloodPressureReadingEntry).cuffType?.display).toBe("Kind")

})


test('BloodPressure resource generation ', () => {

  
  const input = {
    "bp_entrytype_all_m_1":         {"1a":"2","2a":"2"},
    "bp_bandsize_all_m_1":          {"1a":"1","2a":"1","3a":"1"},
    "bp_arm_all_m_1":                           {"3a":"2"},
    "bpavg_systolic_all_m_1":       {"1a":"130","2a":"130"},
    "bpavg_diastolic_all_m_1":      {"1a":"140","2a":"140"},
    "bpavg_arterial_all_m_1":       {"1a":"113","2a":"113"},
    "date": {"1a":"1992-5","1b":"1995-5","1c":"1997-5","2a":"2001-5","2b":"2002-5","3a":"2003-5","3b":"2005-5"},
    "project_pseudo_id": { "1a": "520681571" },
  }

  InputSingleton.getInstance().setInput(input);


  const targets: MappingTarget[] = [
    { "template": './zib-2017-mappings/BloodPressure.jsonata', "module": './__testmappings__/BloodPressure'},
  ]
  
  processInput(input,targets).then((output:object[]) => {
    expect(output.length).toBe(2);    
  })

})


test('BloodPressure resource generation with empty values', () => {

  
  const input = {
    "bp_entrytype_all_m_1":         {"1a":"2","2a":"2"},
    "bp_bandsize_all_m_1":          {"1a":"1","2a":"1","3a":"1"},
    "bp_arm_all_m_1":                           {"3a":"2"},
    "bpavg_systolic_all_m_1":       {"1a":"130","2a":""},
    "bpavg_diastolic_all_m_1":      {"1a":"140","2a":""},
    "bpavg_arterial_all_m_1":       {"1a":"113","2a":"113"},
    "date": {"1a":"1992-5","1b":"1995-5","1c":"1997-5","2a":"2001-5","2b":"2002-5","3a":"2003-5","3b":"2005-5"},
    "project_pseudo_id": { "1a": "520681571" },
  }

  const targets: MappingTarget[] = [
    { "template": './zib-2017-mappings/BloodPressure.jsonata', "module": './__testmappings__/BloodPressure'},
  ]
  
  processInput(input,targets).then((output:object[]) => {
    expect(output.length).toBe(2);    
  })




})



