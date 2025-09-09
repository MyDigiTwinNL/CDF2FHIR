import { InputSingleton } from '../inputSingleton';
import {plasmaAlbumin} from '../lifelines/PlasmaAlbumin'
import {testResultFlagsSNOMEDCodelist} from '../codes/snomedCodeLists';
import { processInput } from '../mapper'
import { MappingTarget } from '../transformationConfig';
import { transformVariables } from '../functionsCatalog';
import {TestResultEntry} from '../fhir-resource-interfaces/laboratoryTestResult'



test('Plasma albumin above reference range', () => {

  const input = {
   
    "albumin_result_all_m_1" :{ "1a": "51"},
    "gender" : { "1a":"MALE"},
    "date": {/*date1*/ "1a":"1990-1","1b":"1995-5","1c":"1997-5",/*date2*/"2a":"2000-1","3a":"2003-5","3b":"2005-5"},
    "age": { "1a": "40" },  //age on "2a": 50  
    "project_pseudo_id": { "1a": "520681571" },
  }  

  
  InputSingleton.getInstance().setInput(input);
  const results = plasmaAlbumin.results();
  expect(results.length).toBe(1);  
  expect((results[0] as TestResultEntry).testResult).toBe(51)
  expect((results[0] as TestResultEntry).resultFlags?.display).toBe("Above reference range")
  
  

});

test('Plasma albumin below reference range', () => {

  const input = {
   
    "albumin_result_all_m_1" :{ "1a": "34"},
    "gender" : { "1a":"MALE"},
    "date": {/*date1*/ "1a":"1990-1","1b":"1995-5","1c":"1997-5",/*date2*/"2a":"2000-1","3a":"2003-5","3b":"2005-5"},
    "age": { "1a": "40" },  //age on "2a": 50  
    "project_pseudo_id": { "1a": "520681571" },
  }  

  
  InputSingleton.getInstance().setInput(input);
  const results = plasmaAlbumin.results();
  expect(results.length).toBe(1);  
  expect((results[0] as TestResultEntry).testResult).toBe(34)
  expect((results[0] as TestResultEntry).resultFlags?.display).toBe("Below reference range")
  
  

});

test('Plasma albumin within the reference range (border case)', () => {

  const input = {
   
    "albumin_result_all_m_1" :{ "1a": "50"},
    "gender" : { "1a":"MALE"},
    "date": {/*date1*/ "1a":"1990-1","1b":"1995-5","1c":"1997-5",/*date2*/"2a":"2000-1","3a":"2003-5","3b":"2005-5"},
    "age": { "1a": "40" },  //age on "2a": 50  
    "project_pseudo_id": { "1a": "520681571" },
  }  

  
  InputSingleton.getInstance().setInput(input);
  const results = plasmaAlbumin.results();
  expect(results.length).toBe(1);  
  
  expect((results[0] as TestResultEntry).resultFlags).toBe(undefined)
  

  

});

test('Plasma albumin within the reference range ', () => {

  const input = {
   
    "albumin_result_all_m_1" :{ "1a": "45"},
    "gender" : { "1a":"MALE"},
    "date": {/*date1*/ "1a":"1990-1","1b":"1995-5","1c":"1997-5",/*date2*/"2a":"2000-1","3a":"2003-5","3b":"2005-5"},
    "age": { "1a": "40" },  //age on "2a": 50  
    "project_pseudo_id": { "1a": "520681571" },
  }  

  
  InputSingleton.getInstance().setInput(input);
  const results = plasmaAlbumin.results();
  expect(results.length).toBe(1);  
  
  expect((results[0] as TestResultEntry).resultFlags).toBe(undefined)


  

});